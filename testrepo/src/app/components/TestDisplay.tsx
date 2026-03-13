"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TestStart from "./testStart/testStart";
import TestTake from "./testTake/testTake";
import { infoData } from "./testStart/startActions";

//This variable will apply the styling for the button
const buttonStyle = "mt-4 px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";

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

  if(initialQuestions) {
    return (
      <div className="flex flex-col items-center">
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
      </div>)
    }
  else {
    return createPortal(
        <div className = "fixed inset-0 w-screen h-screen flex items-center text-center justify-center bg-black/40">
        {
            <div className = "inset-0 items-center justify-center gap-6 text-center opacity-100 transition-opacity duration-300 sm:items-start sm:text-left border-8 border-gray-400 shadow-lg rounded-lg bg-white p-4 dark:text-gray-400">
                <h1>Failed to retrieve the intial questions! Please reload the page and try again.</h1>
                <Link href = "/">
                  <button className = {buttonStyle} type = "button">Back to Home</button>
                </Link>
            </div>
        }
        </div>, document.body
    );
  }
}