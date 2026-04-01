"use client";

import { useState, useEffect, Suspense } from "react";
import { XORShift128 } from "random-seedable";
import TestStart from "./TestStart";
import TestTake from "./TestTake/TestTake";
import { TimerSkeleton, QuestionDisplaySkeleton, ButtonSkeleton } from "./skeletons";
import { seedCreate } from "../utils/utilFunctions";
import { TestQuestion } from "@/types/sharedInterface";
import { InfoData } from "@/types/sharedType";

export default function TestDisplay() {
  // This useState will be used to set which component to display.
  const [currentDisplay, setCurrentDisplay] = useState<string>('start');

  // This useState will track test info, specifically the score ID used in the database for the record, alongside the user's current attempt number,
  // the email they entered, and their name.
  const [testInfo, setTestInfo] = useState<InfoData>({
    'resultId' : 0,
    'attemptId' : 0,
    'email' : "",
    'name' : ""
  });

  const [initialQuestionsPromise, setInitialQuestionsPromise] = useState<Promise<TestQuestion[]>>();

  // Finally, useState for errors
  const [error, setError] = useState<Error | null>();

  // The shuffleSeed variable will hold the seed for the test, once the attemptId and resultId fields have been set
  let shuffleSeed: XORShift128 | null = null;

  if (error) {
    console.log("AN ERROR OCCURED IN TESTDISPLAY: ", error);
    throw error;
  }

  if (testInfo.resultId !== 0 && testInfo.attemptId !== 0 && shuffleSeed == null) {
    console.log("ABOUT TO SET THE SHUFFLE SEED!");
    shuffleSeed = seedCreate([
      testInfo.attemptId, 
      (testInfo.attemptId % testInfo.resultId), 
      testInfo.resultId
    ]);
    console.log(`SHUFFLE SEED SET TO ${shuffleSeed}`);
  }

  // This useEffect will re-render whenever there is a change to initialQuestionsPromise.
  // It chains to function calls, one to print the data and another to throw any errors
  useEffect(() => {
    if (initialQuestionsPromise) {
      initialQuestionsPromise
      .then(data => {
          console.log("HERE IS WHAT WAS RECEIVED FROM THE SERVER: ", data);
      })
    }
  }, [initialQuestionsPromise]);

  // This useEffect is merely for debug, it will display the test info whenever it changes
  // For objects, make sure that they are passed as a seperate argument
  useEffect(() => {
    console.log("HERE IS THE CURRENT VALUES OF TESTINFO: ", testInfo);
    console.log(`CURRENT DISPLAY VALUE?: ${currentDisplay}`);
  }, [testInfo, currentDisplay]);

  return (
    <>
      { // Render on start
        currentDisplay === "start" && (
          <TestStart 
            initialTestInfo = {testInfo} 
            setInitialTestInfo = {setTestInfo} 
            setCurrentDisplay = {setCurrentDisplay}
            setInitialQuestionsPromise = {setInitialQuestionsPromise}
          />
        )
      }
      { // Render only once currentDisplay is switched to test, and the shuffleSeed has been set
        currentDisplay === "test" && shuffleSeed && initialQuestionsPromise && (
          <Suspense fallback = {
            <div className = "w-full flex min-h-screen items-center">
              <div className = "flex flex-col items-start justify-start">
                <TimerSkeleton />
                <QuestionDisplaySkeleton />
                <div className = "flex w-full justify-end">
                  <ButtonSkeleton />
                </div>
              </div>
            </div>
          }>
            <TestTake 
              shuffleSeed = {shuffleSeed} 
              currentTestInfo = {testInfo} 
              initialQuestionsPromise = {initialQuestionsPromise}
            />
          </Suspense>
        )
      }
    </>
  );
}