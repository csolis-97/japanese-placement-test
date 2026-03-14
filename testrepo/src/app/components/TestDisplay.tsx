"use client";

import { useState, useEffect } from "react";
import TestStart from "./testStart/testStart";
import TestTake from "./testTake/testTake";
import { infoData } from "./testStart/startActions";

// This component receives a prop, which uses a type of string array, as the initial question data to be used
export default function TestDisplay( {initialQuestions} : {initialQuestions: string[]} ) {
  console.log("HERE IS WHAT WAS RECEIVED FROM THE SERVER!");
  console.log(initialQuestions);
  
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

  useEffect(() => {
    console.log("HERE IS THE CURRENT VALUES OF TESTINFO")
    console.log(testInfo)
  }, []);

  return (
    <>
    {
        currentDisplay === "start" && (
        <TestStart initialTestInfo = {testInfo} setInitialTestInfo = {setTestInfo} currentDisplay = {currentDisplay} setCurrentDisplay = {setCurrentDisplay}/>
        )
    }
    {
        currentDisplay === "test" && (
        <TestTake currentTestInfo = {testInfo} setCurrentTestInfo = {setTestInfo} initialQuestions = {initialQuestions}/>
        )
    }
    </>)
}