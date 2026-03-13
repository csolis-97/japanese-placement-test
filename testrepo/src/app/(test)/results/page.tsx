export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Suspense } from "react";
import { createPortal } from "react-dom";
import * as resultUtils from "./displayActions";
import ResultsDisplay from "@/app/components/ResultDisplay/ResultDisplay";
import * as skeletons from "@/app/components/skeletons";

//This variable will apply the styling for the button
const buttonStyle = "mt-4 px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";

export default async function Results({ searchParams, } : { searchParams: Promise<{ [key : string] : string | string[] | undefined }> }) {
    // Here, the search Params will be dealt with, determining the current resultID alongside the user's current attempt number.
    const filterParams = await searchParams;
    const attemptNum = filterParams ? Number(filterParams.attempt) : 0;
    const resultNum = filterParams ? Number(filterParams.r) : 0;
    console.log("HERE IS THE ATTEMPT NUMBER AND RECORD NUMBER IN THE RESULTS PAGE FROM THE SEARCH PARAMS WITHIN THE PAGE.TSX!")
    console.log(attemptNum)
    console.log(resultNum)

    let answersFormat: resultUtils.answerData = {    
      'questionId' : 0,
      'questionText' : '',
      'questionBody' : '',
      'questionCategory' : '',
      'answerId' : [],
      'answerText' : [],
      'attemptId' : attemptNum,
      'resultId' : resultNum,
      'correctAnswer' : [],
      'userText' : '',
      'wasCorrect' : false
    }

    let resultsFormat: resultUtils.resultData = {
      'resultId' : resultNum,
      'attemptId' : attemptNum,
      'totalScore' : 0,
      'entranceLevel' : '',
      'testDate' : new Date()
    }

    // If the data is successfully retrieved, render the entire try block. If not, catch the error that was returned and display a modal.
    try {
      const answersPromise = resultUtils.answersData('retrieveAnswers', answersFormat)
      const resultsPromise = resultUtils.resultsData('retrieveResults', resultsFormat)
      //HTML return for the results page
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
          <main className="flex sm:min-h-screen sm:w-full sm:max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
            <Suspense fallback = {
              <>
                <div className="flex flex-col items-center gap-6 p-12 text-center sm:items-start sm:text-left">
                  <skeletons.ResultInfoSkeleton />
                </div>
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                  <skeletons.QuestionDisplaySkeleton />
                  <skeletons.QuestionDisplaySkeleton />
                  <skeletons.QuestionDisplaySkeleton />
                  <skeletons.QuestionDisplaySkeleton />
                  <skeletons.QuestionDisplaySkeleton />
                </div>            
              </>                
            }>
              <ResultsDisplay attemptNum = {attemptNum} resultNum = {resultNum} answersPromise = {answersPromise} resultsPromise= {resultsPromise} />
            </Suspense>
          </main>
        </div>
      );
    }
    catch(error) {
      return createPortal(
          <div className = "fixed inset-0 w-screen h-screen flex items-center text-center justify-center bg-black/40">
          {
              <div className = "inset-0 items-center justify-center gap-6 text-center opacity-100 transition-opacity duration-300 sm:items-start sm:text-left border-8 border-gray-400 shadow-lg rounded-lg bg-white p-4 dark:text-gray-400">
                  <h1>Failed to retrieve the test results! Please reload the page and try again.</h1>
                  <Link href = "/">
                    <button className = {buttonStyle} type = "button">Back to Home</button>
                  </Link>
              </div>
          }
          </div>, document.body
      );
    }
}
