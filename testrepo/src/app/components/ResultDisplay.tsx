"use client";

import { Suspense, use } from "react";
import QuestionDisplay from "./QuestionDisplay";
import ResultInfo from "./ResultInfo";
import { QuestionDisplaySkeleton } from "./skeletons";

//Interface below will be used for when each question itself is displayed. Fields should be the exact same as the ones in
//the database in order to be properly displayed.
interface TestQuestion {
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

//Interface below will be used for displaying the user's results.
interface TestResult {
  attempt_id: number;
  total_score: number;
  totalQuestions?: number;
  entrance_level: string;
  test_date: Date;
};

interface ResultsProps {
  attemptNum: number;
  answersPromise: Promise<TestQuestion[]>;
  resultsPromise: Promise<TestResult>;
};

export default function ResultsDisplay({
  attemptNum, 
  answersPromise, 
  resultsPromise 
} : ResultsProps) {
  //const questions = use(answersPromise) as TestQuestion[];
  const questions = use(answersPromise);
  const results = use(resultsPromise) as TestResult;

  //Fetch the user's graded responses from the test page
  console.log("ABOUT TO ENTER THE HTML!");
  console.log("HERE IS THE QUESTION AND ANSWER INFORMATION");
  //console.log(questions);
  console.log("QUESTIONS.LENGTH");
  //console.log(questions.length);
  
  return (
    <>
      <div className = "p-12">
        { //DEBUG ONLY, TEST THE RESULTINFO SKELETON
          // <skeletons.ResultInfoSkeleton />
        }
        {
          <ResultInfo
            attemptId = {attemptNum}
            totalScore = { // The total_score stored is actually the percentage of overall correct questions, so calculate the correct number here
              (results.total_score / 100) * questions.length}
            entranceLevel = {results.entrance_level}
            testDate = {results.test_date}
            totalQuestions = {questions.length}
          />
        }
        </div>
        <div className = "flex flex-col gap-6">
          { // DEBUG ONLY, TEST THE QUESTIONDISPLAY SKELETON
            // <skeletons.QuestionDisplaySkeleton />
          }
          {
            questions.map((question) =>
              <Suspense 
                key = {question.response_order}
                fallback = { <QuestionDisplaySkeleton />}>
                <QuestionDisplay
                  questionId = {question.response_order}
                  questionText = {question.question_text}
                  questionBody = {question.question_body}
                  questionCategory = {question.question_level}
                  answerId = {question.answer_id}
                  answerText = {question.answer_text}
                  correctAnswer = {question.correct_answer}
                  wasCorrect = {question.user_was_correct}
                  //selectedAnswer is used to track which radio option the user has chosen
                  selectedAnswer = {question.user_answer_text}
                  alreadyAnswered = {true}
                />
              </Suspense>
          )}
      </div>
    </>
  );
}