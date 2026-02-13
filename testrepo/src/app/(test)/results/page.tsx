"use client"

import {answerData, resultsData} from "./actions";
import Link from "next/link";
import Image from "next/image";
import {useSearchParams} from "next/navigation";
import {useState, useActionState, useEffect} from "react";
import QuestionDisplay from "../../components/QuestionDisplay";
import ResultDisplay from "../../components/ResultDisplay";

export default function Home() {

  //Type defined below will be used for setting the test questions and answers
  type answerType = {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    attemptId: number;
    resultId: number;
    correctAnswer: boolean[];
    userText: string;
    wasCorrect: boolean;
  }

  //Type defined below will be used for displaying the result information
  type resultType = {
    resultId: number;
    attemptId: number;
    totalScore: number;
    entranceLevel: string;
    testDate: Date;
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

  //Interface below will be used for displaying the user's results.
  interface testResult {
    attempt_id: number;
    total_score: number;
    totalQuestions?: number;
    entrance_level: string;
    test_date: Date;
  }

  //Although not needed, here is a sample of a constant being defined to map results from one table to another
  /*const mapNewTestForm = (question: any): testForm => {
    questionId: question.new_question_id
  }
  */
  const searchParams = useSearchParams();
  const attemptParam = searchParams.get('attempt');
  const resultParam = searchParams.get('r');
  let attemptNum = attemptParam ? Number(attemptParam) : 0;
  let resultNum = resultParam ? Number(resultParam) : 0;
  console.log("HERE IS THE ATTEMPT NUMBER AND RECORD NUMBER IN THE RESULTS PAGE FROM THE SEARCH PARAMS WITHIN THE USEEFFECT!")
  console.log(attemptNum)
  console.log(resultNum)

  // This useState is used to store the questions received from the database
  const [questions, setQuestions] = useState<testQuestion[]>([]);

  // This useState is used to store the result information received from the database
  const [results, setResults] = useState<testResult>();

  // This useState is used to fetch the answers and questions from the database, which will then be stored in the questions useState.
  const [answerFormat, setAnswerFormat] = useState<answerType>({
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
  })

  // This useState is used to fetch the results from the database
  const [resultsFormat, setResultsFormat] = useState<resultType>({
    'resultId' : resultNum,
    'attemptId' : attemptNum,
    'totalScore' : 0,
    'entranceLevel' : '',
    'testDate' : new Date()
  })

  //Finally, useState for errors
  const [error, setError] = useState<string | undefined>('');

  //Fetch the user's graded responses from the test page

  // Use useEffect to fetch the test data when the component mounts.
  console.log("ABOUT TO ENTER THE USEFFECT IN THE RESULTS!")
  useEffect(() => {
    if (attemptParam !== null && resultParam !== null && resultsFormat.attemptId !== attemptNum && resultsFormat.resultId !== resultNum) {
      setResultsFormat((prevData) => ({
        ...prevData,
        'resultId' : resultNum,
        'attemptId': attemptNum
      }))
      // Fetch the attempt number search parameter and store it in attemptNum, which will be given to the resultsFormat useState
      console.log("HERE IS THE ATTEMPT EFFECT NUMBER IN THE RESULTS PAGE FROM THE SEARCH PARAMS WITHIN THE USEEFFECT!")
      console.log(resultsFormat.attemptId)
    }

    if (questions !== undefined) {
      // Note, this can also be written as async function fetchTestFormat() {...}. It's called an arrow function here.
        const fetchData = async () => {
          //Fetch the test data and results from the backend, with 'retrieveAnswers' and 'retrieveResults' as the actions to take
          const fetchedAnswerFormat = await answerData('retrieveAnswers', answerFormat);
          const fetchedResultsFormat = await resultsData('retrieveResults', resultsFormat);
          // If the first set of data is successfully retrieved, set the questions useState. Otherwise log an error.
          if (fetchedAnswerFormat) {
            console.log("HERE IS FETCHED ANSWER FORMAT")
            console.log(fetchedAnswerFormat)
            setQuestions(fetchedAnswerFormat);
            console.log("Question and answer data fetched and set in useEffect.")
            console.log(questions)
          }
          else {
            console.log("An error occured fetching the question and answer data in useEffect.")
          }
          // IF the second set of data is successfully retrieved, set the resultsFormat useState. Otherwise log an error.
          if (fetchedResultsFormat) {
            console.log("HERE IS FETCHED RESULT DATA")
            console.log(fetchedResultsFormat);
            setResults(fetchedResultsFormat);
            console.log("Results data fetched and set in useEffect.")
          }
          else {
            console.log("An error occured fetching the results data in useEffect.")
          }
        }
        // Call the function to fetch the data after defining it
        fetchData();
    }
  }, []);

  console.log("ABOUT TO ENTER THE HTML!")
  console.log("HERE IS THE QUESTION AND ANSWER INFORMATION")
  console.log(questions)
  console.log("QUESTIONS.LENGTH")
  console.log(questions.length)
  //console.log(gradedResults)
  

  //HTML return for the test form page
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          {
            questions && questions.length > 0 && results && (
              <ResultDisplay
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
            {
              questions.map((question) =>
                <QuestionDisplay
                key = {question.response_order}
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
                />)
            }
         </div>
      </main>
    </div>
  );
}
