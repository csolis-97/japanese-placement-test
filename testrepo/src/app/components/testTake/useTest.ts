"use client";

import { 
  useState, 
  useEffect, 
  useRef, 
  use 
} from "react";
import * as testUtils from "./testActions";
import { QuestionType } from "./testTake";
import { TestQuestion } from "../TestDisplay";
import { InfoData } from "../testStart/startActions";
import { shuffleList } from "@/app/utils/utilFunctions";
import { XORShift128 } from "random-seedable";
import { useTestFlow } from "./useTestFlow";
import { useHandleChange } from "./useHandleChange";

type HookProps = {
  shuffleSeed: XORShift128;
  currentTestInfo: InfoData;
  initialQuestionsPromise: Promise<TestQuestion[]>;
}

export function useTest({
  shuffleSeed, 
  currentTestInfo, 
  initialQuestionsPromise
} : HookProps) {

  const initialQuestions = use(initialQuestionsPromise) as TestQuestion[];  
  // This useState is used to store the questions received from the database
  const [questions, setQuestions] = useState<TestQuestion[]>(() => {
    //let initialQuestionsShuffle = JSON.parse(JSON.stringify(initialQuestions));
    //seedShuffle(shuffleInitial, shuffleSeed);
    const shuffleInitial = shuffleList(initialQuestions, shuffleSeed);
    console.log("INITIAL QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");
    for (let i = shuffleInitial.length - 1; i > -1; i--) {
      console.log(`HERE IS THE QUESTION ID FOR THE CURRENT QUESTION: ${shuffleInitial[i].question_id}`);
      console.log(`HERE ARE THE ANSWER IDS FOR THE CURRENT QUESTION: ${shuffleInitial[i].answer_id}`);
      console.log(`HERE ARE THE ANSWER TEXTS FOR THE CURRENT QUESTION: ${shuffleInitial[i].answer_text}`);
    }
    return shuffleInitial;
  });

  // This useState is used to track the current question
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  //This useState is used for storing the info for the user's answers
  const [answerArray, setAnswerArray] = useState<QuestionType[]>([]);

  //Finally, useState for errors
  const [error, setError] = useState<string | string[] | undefined>('');

  //This useRef will be used to track all info of the stages of the test. Since the number of questions asked is
  //dynamic, use the current question number modulus 5 to determine the current question index.
  let stageInfo = useRef<testUtils.StageData>({
    'stageDifficulty': [initialQuestions[0].question_level],
    'stageNum' : 0,
    'stageQuestion' : currentQuestion % 5,
    'stageQuestionId' : initialQuestions.map((question: any) => question.question_id)
  });

  //This useRef will track the user's graded answers
  const gradedAnswers = useRef<boolean[]>([]);

  //This useRef is used for storing the total number of answers correct per stage
  const correctTotal = useRef<number>(0);

  // Make a const that holds a hook that handles the form operations here
  const flowHook = useTestFlow({
    currentTestInfo, 
    questions, 
    setQuestions, 
    answerArray, 
    setAnswerArray, 
    currentQuestion, 
    stageInfo, 
    gradedAnswers, 
    correctTotal
  });

  const changeHook = useHandleChange({
    questions, 
    answerArray, 
    setAnswerArray, 
    currentQuestion, 
    setCurrentQuestion, 
    stageInfo, 
    correctTotal, 
    gradedAnswers, 
    handleCorrectCount: flowHook.handleCorrectCount, 
    handleQuestionRetrieve: flowHook.handleQuestionRetrieve, 
    handleQuestionSubmit: flowHook.handleQuestionSubmit, 
    handleTestForm: flowHook.handleTestForm
  });
  
  //const correctCount = calculateCorrect(gradedAnswers.current, stageSize);

  // This useEffect will populate the answerArray ONLY when the answerArray is shorter than questions, and questions is not empty
  useEffect(() => {
    if (questions.length > 0 && answerArray.length < questions.length) {
      const initialArray = questions.map((question: any) => ({
        'questionId' : question.question_id,
        'questionText' : '',
        'questionBody' : '',
        'questionCategory' : '',
        'answerId' : [],
        'answerText' : [],
        'userText' : '',
        'alreadyAnswered' : false,
      }));
      setAnswerArray(initialArray);
    }
  }, [questions]);

  return { 
    questions, 
    currentQuestion, 
    answerArray, 
    error, 
    stageInfo, 
    gradedAnswers, 
    correctTotal,
    flowHook,
    changeHook 
  };
}