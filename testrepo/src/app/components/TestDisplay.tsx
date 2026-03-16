"use client";

import { useState, useEffect } from "react";
import TestStart from "./testStart/testStart";
import TestTake from "./testTake/testTake";
import { infoData } from "./testStart/startActions";
import { sqidSeed } from "../utils/utilFunctions";

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
export default function TestDisplay( {initialQuestions} : {initialQuestions: testQuestion[]} ) {
  
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

  //const [shuffleSeed, setShuffleSeed] = useState<string>("");
  console.log("ABOUT TO SET THE SHUFFLE SEED!");
  const shuffleSeed = testInfo.resultId !== 0 && testInfo.userAttempt !== 0 ? sqidSeed([testInfo.userAttempt, (testInfo.userAttempt % testInfo.resultId), testInfo.resultId]) : "";
  console.log(`SHUFFLE SEED SET TO ${shuffleSeed}`);

  useEffect(() => {
    console.log(`HERE IS WHAT WAS RECEIVED FROM THE SERVER: ${initialQuestions}`);
    console.log(`HERE IS THE CURRENT VALUES OF TESTINFO: ${testInfo}`);
  }, []);

  return (
    <>
    {
        currentDisplay === "start" && (
        <TestStart initialTestInfo = {testInfo} setInitialTestInfo = {setTestInfo} currentDisplay = {currentDisplay} setCurrentDisplay = {setCurrentDisplay}/>
        )
    }
    {
        currentDisplay === "test" && shuffleSeed !== "" && (
        <TestTake shuffleSeed = {shuffleSeed} currentTestInfo = {testInfo} setCurrentTestInfo = {setTestInfo} initialQuestions = {initialQuestions}/>
        )
    }
    </>)
}
