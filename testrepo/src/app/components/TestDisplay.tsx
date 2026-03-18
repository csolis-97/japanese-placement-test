"use client";

import { useState, useEffect, Suspense } from "react";
import { XORShift128 } from "random-seedable";
import TestStart from "./testStart/testStart";
import TestTake from "./testTake/testTake";
import { InfoData } from "./testStart/startActions";
import { QuestionDisplaySkeleton, ButtonSkeleton } from "./skeletons";
import { errorType, seedCreate } from "../utils/utilFunctions";

//Interface below will be used for when each question itself is displayed. Fields should be the exact same as the ones in
//the database in order to be properly displayed.
export interface TestQuestion {
  question_id: number;
  question_text: string;
  question_body: string;
  question_level: string;
  answer_id: number[];
  answer_text: string[];
  already_answered?: boolean;
  correct_answer?: boolean[];
  is_correct?: boolean;
};

// This component receives a prop, which uses a type of string array, as the initial question data to be used
export default function TestDisplay({initialQuestionsPromise} : {initialQuestionsPromise: Promise<TestQuestion[]>}) {
  
  // This useState will be used to set which component to display.
  const [currentDisplay, setCurrentDisplay] = useState<string>('start');

  // This useState will track test info, specifically the score ID used in the database for the record, alongside the user's current attempt number,
  // the email they entered, and their name.
  const [testInfo, setTestInfo] = useState<InfoData>({
  'resultId' : 0,
  'userAttempt' : 0,
  'email' : "",
  'name' : ""
  });

  // Finally, useState for errors
  const [error, setError] = useState<Error | null>();

  // The shuffleSeed variable will hold the seed for the test, once the userAttempt and resultId fields have been set
  let shuffleSeed: XORShift128 | null = null;

  if (error) {
    console.log("AN ERROR OCCURED IN TESTDISPLAY: ", error);
    throw error;
  }

  if (testInfo.resultId !== 0 && testInfo.userAttempt !== 0 && shuffleSeed == null) {
    console.log("ABOUT TO SET THE SHUFFLE SEED!");
    shuffleSeed = seedCreate([
      testInfo.userAttempt, 
      (testInfo.userAttempt % testInfo.resultId), 
      testInfo.resultId
    ]);
    console.log(`SHUFFLE SEED SET TO ${shuffleSeed}`);
  }

  // This useEffect will re-render whenever there is a change to initialQuestionsPromise
  // It chains to function calls, one to print the data and another to throw any errors
  useEffect(() => {
    initialQuestionsPromise
    .then(data => {
        console.log("HERE IS WHAT WAS RECEIVED FROM THE SERVER: ", data);
    })
    /*.catch(dataError => {
      console.log("THERE WAS AN ERROR WITH THE INITIAL TEST QUESTIONS PROMISE: ", dataError);
      setError(dataError);
    });*/
  }, [initialQuestionsPromise]);

  // This useEffect is merely for debug, it will display the test info whenever it changes
  useEffect(() => {
    console.log(`HERE IS THE CURRENT VALUES OF TESTINFO: ${testInfo}`);
  }, [testInfo]);

  return (
    <>
    { // Render on start
      currentDisplay === "start" && (
        <TestStart 
          initialTestInfo = {testInfo} 
          setInitialTestInfo = {setTestInfo} 
          currentDisplay = {currentDisplay} 
          setCurrentDisplay = {setCurrentDisplay}
        />
      )
    }
    { // Render only once currentDisplay is switched to test, and the shuffleSeed has been set
      currentDisplay === "test" && (
        <Suspense fallback = {
          <>
            <div className = "flex flex-col space-y-4 items-start justify-start py-32">
              <QuestionDisplaySkeleton />
            </div>
            <div className = "flex w-full justify-end">
              <ButtonSkeleton />
            </div>
          </>
        }>
        { shuffleSeed && shuffleSeed !== null ? (
            <TestTake 
              shuffleSeed = {shuffleSeed} 
              currentTestInfo = {testInfo} 
              initialQuestionsPromise = {initialQuestionsPromise}
            />
          ) : (
            <>
              <div className = "flex flex-col space-y-6 items-start justify-start py-27">
                <QuestionDisplaySkeleton />
                <div className = "flex w-full justify-end">
                  <ButtonSkeleton />
                </div>
              </div>
            </>
          )
        }
        </Suspense>
      )
    }
    </>)
}