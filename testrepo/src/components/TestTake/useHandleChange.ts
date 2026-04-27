"use client";

import { 
  useState, 
  useTransition, 
  Dispatch, 
  SetStateAction, 
  RefObject
} from "react";
import { updateCurrentAnswer } from "./TestUtilities";
import { TestQuestion } from "@/types/sharedInterface";
import { StageData, UserAnswerType } from "@/types/sharedType";
import { errorType } from "@/utils/utilFunctions";

type HandleChangeProps = {
  state: {
    questions: TestQuestion[];
    currentQuestion: number;
    answerArray: UserAnswerType[]; 
  },
  setState: {
    setAnswerArray: Dispatch<SetStateAction<UserAnswerType[]>>;
    setCurrentQuestion: Dispatch<SetStateAction<number>>;
    setTestIsSubmitted: Dispatch<SetStateAction<boolean>>;
  },
  ref: {
    stageInfo: RefObject<StageData>;
    correctTotal: RefObject<number>;
  },
  func: {
    handleQuestionRetrieve: (event: React.SyntheticEvent) => Promise<void>;
    handleQuestionSubmit: (event?: React.SyntheticEvent, forcedSubmit?: boolean) => Promise<void>;
    handleTestForm: (event: React.SyntheticEvent) => Promise<void>;
  }
};

export function useHandleChange({ state, setState, ref, func } : HandleChangeProps) {
  const { questions, currentQuestion, answerArray } = state;
  const { setAnswerArray, setCurrentQuestion, setTestIsSubmitted} = setState;
  const { stageInfo, correctTotal } = ref;
  const { handleQuestionRetrieve, handleQuestionSubmit, handleTestForm } = func;

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
        // Set the test as submitted
        setTestIsSubmitted(true);
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

    // setAnswerArray using prevData to update the currentQuestion's value and its question_id
    setAnswerArray((prevData) => {
      const newAnswerArray = updateCurrentAnswer(prevData, currentQuestion, questions[stageInfo.current.stageQuestion].question_id);
      return newAnswerArray;
    });

    // Logic for the Test Submit Button
    if (name === 'submitButton') {
      try {
        await handleQuestionSubmit(event);
        // Set submitted to true so that the modal can be displayed
        setIsSubmitted(true);
      }
      catch (error) {
        console.log("ERROR WAS CAUGHT IN THE HANDLEBUTTONCHANGE OF THE USEHANDLECHANGE HOOK!");
        setError(errorType(error));
        console.log("ERROR WAS SET!");    
      }
    }
    // Logic for the Next button
    else {
      setCurrentQuestion(prev => prev + 1);
      // Also set the current stage's question too
      stageInfo.current.stageQuestion = stageInfo.current.stageQuestion + 1;
    }
  };

  // This function is similar to part of the code inhandleButtonChange, except for forced submissions, so it has no arguments
  const handleForcedStageSubmit = async (forcedSubmit: boolean) => {
    // setAnswerArray using prevData to update the currentQuestion's value and its question_id
    setAnswerArray((prevData) => {
      const newAnswerArray = updateCurrentAnswer(prevData, currentQuestion, questions[stageInfo.current.stageQuestion].question_id);
      return newAnswerArray;
    });
    try {
      // no event, so make it undefined here
      await handleQuestionSubmit(undefined, forcedSubmit);
        // Set submitted to true so that the modal can be displayed
        setIsSubmitted(true);
        // Set the test as submitted
        setTestIsSubmitted(true);
    }
    catch (error) {
      console.log("ERROR WAS CAUGHT IN THE HANDLEBUTTONCHANGE OF THE USEHANDLECHANGE HOOK!");
      setError(errorType(error));
      console.log("ERROR WAS SET!");    
    }
  }

  return {
    selectedAnswer, isSubmitted, isPending,
    handleChange, handleNextStage, 
    handleButtonChange, handleForcedStageSubmit
  };
}