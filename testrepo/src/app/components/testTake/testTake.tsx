"use client";

import { useEffect, useState } from "react";
import { XORShift128 } from "random-seedable";
import { useTest } from "./useTest";
import QuestionDisplay from "../QuestionDisplay";
import StageComplete from "../StageComplete";
import Timer from "../Timer";
import { InfoData } from "../testStart/startActions";
import { TestQuestion } from "../TestDisplay";
import { errorType } from "@/app/utils/utilFunctions";

// Type defined below will be used for setting the test questions and answers
export type QuestionType = {
  questionId: number;
  questionText: string;
  questionBody: string;
  questionCategory: string;
  answerId: number[];
  answerText: string[];
  userText: string;
  alreadyAnswered: boolean;
}

// This interface will be used to properly receive the useState and data which are passed to the component
interface TestProps {
  shuffleSeed: XORShift128;
  currentTestInfo: InfoData;
  initialQuestionsPromise: Promise<TestQuestion[]>;
}

export default function TestTake({shuffleSeed, currentTestInfo, initialQuestionsPromise} : TestProps) {

  // useState for tracking the state of the test timer
  const [testTimerOver, setTestTimerOver] = useState<boolean>(false);

  // useState for errors
  const [error, setError] = useState<Error | null>();

  // Get the useTest hook
  const testHook = useTest({shuffleSeed, currentTestInfo, initialQuestionsPromise});

  const timerHandle = () => {
    setTestTimerOver(true);
  };

  const timerForcedSubmission = () => {
    testHook.changeHook.handleForceSubmit();
    testHook.flowHook.handleForcedTestForm(testTimerOver);
  }

  if (error) {
    console.log("AN ERROR OCCURED IN TESTTAKE: ", error);
    throw error;
  }

  // Check if testHook works correctly, otherwise throw an error
  try {
    if (!testHook) {
      console.log("THERE WAS AN ERROR WITH TESTHOOK IN TESTTAKE!");
      throw new Error("An error occured with testHook.");
    }
  }
  catch(error) {
    console.log("ERROR WAS CAUGHT IN TESTTAKE!");
    setError(errorType(error));
    console.log("ERROR WAS SET!");
  }

  // RIGHT NOW EACH STAGE IS HARDCODED TO BE JUST 5 QUESTIONS, SO CHECK HERE IF THAT EVER CHANGES!
  const STAGE_SIZE = testHook.questions.length;

  //These variables will be used for checking when to disable and enable certain buttons
  const IS_FIRST_QUESTION = testHook.stageInfo.current.stageQuestion === 0;
  const IS_LAST_QUESTION = testHook.stageInfo.current.stageQuestion >= STAGE_SIZE - 1;

  console.log("CURRENT STAGE SIZE");
  console.log(STAGE_SIZE);
  console.log("IS_LAST_QUESTION?");
  console.log(IS_LAST_QUESTION);

  //These variables will apply the styling for the regular and disabled buttons
  const buttonDefaults = "mt-4 px-8 py-4 font-semibold text-sm text-white";
  const regularButton = "bg-[#d1190d] hover:bg-[#700f09]";
  const disabledButton = "bg-gray-500";

  useEffect(() => {
    if (testTimerOver) {
      console.log("TIME IS UP, TRIGGER THE FORCED SUBMISSION!");
      timerForcedSubmission();
      console.log("TEST SUBMISSION FORCED!");
    }
  }, [testTimerOver]);

  // FOR DEBUG. This useEffect will track all current relevant info needed
  useEffect(() => {
    console.log("CURRENT SELECTED ANSWER");
    console.log(testHook.changeHook.selectedAnswer);
    console.log("ABOUT TO ENTER THE HTML!");
    console.log(testHook.questions);
    console.log("CURRENT QUESTION!");
    console.log(testHook.currentQuestion);
    console.log("CURRENT FIRST AND LAST CHECKS");
    console.log(IS_FIRST_QUESTION, IS_LAST_QUESTION);

    console.log("CURRENT STATUS OF ANSWER ARRAY");
    console.log(testHook.answerArray);
    console.log("LENGTH OF THE ANSWER ARRAY");
    console.log(testHook.answerArray.length);

    console.log("CURRENT LIST OF GRADED ANSWERS");
    console.log(testHook.gradedAnswers);
    console.log("CURRENT LIST OF STAGE VALUES");
    console.log(testHook.stageInfo.current.stageDifficulty);
    console.log("CURRENT STAGE");
    console.log(testHook.stageInfo.current.stageNum);
    console.log("DISPLAY THE CURRENT QUESTION OF THE CURRENT STAGE");
    console.log(testHook.stageInfo.current.stageQuestion);

    console.log("CURRENT TEST INFO WHILE TAKING THE TEST");
    console.log(currentTestInfo);
    console.log("HAS THE STAGE BEEN SUBMITTED?");
    console.log(testHook.changeHook.isSubmitted);
  }, [
    testHook.changeHook.selectedAnswer, 
    testHook.questions, testHook.currentQuestion, 
    testHook.answerArray, 
    testHook.changeHook.isSubmitted
  ]);
  
  //HTML return for the test form page
  return (
    <div className = "w-full flex min-h-screen items-center">
        {
          // Await the correct number of answers for the stage before moving on, OR if the timer runs out
          (testHook.changeHook.isSubmitted || testTimerOver) && (
          <StageComplete
            stageNum = {testHook.stageInfo.current.stageNum}
            stagePassed = {testHook.correctTotal.current > 3 ? true : false}
            difficultyLevel = {testHook.stageInfo.current.stageDifficulty[testHook.stageInfo.current.stageNum]}
            totalQuestions = {testHook.questions.length}
            totalCorrect = {testHook.correctTotal.current}
            testTimerOver = {testTimerOver}
            onButtonChange = {testTimerOver ? (testHook.flowHook.handleForcedRouter) : (testHook.changeHook.handleNextStage)}
          />)
        }
        <form name = "placeTest" onSubmit = {testHook.flowHook.handleTestForm} className = "flex flex-col space-y-4 items-start justify-start">
          <Timer timerOver = {timerHandle} />
          {
            //If questions exists and its length is greater than 0, or currentQuestion is less than the length, display the current question
            testHook.questions && testHook.questions[testHook.stageInfo.current.stageQuestion] && testHook.answerArray[testHook.currentQuestion] && (
              <QuestionDisplay
                questionId = {testHook.currentQuestion + 1}
                questionText = {testHook.questions[testHook.stageInfo.current.stageQuestion].question_text}
                questionBody = {testHook.questions[testHook.stageInfo.current.stageQuestion].question_body}
                questionCategory = {testHook.questions[testHook.stageInfo.current.stageQuestion].question_level}
                answerId = {testHook.questions[testHook.stageInfo.current.stageQuestion].answer_id}
                answerText = {testHook.questions[testHook.stageInfo.current.stageQuestion].answer_text}
                selectedAnswer = {testHook.answerArray[testHook.currentQuestion]?.userText}
                alreadyAnswered = {testHook.answerArray[testHook.currentQuestion]?.alreadyAnswered}
                //Send the handleChange const as the value for onChangeValue so that the onChange field can be properly handled
                onChangeValue = {testHook.changeHook.handleChange}
              />)
          }
          <div className = "flex w-full justify-end">
            { IS_LAST_QUESTION ? (
              <button 
                type = "submit" 
                form = "placeTest" 
                name = "submitButton" 
                className = {`
                  min-w-[1rem] min-h-[1rem]
                  ${buttonDefaults} 
                  // If it is not the last question, the stage was submitted, or if the user has not selected an answer, used the disabled style. Otherwise use regular.
                  ${!IS_LAST_QUESTION || testHook.changeHook.isSubmitted || !testHook.answerArray[testHook.currentQuestion]?.userText ? (disabledButton) : (regularButton)}
                `}
                disabled = { // If it is not the last question, the stage was submitted, or if the user has not selected an answer
                !IS_LAST_QUESTION || testHook.changeHook.isSubmitted || !testHook.answerArray[testHook.currentQuestion]?.userText
                }
                onClick = {testHook.changeHook.handleButtonChange}
              >
                Submit Answers
              </button>
            ) : (
              <button 
                type = "button" 
                form = "placeTest" 
                name = "next" 
                className = {`
                  ${buttonDefaults} 
                  // If the user has not selected an answer, used the disabled style. Otherwise use regular.
                  ${!testHook.answerArray[testHook.currentQuestion]?.userText ? (disabledButton) : (regularButton)}
                `}
                disabled = { // If the user has not selected an answer
                  !testHook.answerArray[testHook.currentQuestion]?.userText
                }
                onClick = {testHook.changeHook.handleButtonChange}
              >
                Next
              </button>
            )}
          </div>
        </form>
    </div>
  );
}