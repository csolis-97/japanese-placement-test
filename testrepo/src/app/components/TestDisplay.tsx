"use client";

import { useState, useEffect, Suspense } from "react";
import TestStart from "./testStart/testStart";
import TestTake from "./testTake/testTake";
import { infoData } from "./testStart/startActions";
import { QuestionDisplaySkeleton } from "./skeletons";
import { seedCreate } from "../utils/utilFunctions";
import { XORShift128 } from "random-seedable";

//Interface below will be used for when each question itself is displayed. Fields should be the exact same as the ones in
//the database in order to be properly displayed.
export interface testQuestion {
  question_id: number;
  question_text: string;
  question_body: string;
  question_level: string;
  answer_id: number[];
  answer_text: string[];
  already_answered?: boolean;
  correct_answer?: boolean[];
  is_correct?: boolean;
}

// This component receives a prop, which uses a type of string array, as the initial question data to be used
export default function TestDisplay( {initialQuestionsPromise} : {initialQuestionsPromise: Promise<testQuestion[]>} ) {
  
  //This useState will be used to set which component to display.
  const [currentDisplay, setCurrentDisplay] = useState<string>('start');

  //This useState will track test info, specifically the score ID used in the database for the record, alongside the user's current attempt number,
  //the email they entered, and their name.
  const [testInfo, setTestInfo] = useState<infoData>({
  'resultId' : 0,
  'userAttempt' : 0,
  'email' : "",
  'name' : ""
  });

  // The shuffleSeed variable will hold the seed for the test, once the userAttempt and resultId fields have been set
  let shuffleSeed: XORShift128 | null = null;

  if (testInfo.resultId !== 0 && testInfo.userAttempt !== 0 && shuffleSeed == null) {
    console.log("ABOUT TO SET THE SHUFFLE SEED!");
    shuffleSeed = seedCreate([testInfo.userAttempt, (testInfo.userAttempt % testInfo.resultId), testInfo.resultId]);
    console.log(`SHUFFLE SEED SET TO ${shuffleSeed}`);
  }

  useEffect(() => {
    //console.log(`HERE IS WHAT WAS RECEIVED FROM THE SERVER: ${initialQuestionsPromise}`);
    initialQuestionsPromise.then(data => {
        console.log(`HERE IS WHAT WAS RECEIVED FROM THE SERVER: ${data}`);
      }
    )
    console.log(`HERE IS THE CURRENT VALUES OF TESTINFO: ${testInfo}`);
  }, []);

  return (
    <>
    { // Render on start
        currentDisplay === "start" && (
        <TestStart initialTestInfo = {testInfo} setInitialTestInfo = {setTestInfo} currentDisplay = {currentDisplay} setCurrentDisplay = {setCurrentDisplay}/>
        )
    }
    { // Render only once currentDisplay is switched to test, and the shuffleSeed has been set
        currentDisplay === "test" && (
        <Suspense fallback = {<QuestionDisplaySkeleton />}>
          { shuffleSeed && shuffleSeed !== null ? (
            <TestTake shuffleSeed = {shuffleSeed} currentTestInfo = {testInfo} initialQuestionsPromise = {initialQuestionsPromise}/>
          ) : (
            <QuestionDisplaySkeleton />
          )
          }
        </Suspense>
        )
    }
    </>)
}