"use client";

import * as testUtils from "./actions";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {useState, useActionState, useEffect, useRef} from "react";
import QuestionDisplay from "../../components/QuestionDisplay";
import TestStart from "../../components/testStart/testStart";
import TestTake from "../../components/testTake/testTake";
import { start } from "node:repl";
import { infoData } from "@/app/components/testStart/startActions";

export default function Home() {

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
  }, [])
  
  //HTML return for the test form page
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between px-16 bg-white dark:bg-black ">
        <div className="flex flex-col items-center">
          {
            currentDisplay === "start" && (
            //LOGIC FOR SWITCHING BETWEEN COMPONENTS GOES HERE
            <TestStart initialTestInfo = {testInfo} setInitialTestInfo = {setTestInfo} currentDisplay = {currentDisplay} setCurrentDisplay = {setCurrentDisplay}/>
            )
          }
          {
            currentDisplay === "test" && (
              <TestTake currentTestInfo = {testInfo} setCurrentTestInfo = {setTestInfo} currentDisplay = {currentDisplay} setCurrentDisplay = {setCurrentDisplay}/>
            )
          }
        </div>
      </main>
    </div>
  );
}
