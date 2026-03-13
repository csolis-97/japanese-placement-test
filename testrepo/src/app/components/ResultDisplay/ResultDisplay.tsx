"use client";

import Link from "next/link"
import { useState, Suspense, use } from "react";
import { createPortal } from "react-dom";
import QuestionDisplay from "../QuestionDisplay";
import ResultInfo from "../ResultInfo";
import * as skeletons from "../skeletons";

//This variable will apply the styling for the button
const buttonStyle = "mt-4 px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";

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

//Interface below will be used for displaying the user's results.
interface testResult {
  attempt_id: number;
  total_score: number;
  totalQuestions?: number;
  entrance_level: string;
  test_date: Date;
}

interface resultsProps {
  attemptNum: number;
  resultNum: number;
  answersPromise: Promise<testQuestion[]>;
  resultsPromise: Promise<testResult>;
}

export default function ResultsDisplay( { attemptNum, resultNum, answersPromise, resultsPromise } : resultsProps) {
  const questions = use(answersPromise) as testQuestion[];
  const results = use(resultsPromise) as testResult;

  //Fetch the user's graded responses from the test page
  console.log("ABOUT TO ENTER THE HTML!")
  console.log("HERE IS THE QUESTION AND ANSWER INFORMATION")
  //console.log(questions)
  console.log("QUESTIONS.LENGTH")
  //console.log(questions.length)
  

  //HTML return for the results page
  if (questions && results) {
    return (
      <>
        <div className="flex flex-col items-center gap-6 p-12 text-center sm:items-start sm:text-left">
          { //DEBUG ONLY, TEST THE RESULTINFO SKELETON
            // <skeletons.ResultInfoSkeleton />
          }
          {
            questions.length > 0 && (
                <ResultInfo
                attemptId = {attemptNum}
                totalScore = { // The total_score stored is actually the percentage of overall correct questions, so calculate the correct number here
                  (results.total_score / 100) * questions.length}
                entranceLevel = {results.entrance_level}
                testDate = {results.test_date}
                totalQuestions = {questions.length}
              />)
          }
          </div>
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            { // DEBUG ONLY, TEST THE QUESTIONDISPLAY SKELETON
              // <skeletons.QuestionDisplaySkeleton />
            }
            {
              questions.map((question) =>
                <Suspense 
                  key = {question.response_order}
                  fallback = { <skeletons.QuestionDisplaySkeleton />}>
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
              )
            }
        </div>
      </>
    );
  }
  else {
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