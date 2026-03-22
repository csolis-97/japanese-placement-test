"use client";

import { 
  useState, 
  useTransition, 
  Dispatch, 
  SetStateAction, 
  RefObject
} from "react";
import * as testUtils from "./testActions";
import { QuestionType } from "./testTake";
import { TestQuestion } from "../TestDisplay";
import { errorType } from "@/app/utils/utilFunctions";

type HandleChangeProps = {
  questions: TestQuestion[];
  answerArray: QuestionType[];
  setAnswerArray: Dispatch<SetStateAction<QuestionType[]>>;
  currentQuestion: number;
  setCurrentQuestion: Dispatch<SetStateAction<number>>;
  stageInfo: RefObject<testUtils.StageData>;
  correctTotal: RefObject<number>;
  gradedAnswers: RefObject<boolean[]>;
  handleCorrectCount: (gradedAnswers: boolean[]) => Promise<void>;
  handleQuestionRetrieve: (event: React.SyntheticEvent) => Promise<void>;
  handleQuestionSubmit: (event?: React.SyntheticEvent, forcedSubmit?: boolean) => Promise<void>;
  handleTestForm: (event: React.SyntheticEvent) => Promise<void>;
  handleForcedTestForm: (forcedSubmit: boolean) => Promise<void>;
  handleForcedRouter: (event: React.SyntheticEvent) => Promise<void>;
};

export function useHandleChange({ 
  questions, 
  answerArray, 
  setAnswerArray, 
  currentQuestion, 
  setCurrentQuestion, 
  stageInfo, 
  correctTotal, 
  gradedAnswers, 
  handleCorrectCount, 
  handleQuestionRetrieve, 
  handleQuestionSubmit, 
  handleTestForm,
  handleForcedTestForm 
} : HandleChangeProps) {

  // This useState will track the user's selected answer for each question
  // THIS USESTATE IS MERELY FOR DEBUG
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  // This useState will be used for displaying the modal, depending on whether the user has submitted the answers
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // This useTransition will be used when new questions are being fetched, to display a loading state
  const [isPending, startTransition] = useTransition();

  // Finally, useState for errors
  const [error, setError] = useState<Error | null>();

  if (error) {
    console.log("AN ERROR OCCURED IN THE USEHANDLECHANGE HOOK: ", error);
    throw error;
  }

  // Here the change in the selection of an answer for the current question will be handled
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This line refers to the name and value fields of an HTML input tag, and uses object destructuring to assign them values from
    // event.target, which itself refers to the HTML element that triggered the event in the first place.
    const {value} = event.target;

    // Track the current Selected Answer here by giving it the user's currently selected answer
    console.log("CURRENT ANSWERARRAY[CURRENTQUESTION]");
    console.log(answerArray[currentQuestion]);
    setSelectedAnswer(value);
    
    // Call the setter function with prevData as its argument, then use it to map each answer to an index. If the index matches currentQuestion,
    // set userText to value and keep the other attributes as is, otherwise do just answer.
    setAnswerArray((prevData) =>
      prevData.map((answer, index) =>
      index === currentQuestion ? {...answer, userText: value} : answer
    ));
    console.log("REPLACED IN ARRAY OF USER'S ANSWERS!!!!");
    console.log(answerArray);
  };

  const handleNextStage = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      event.preventDefault();
      const emptyAnswer = answerArray.filter(answer => answer.userText === "").length;
      // DEBUG CHECK THE TOTAL NUMBER OF EMPTY ANSWERS
      console.log(`TOTAL NUMBER OF QUESTIONS THAT WERE NOT ANSWERED: ${emptyAnswer}`);
      // After the user presses the continue button, the following will be executed
      // If the user did well enough and they have not reached the final stage, move onto the next stage but do not submit the test.
      if (stageInfo.current.stageNum < 4 && correctTotal.current > 3 && emptyAnswer === 0) {
        startTransition(async () => {
          try {
            console.log(`SCORES FOR STAGE ${stageInfo.current.stageNum} WERE SUFFICIENT, MOVE ONTO THE NEXT STAGE.`);
            await handleQuestionRetrieve(event);

            setCurrentQuestion(prev => prev + 1);
            //Reset it before exiting
            setIsSubmitted(false);
          }
          catch(transitionError) {
            console.log("ERROR WAS CAUGHT DURING THE TRANSITION OF THE HANDLENEXTSTAGE OF THE USEHANDLECHANGE HOOK!");
            setError(errorType(transitionError));
            console.log("ERROR WAS SET!");
          }
        });
      }
      // Otherwise, do the following
      else {
        if (stageInfo.current.stageNum > 4) {
          console.log(`USER HAS REACHED THE FINAL STAGE, END THE TEST NOW.`);
        }
        else if (emptyAnswer > 0) {
          console.log(`USER RAN OUT OF TIME, END THE TEST NOW.`);
        }
        else {
          console.log(`SCORES FOR STAGE ${stageInfo.current.stageNum + 1} WERE TOO LOW, END THE TEST NOW.`);
        }
        // Now handle the submission
        await handleTestForm(event);
      }
    }
    catch(error) {
      console.log("ERROR WAS CAUGHT IN THE HANDLENEXTSTAGE OF THE USEHANDLECHANGE HOOK!");
      setError(errorType(error));
      console.log("ERROR WAS SET!");
    }
  };

  //This function handles the logic for the Submit and Next buttons. Do some research on the specific React.stuff here
  const handleButtonChange = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Default behavior of form submission, to send data and reload the page, is prevented here.
    event.preventDefault();
    //Take the name of the event that cause the current call to handleButtonChange
    const {name} = event.currentTarget;

    //Call the setter function with prevData as its argument, then use it to map each answer to an index. If the index matches currentQuestion,
    //set alreadyAnswered to true, the questionId to the current question in the stage, and keep the other attributes as is, otherwise do just answer.
    setAnswerArray((prevData) =>
      prevData.map((answer, index) =>
      index === currentQuestion ? {
        ...answer, 
        questionId: questions[stageInfo.current.stageQuestion].question_id, 
        alreadyAnswered: true
      } : answer
    ));

    //Logic for the Test Submit Button
    if (name === 'submitButton') {
      // Wait for the question to be submitted before going any further
      await handleQuestionSubmit(event);

      // Await the correct number of answers for the stage before moving on
      await handleCorrectCount(gradedAnswers.current);

      //Set submitted to true so that the modal can be displayed
      setIsSubmitted(true);
    }
    // Logic for the Next button
    else {
      setCurrentQuestion(prev => prev + 1);
      //Also set the current stage's question too
      stageInfo.current.stageQuestion = stageInfo.current.stageQuestion + 1;
    }
  };

  // This function is similar to part of the code inhandleButtonChange, except for forced submissions, so it has no arguments
  const handleForceSubmit = async (forcedSubmit: boolean) => {
    // Call the setter function with prevData as its argument, then use it to map each answer to an index. If the index matches currentQuestion,
    // set alreadyAnswered to true, the questionId to the current question in the stage, and keep the other attributes as is, otherwise do just answer.
    setAnswerArray((prevData) =>
      prevData.map((answer, index) =>
      index === currentQuestion ? {
        ...answer, 
        questionId: questions[stageInfo.current.stageQuestion].question_id, 
        alreadyAnswered: true
      } : answer
    ));

    // Use this const to check if the answers were already graded. If so, skip the await functions below
    const alreadyGradedCheck = gradedAnswers.current.filter(Boolean).length;
    console.log(`HERE ARE THE RESULTS OF ALREADYGRADEDCHECK: ${alreadyGradedCheck}`);
    if (gradedAnswers.current.length != answerArray.length) {
    // Wait for the question to be submitted before going any further. Since we are not using an event here, make the first argument undefined
    await handleQuestionSubmit(undefined, forcedSubmit);

    // Await the correct number of answers for the stage before moving on
    await handleCorrectCount(gradedAnswers.current);

    //Set submitted to true so that the modal can be displayed
    setIsSubmitted(true);
    }
  }

  return {
    selectedAnswer,
    isSubmitted,
    isPending,
    handleChange, 
    handleNextStage, 
    handleButtonChange,
    handleForceSubmit
  };
}