"use client";

import { 
  useState, 
  useRef, 
  use 
} from "react";
import { XORShift128 } from "random-seedable";
import { useTestFlow } from "./useTestFlow";
import { useHandleChange } from "./useHandleChange";
import { TestQuestion } from "@/types/sharedInterface";
import { InfoData, StageData, UserAnswerType} from "@/types/sharedType";
import { errorType, shuffleList, shuffleResultsPrint } from "@/utils/utilFunctions";

type HookProps = {
  shuffleSeed: XORShift128;
  currentTestInfo: InfoData;
  initialQuestionsPromise: Promise<TestQuestion[]>;
};

export function useTest({ shuffleSeed, currentTestInfo, initialQuestionsPromise } : HookProps) {
  // Store the initial questions received
  const initialQuestions = use(initialQuestionsPromise) as TestQuestion[];  
  // This useState is used to store the questions received from the database
  const [questions, setQuestions] = useState<TestQuestion[]>(() => {
    const shuffleInitial = shuffleList(initialQuestions, shuffleSeed);
    console.log("INITIAL QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");
    // DEBUG, print the shuffled questions to ensure it worked properly
    shuffleResultsPrint(shuffleInitial);
    return shuffleInitial;
  });

  // This useState is used to track the current question
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  // This useState is used for storing the info for the user's answers
  // const [answerArray, setAnswerArray] = useState<UserAnswerType[]>([]);
  const [answerArray, setAnswerArray] = useState<UserAnswerType[]>(() => {
    const initialArray = questions.map((question: TestQuestion) => ({
    'questionId' : question.question_id,
    'userText' : '',
    'alreadyAnswered' : false,
  }));
    return initialArray;
  });

  // This useState simply tracks whether or not the test has been submitted
  const [testIsSubmitted, setTestIsSubmitted] = useState<boolean>(false);

  // Finally, useState for errors
  const [error, setError] = useState<Error | null>();

  // This useRef will be used to track all info of the stages of the test. Since the number of questions asked is
  // dynamic, use the current question number modulus 5 to determine the current question index.
  let stageInfo = useRef<StageData>({
    'stageDifficulty': [initialQuestions[0].question_level],
    'stageNum' : 0,
    'stageQuestion' : currentQuestion % 5,
    'stageQuestionId' : initialQuestions.map((question: any) => question.question_id)
  });

  // This useRef will track all of the question IDs used, regardless of stage
  const questionIdTrack = useRef<number[]>([]);

  // This useRef will track the user's graded answers
  const gradedAnswers = useRef<boolean[]>([]);

  // This useRef is used for storing the total number of answers correct per stage
  const correctTotal = useRef<number>(0);

  const flowHook = useTestFlow({
    state: { currentTestInfo, questions, currentQuestion, answerArray },
    setState: { setQuestions, setAnswerArray },
    ref: { stageInfo, questionIdTrack, gradedAnswers, correctTotal }
  });

  // Make another const for handling the changes in the UI here
  const changeHook = useHandleChange({
    state: { questions, currentQuestion, answerArray },
    setState: { setCurrentQuestion, setAnswerArray, setTestIsSubmitted },
    ref: { stageInfo, gradedAnswers, correctTotal },
    func: { 
      handleQuestionRetrieve: flowHook.handleQuestionRetrieve, 
      handleQuestionSubmit: flowHook.handleQuestionSubmit, 
      handleTestForm: flowHook.handleTestForm 
    }
  });
  
  if (error) {
    console.log("AN ERROR OCCURED IN THE USETEST HOOK: ", error);
    throw error;
  }

  try {
    if (!flowHook) {
      console.log("THERE WAS AN ERROR WITH FLOWHOOK IN THE USETEST HOOK!");
      throw new Error("An error occured with flowHook.");
    }
    if (!changeHook) {
      console.log("THERE WAS AN ERROR WITH CHANGEHOOK IN THE USETEST HOOK!");
      throw new Error("An error occured with changeHook.");
    }
  }
  catch(error) {
    console.log("ERROR WAS CAUGHT IN THE THE USETEST HOOK!");
    setError(errorType(error));
    console.log("ERROR WAS SET!");
  }

  return { 
    questions, currentQuestion, answerArray,
    testIsSubmitted, error, stageInfo, 
    gradedAnswers, correctTotal,
    flowHook, changeHook
  };
}