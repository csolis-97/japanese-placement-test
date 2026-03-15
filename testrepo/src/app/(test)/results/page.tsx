export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import * as resultUtils from "./displayActions";
import ResultsDisplay from "@/app/components/ResultDisplay";
import * as skeletons from "@/app/components/skeletons";
import { seedShuffle } from "@/app/utils/utilFunctions";

export default async function Results({ searchParams } : { searchParams: Promise<{ [key : string] : string | string[] | undefined }> }) {
  // Here, the search Params will be dealt with, determining the current resultID alongside the user's current attempt number.
  const filterParams = await searchParams;
  const attemptNum = filterParams ? Number(filterParams.attempt) : 0;
  const resultNum = filterParams ? Number(filterParams.r) : 0;
  const seed = filterParams ? Number(filterParams.s) : 0;
  console.log("HERE IS THE ATTEMPT NUMBER, RECORD NUMBER AND SEED IN THE RESULTS PAGE FROM THE SEARCH PARAMS WITHIN THE PAGE.TSX!");
  console.log(attemptNum);
  console.log(resultNum);
  console.log(seed);

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

  //Interface below will be used for when each question itself is displayed. Fields should be the exact same as the ones in
//the database in order to be properly displayed.
interface testQuestion {
  question_id: number;
  question_text: string;
  question_body: string;
  question_level: string;
  answer_id: number[];
  answer_text: string[];
  already_answered?: boolean;
  correct_answer?: boolean[];
  user_answer_text: string;
  user_was_correct?: boolean;
  response_order: number;
}

  // If the data is successfully retrieved, then the following HTML will return If not, error.tsx will catch the error
  const answersPromise = resultUtils.answersData('retrieveAnswers', answersFormat)
    .then(answerData => { 
      seedShuffle(answerData, seed);   
        console.log("INITIAL QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");
        for (let i = answerData.length - 1; i > -1; i--) {
          console.log(`HERE IS THE QUESTION ID FOR THE CURRENT QUESTION: ${answerData[i].question_id}`)
          console.log(`HERE ARE THE ANSWER IDS FOR THE CURRENT QUESTION: ${answerData[i].answer_id}`)
          console.log(`HERE ARE THE ANSWER TEXTS FOR THE CURRENT QUESTION: ${answerData[i].answer_text}`)
          console.log(`HERE ARE THE CORRECT ANSWERS FOR THE CURRENT QUESTION: ${answerData[i].correct_answer}`)
        }
      return answerData}) as Promise<testQuestion[]>;
  const resultsPromise = resultUtils.resultsData('retrieveResults', resultsFormat)

  //HTML return for the results page
  return (
    <div className="flex sm:min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
      <main className="flex sm:min-h-screen w-full sm:max-w-3xl flex-col items-center justify-between py-16 sm:py-32 px-16 bg-white dark:bg-black sm:items-start">
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
          <ResultsDisplay attemptNum = {attemptNum} resultNum = {resultNum} seed = {seed} answersPromise = {answersPromise} resultsPromise= {resultsPromise} />
        </Suspense>
      </main>
    </div>
  );
}
