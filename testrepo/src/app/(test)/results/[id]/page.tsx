export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { ActionKey, apiAction } from "@/utils/apiUtilFunctions";
import ResultsDisplay from "@/components/ResultDisplay";
import ResultInfo from "@/components/ResultInfo";
import DownloadButtonPDF from "@/components/pdf/DownloadButtonPDF";
import { ResultInfoSkeleton, QuestionDisplaySkeleton } from "@/components/skeletons";
import { shuffleList, seedCreate } from "@/utils/utilFunctions";
import { ResultQuestion, TestQuestion, TestResult } from "@/types/sharedInterface";
import { ResultRequest, AnswersRequest } from "@/types/sharedType";

export default async function Results({ params } : { params: Promise<{ id : string }> }) {
  // Here, the slugging params will be dealt with
  const { id } = await params;
  const urlString = id ? id : "";

  let resultsFormat: ResultRequest = {
    'testDate' : new Date(),
    'urlId' : urlString
  };

  let totalQuestions = 0;

  const resultsRecord: ActionKey = {
    action: 'retrieveResults',
    givenFields: resultsFormat
  };

  const resultsPromise = apiAction(resultsRecord) as Promise<TestResult>;
  //const resultsPromise = resultUtils.resultsData('retrieveResults', resultsFormat) as Promise<TestResult>;

  // If the data is successfully retrieved, then the following HTML will return If not, error.tsx will catch the error
  const answersPromise = resultsPromise.then(async infoData => {
    const resultNum = infoData.score_id;
    const attemptNum = infoData.attempt_id;
    console.log(`CURRENT VALUE OF RESULTNUM: ${resultNum}`);
    console.log(`CURRENT VALUE OF ATTEMPTNUM: ${attemptNum}`);

    let answersFormat: AnswersRequest = {    
      'attemptId' : attemptNum,
      'resultId' : resultNum
    };

    const answersRecord: ActionKey = {
      action: 'retrieveAnswers',
      givenFields: answersFormat
    };

    return apiAction(answersRecord)
    //return resultUtils.answersData('retrieveAnswers', answersFormat)
    .then(answerData => {
      // You can change the logic of stage size here if there are more than 5 questions per stage
      const STAGE_SIZE = 5;
      totalQuestions = answerData.length;

      console.log(`ANSWER DATA LENGTH: ${totalQuestions}`);
      console.log(`ANSWER DATA STAGE SIZES: ${STAGE_SIZE}`);

      let tempData: ResultQuestion[] = [];
      for (let i = 0; i < STAGE_SIZE; i++) {
        console.log(`CURRENT SLICE INDICES TO BE USED ${i * STAGE_SIZE} AND ${STAGE_SIZE * (i + 1)}`);
        console.log(`CURRENT SLICE OF ANSWER DATA TO BE USED: ${answerData.slice(i * STAGE_SIZE, STAGE_SIZE * (i + 1))}`);
        let subData = JSON.parse(JSON.stringify(answerData.slice(i * STAGE_SIZE, STAGE_SIZE * (i + 1))));

        const seed = seedCreate([attemptNum, (attemptNum % resultNum), resultNum]);
        const shuffledSubData = shuffleList(subData, seed);
        tempData = [...tempData, ...shuffledSubData];
        console.log(`RESULTS OF CONCATINATING STAGE ${i + 1}'S QUESTIONS: ${tempData}`);
      }

      answerData = tempData;
      // DEBUG Check the shuffled answer data to confirm that the answer options have been shuffled
      console.log("INITIAL QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");
      for (let j = answerData.length - 1; j > -1; j--) {
        console.log(`HERE IS THE QUESTION ID FOR THE CURRENT QUESTION: ${answerData[j].question_id}`);
        console.log(`HERE ARE THE ANSWER IDS FOR THE CURRENT QUESTION: ${answerData[j].answer_id}`);
        console.log(`HERE ARE THE ANSWER TEXTS FOR THE CURRENT QUESTION: ${answerData[j].answer_text}`);
        console.log(`HERE ARE THE CORRECT ANSWERS FOR THE CURRENT QUESTION: ${answerData[j].correct_answer}`);
      }
      return tempData;
    });
  }) as Promise<ResultQuestion[]>;

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
          { 
            /*I've never used this before, so allow me to explain. To avoid long prop drilling, I decided to pass these components as children, 
            thereby bypassing the need for excessive prop drilling. This means that the parent components have a children prop, and that is
            called where the components themselves were originally placed. In order to achieve this, the parent component must have a closing
            tag, with the child component inside.*/ 
          }
          <ResultsDisplay answersPromise = {answersPromise}>
            <ResultInfo
              resultsPromise = {resultsPromise}
              // await the answersPromise to get the total number of questions so that it can be passed as a prop
              totalQuestions = {await answersPromise.then(answers => answers.length)}
            >
              <DownloadButtonPDF resultsPromise = {resultsPromise} answersPromise = {answersPromise} />
            </ResultInfo>
          </ResultsDisplay>
        </Suspense>
      </main>
    </div>
  );
}
