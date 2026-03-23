export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import * as resultUtils from "./displayActions";
import ResultsDisplay from "@/app/components/ResultDisplay";
import { ResultInfoSkeleton, QuestionDisplaySkeleton } from "@/app/components/skeletons";
import { shuffleList, seedCreate } from "@/app/utils/utilFunctions";

export default async function Results({ searchParams } : { searchParams: Promise<{ [key : string] : string | string[] | undefined }> }) {
  // Here, the search Params will be dealt with, determining the current resultID alongside the user's current attempt number.
  const filterParams = await searchParams;
  const attemptNum = filterParams ? Number(filterParams.attempt) : 0;
  const resultNum = filterParams ? Number(filterParams.r) : 0;
  //const seed = filterParams ? Number(filterParams.s) : 0;
  // const seed = String(`${attemptNum + (attemptNum % resultNum) * resultNum}`);
  console.log("ABOUT TO SET THE SHUFFLE SEED!");
  // const seed = resultNum !== 0 && attemptNum !== 0 ? seedCreate([attemptNum, (attemptNum % resultNum), resultNum]) : new XORShift128();
  // console.log(`SEED SET TO ${seed}`);
  //console.log(`HERE IS THE ATTEMPT NUMBER: ${attemptNum}, RECORD NUMBER: ${resultNum} AND SEED: ${seed} IN THE RESULTS PAGE FROM THE SEARCH PARAMS WITHIN THE PAGE.TSX!`);
  console.log(attemptNum);
  console.log(resultNum);
  //console.log(seed);

  let answersFormat: resultUtils.AnswerData = {    
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
  };

  let resultsFormat: resultUtils.ResultData = {
    'resultId' : resultNum,
    'attemptId' : attemptNum,
    'totalScore' : 0,
    'entranceLevel' : '',
    'testDate' : new Date()
  };

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
};

  // If the data is successfully retrieved, then the following HTML will return If not, error.tsx will catch the error
  const answersPromise = resultUtils.answersData('retrieveAnswers', answersFormat)
    .then(answerData => {
      // You can change the logic of stage size here if there are more than 5 questions per stage
      const stageSize = 5;

      console.log(`ANSWER DATA LENGTH: ${answerData.length}`);
      console.log(`ANSWER DATA STAGE SIZES: ${stageSize}`);
      // Here is some syntax I somehow did not know about. In order to initialize an empty array of numbers,
      // do varName: number[] = [];
      let tempData: testQuestion[] = [];
      for (let i = 0; i < stageSize; i++) {
        console.log(`CURRENT SLICE INDICES TO BE USED ${i * stageSize} AND ${stageSize * (i + 1)}`);
        console.log(`CURRENT SLICE OF ANSWER DATA TO BE USED: ${answerData.slice(i * stageSize, stageSize * (i + 1))}`);
        let subData = JSON.parse(JSON.stringify(answerData.slice(i * stageSize, stageSize * (i + 1))));

        const seed = seedCreate([attemptNum, (attemptNum % resultNum), resultNum]);
        //seedShuffle(subData, seed);
        const shuffledSubData = shuffleList(subData, seed);
        tempData = [...tempData, ...shuffledSubData];
        console.log(`RESULTS OF CONCATINATING STAGE ${i + 1}'S QUESTIONS: ${tempData}`);
      }
      answerData = tempData;
      //seedShuffle(answerData, seed);   
      console.log("INITIAL QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");
      for (let j = answerData.length - 1; j > -1; j--) {
        console.log(`HERE IS THE QUESTION ID FOR THE CURRENT QUESTION: ${answerData[j].question_id}`);
        console.log(`HERE ARE THE ANSWER IDS FOR THE CURRENT QUESTION: ${answerData[j].answer_id}`);
        console.log(`HERE ARE THE ANSWER TEXTS FOR THE CURRENT QUESTION: ${answerData[j].answer_text}`);
        console.log(`HERE ARE THE CORRECT ANSWERS FOR THE CURRENT QUESTION: ${answerData[j].correct_answer}`);
      }
      //return answerData;
      return tempData;
    }) as Promise<testQuestion[]>;
  const resultsPromise = resultUtils.resultsData('retrieveResults', resultsFormat);

  //HTML return for the results page
  return (
    <div className = {`
      flex justify-center 
      bg-[#d1190d] font-sans
    `}>
      <main className = {`
        flex 
        w-full sm:max-w-3xl 
        flex-col items-center 
        py-16 sm:py-32 
        px-16 bg-white
      `}>
        <Suspense fallback = {
          <>
            <div className = "flex flex-col gap-6 p-12">
              <ResultInfoSkeleton />
            </div>
            <div className = "flex flex-col gap-6">
              <QuestionDisplaySkeleton />
              <QuestionDisplaySkeleton />
              <QuestionDisplaySkeleton />
              <QuestionDisplaySkeleton />
              <QuestionDisplaySkeleton />
            </div>            
          </>                
        }>
          <ResultsDisplay 
            attemptNum = {attemptNum} 
            answersPromise = {answersPromise} 
            resultsPromise = {resultsPromise} 
          />
        </Suspense>
      </main>
    </div>
  );
}
