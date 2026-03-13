export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import * as resultUtils from "./displayActions";
import ResultsDisplay from "@/app/components/ResultDisplay/ResultDisplay";
import * as skeletons from "@/app/components/skeletons";

export default async function Results({ searchParams } : { searchParams: Promise<{ [key : string] : string | string[] | undefined }> }) {
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

  // If the data is successfully retrieved, then the following HTML will return If not, error.tsx will catch the error
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
