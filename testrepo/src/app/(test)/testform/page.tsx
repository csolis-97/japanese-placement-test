"use client"

import * as testUtils from "./actions";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation"
import {useState, useActionState, useEffect, useRef} from "react";
import QuestionDisplay from "../../components/QuestionDisplay";
import { start } from "node:repl";

export default function Home() {

  //Type defined below will be used for setting the test questions and answers
  type questionType = {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    userText: string;
    alreadyAnswered: boolean;
  }

  type responseType = {
    questionId: number[];
    pastId: number[];
    userText: string[];
    userAttempt: number;
    resultId: number;
  }

  type requestType = {
    questionId: number[];
    pastId: number[];
    questionCategory: string;
    wasCorrect: boolean[];
  }

  type submitType = {
    isCorrect: boolean[];
    pastId: number[];
    userAttempt: number;
    resultId: number;
    stageArray: string[];
  }

  type infoType = {
    resultId: number;
    userAttempt: number;
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
    is_correct?: boolean;
  }

  let currentRequest: requestType
  let currentAnswer: responseType

  // This useState is used to store the questions received from the database
  const [questions, setQuestions] = useState<testQuestion[]>([{
    'question_id' : 0,
    'question_text' : '',
    'question_body' : '',
    'question_level' : '',
    'answer_id' : [],
    'answer_text' : [],
    'already_answered' : false,
    'is_correct' : false
  }]);
  
  // This useState is used to track the current question
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  const testLength = 20;
  //These variables will be used for checking when to disable the Back and Next buttons
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion >= testLength-1;

  console.log("TESTLENGTH")
  console.log(testLength)
  console.log("ISLASTQUESTION?")
  console.log(isLastQuestion)

  //These variables will apply the styling for the regular and disabled buttons
  const regularButton = "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 position:sticky top:0";
  const disabledButton = "mt-4 px-4 py-2 bg-gray-500 text-white rounded position:sticky top:0";

  //const [answerArray, setAnswerArray] = useState<string[]>(answerArrayBuild)
  const [answerArray, setAnswerArray] = useState<questionType[]>(() =>
    Array.from({length: testLength}, index => ({
    'questionId' : 0,
    'questionText' : '',
    'questionBody' : '',
    'questionCategory' : '',
    'answerId' : [],
    'answerText' : [],
    'userText' : '',
    'alreadyAnswered' : false,
  })))

  //This useState will track the user's selected answer for each question
  //THIS USESTATE IS MERELY FOR DEBUG
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  //This useRef will track the user's graded answers
  const gradedAnswers = useRef<boolean[]>([])

  //This useRef will track the question IDs used
  const questionIdTrack = useRef<number[]>([])

  //This useRef will track each stage's difficulty level
  const stageTrack = useRef<string[]>([])

  //This useRef will track the current stage
  let stageNum = useRef<number>(0)

  //This will track the current stage's current question by getting the result of the modulus operation on the counter
  const stageQuestion = currentQuestion % 5;

  //This useRef will track the question_id of the current stage
  const stageId = useRef<number[]>([])

  //This useState will track test info, specifically the score ID used in the database for the record, alongside the user's current attempt number
  const [testInfo, setTestInfo] = useState<infoType>({
    'resultId' : 0,
    'userAttempt' : 0
  });

  //Finally, useState for errors
  const [error, setError] = useState<string | string[] | undefined>('');

  const stageSize = 5;
  const startStage = stageNum.current * stageSize

  const router = useRouter();

  async function handleQuestionSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log("BEFORE SUBMITTING THE CURRENT ANSWER")
    const currentAnswerData = answerArray[currentQuestion];
  
    // Debugging: Check what is actually in the state
    console.log("Current State Answer:", currentAnswerData);

    if (answerArray[currentQuestion] && stageQuestion === 4 ) {
      console.log("USER ANSWER TO BE SUBMITTED")
      console.log(answerArray[currentQuestion])
      // Append the current question_id to questionIdTrack, use ... to "spread" the values because you are pushing an array (check what this does)
      questionIdTrack.current.push(...stageId.current)
    
      // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
      console.log("REDEFINING THE CURRRENT RESPONSE")
      currentAnswer = {
      questionId: stageId.current,
      pastId: questionIdTrack.current,
      // I understand why the slice is being used here, figure out how the map works exactly
      userText: answerArray.slice((startStage), (startStage+stageSize)).map(answer => answer.userText),
      userAttempt: testInfo.userAttempt,
      resultId: testInfo.resultId
      };
      console.log("INCREMENT THE CURRENT STAGE NUMBER!")
      stageNum.current = stageNum.current + 1
      const fetchedGradedAnswer = await testUtils.questionCheck('sendStage', currentAnswer)
      console.log("ANSWER SUBMITTED!")
      if (fetchedGradedAnswer) {
        console.log("HERE IS THE RESULT OF THE QUESTION THAT WAS JUST ANSWERED")
        console.log(fetchedGradedAnswer)
        const gradedAnswer = fetchedGradedAnswer
        // Use the "..." to keep the list flat
        gradedAnswers.current.push(...gradedAnswer)
        //gradedAnswers.current[currentQuestion] = gradedAnswer
        console.log("SET THE CURRENT INDEX OF GRADED ANSWERS TO THIS")
        console.log(gradedAnswers.current.slice(-5))
        return gradedAnswer
      }
      else {
        console.log("Error grading the current question.");
      }
    }
  }

  //Function to handle the test form itself, once the user presses the submit button
  async function handleTestForm(event: React.FormEvent) {
    // Default behavior of form submission, to send data and reload the page, is prevented here.
    event.preventDefault();
    console.log("BEFORE SUBMITTING ANSWERS");
    // Here, the test data will be fetched from the database
    // If the data is successfully retrieved, log the data, assign it to questionsData, then set the testFormat useState
    if (answerArray) {
      console.log("TEST WAS SUBMITTED!")
      console.log("PLEASE CHECK HERE")
      console.log(answerArray)
      let submitInfo: submitType = {
        resultId: testInfo.resultId,
        pastId: questionIdTrack.current,
        userAttempt: testInfo.userAttempt,
        isCorrect: gradedAnswers.current,
        stageArray: stageTrack.current
      }
      console.log("HERE IS THE FINALANSWERS");
      console.log(gradedAnswers)
      if (testInfo.userAttempt !== 0) {
        const fetchedResponse = await testUtils.submitTest('submitTest', submitInfo);
        console.log(fetchedResponse)
        const currentAttempt = testInfo.userAttempt
        console.log("ABOUT TO PUSH THROUGH ROUTE WITH THIS ATTEMPT NUMBER!")
        console.log(currentAttempt)
        router.push(`/results?attempt=${currentAttempt}`);
      }
      // If there is an error, set the error useState and log to console.
      else {
        //setError(answerArray);
        console.log("An error occured while retrieving the test form data from the backend.");
      }
    }
  }

  // use a useEffect to fetch the ID to be used for the scores alongside the attempt number for the user when 
  // the component mounts
  console.log("ABOUT TO ENTER THE USEFFECT FOR RESULT NUMBER AND ATTEMPT NUMBER!")
  useEffect(() => {
    if (testInfo.resultId === 0) {
      const getResultNumber = async () => {
        const fetchedresultId = await testUtils.resultNumber('getResultNumber', testInfo.resultId);
        // If the current result's ID in the database was successfully retrieved, set the value to resultId. Otherwise log an error.
        if (fetchedresultId) {
          console.log("HERE IS THE ID OF THE RESULTS THAT WILL BE STORED WHEN SUBMITTED");
          console.log(fetchedresultId);

          //This will set the result ID for the current test
          setTestInfo((prevData) => ({
            ...prevData,
            ['resultId']: fetchedresultId
          }))
          console.log("Current result Id fetched and set to resultId");
        }
        else {
          console.log("Error fetching the result ID to be used")
        }
      }
      // Call the function to fetch the resultId to be used
      getResultNumber();
    }
    if (testInfo.userAttempt === 0) {
      const getAttemptNumber = async() => {
        // Fetch the test attempt number for the user, as this will be needed to display the correct results later on
        const fetchedAttemptNum = await testUtils.attemptNumber('getAttemptNumber', testInfo.userAttempt);
        // If the attempt number is successfully retrieved, set the value to currentAttempt. Otherwise log an error.
        if (fetchedAttemptNum) {
          console.log("HERE IS THE USER'S CURRENT ATTEMPT NUMBER");
          console.log(fetchedAttemptNum);

          //This will set the attempt number for the current test
          setTestInfo((prevData) => ({
            ...prevData,
            ['userAttempt']: fetchedAttemptNum
          }))

          console.log("Test attempt number fetched and set to currentAttempt");
        }
        else {
          console.log("Error fetching test attempt number.");
        }
      }
      // Call the function to fetch the current attemptId to be used
      getAttemptNumber();
    }
  }, [])

  // Use useEffect to fetch the test form data when the component mounts, only up until the 20th question.
  console.log("ABOUT TO ENTER THE USEFFECT FOR QUESTIONS!")
  useEffect(() => {
    if (currentQuestion < testLength && currentQuestion % 5 === 0) {
    console.log("GOING INTO THE FETCHING ANSWER FUNCTION")
    // Note, this can also be written as async function fetchTestFormat() {...}. It's called an arrow function here.
      const fetchTestInfo = async () => {
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        if (currentQuestion > 0 && questions) {
          console.log("REDEFINING THE CURRRENT REQUEST")
          currentRequest = {
          questionId: stageId.current,
          pastId: questionIdTrack.current,
          questionCategory: stageTrack.current[stageNum.current-1],
          // Check the last stage's five answers
          wasCorrect: gradedAnswers.current.slice(-5)
          };
        }
        else {
          //Make a default request for fetching the first question
          currentRequest = {
          questionId: [0],
          pastId: questionIdTrack.current,
          questionCategory: "Beginner II",
          wasCorrect: [true]
          }
        }
        // Now reset the ids of the current stage
        stageId.current = []
        console.log("ABOUT TO FETCH A NEW STAGE!")
        const fetchedQuestion = await testUtils.questionFetch('retrieveStage', currentRequest)
        console.log("FETCH A NEW STAGE!")
        if (fetchedQuestion) {
          console.log("HERE IS THE RESULT OF THE FETCHED QUESTION")
          setQuestions(fetchedQuestion)
          console.log("SET THE CURRENT QUESTION TO THIS")
          console.log(questions)
          console.log("SET THE CURRENT STAGE USING THE CURRENT STAGE NUM")
          stageTrack.current[stageNum.current] = fetchedQuestion[0].question_level
          console.log("SET THE CURRENT STAGE QUESTION IDS")
          stageId.current = fetchedQuestion.map((question: any) => question.question_id)
        }
        else {
          console.log("Error retrieving the next question.")
        }
      }
      // Call the function to fetch the test format after defining it
      fetchTestInfo();
    }
     //This array below tells React to re-run this effect whenever the currentQuestion changes in value.
  }, [currentQuestion]);

  // FOR DEBUG. This useEffect will track all current relevant info needed
  useEffect(() => {
    console.log("CURRENT SELECTED ANSWER")
    console.log(selectedAnswer)
    console.log("ABOUT TO ENTER THE HTML!")
    console.log(questions)
    console.log("CURRENT QUESTION!")
    console.log(currentQuestion)
    console.log("CURRENT FIRST AND LAST CHECKS")
    console.log(isFirstQuestion, isLastQuestion)

    console.log("CURRENT STATUS OF ANSWER ARRAY")
    console.log(answerArray)

    console.log("CURRENT LIST OF GRADED ANSWERS")
    console.log(gradedAnswers)
    console.log("CURRENT LIST OF STAGE VALUES")
    console.log(stageTrack)
    console.log("CURRENT STAGE")
    console.log(stageNum)
    console.log("DISPLAY THE CURRENT QUESTION OF THE CURRENT STAGE")
    console.log(stageQuestion)
  }, [selectedAnswer, questions, currentQuestion])
  

  //Here the change in the selection of an answer for the current question will be handled
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This line refers to the name and value fields of an HTML input tag, and uses object destructuring to assign them values from
    // event.target, which itself refers to the HTML element that triggered the event in the first place.
    const {name, value} = event.target;
    /* the set UseState function is called with an updater function that uses prevData as its argument. An updater function is used
    in order to update the data of an object and then set the new object as the state of testFormat. For this reason, prevData ensures 
    that it  receives the most updated information and that if there are other fields that won't be updated within the function, the 
    information is passed on and not lost.
    */
    //setQuestions((prevData) => ({
      /*...prevData is a copy of the current useState and its values. The next line replaces the current value with the value
      that was assigned from event.target based on the name that was also assigned. Since the name field is assigned dynamically,
      if you wanted to replace more than one field, you would have to hardcode the keys, but you can still dynamically assign new
      values. If there are other fields that you do not wish to replace, however, remember to use ...prevData to carry them over
      to the new useState.
      */ 
      //...prevData,
      //[name]: value
    //})); 

    //Track the current Selected Answer here by giving it the user's currently selected answer
    console.log("CURRENT ANSWERARRAY[CURRENTQUESTION]")
    console.log(answerArray[currentQuestion])
    setSelectedAnswer(value)
    
    //Call the setter function with prevData as its argument, then use it to map each answer to an index. If the index matches currentQuestion,
    //set userText to value and keep the other attributes as is, otherwise do just answer.
    setAnswerArray((prevData) =>
      prevData.map((answer, index) =>
      index === currentQuestion ? {...answer, userText: value} : answer
    ))
    console.log("REPLACED IN ARRAY OF USER'S ANSWERS!!!!")
    console.log(answerArray)
  }

  //This function handles the logic for the Submit and Next buttons. Do some research on the specific React.stuff here
  const handleButtonChange = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //Take the name of the event that cause the current call to handleButtonChange
    const {name} = event.currentTarget
    //Logic for the Test Submit Button
    if (name === 'submitButton') {
      // Wait for the question to be submitted before going any further
      await handleQuestionSubmit(event);
      await handleTestForm(event);
    }
    // Logic for the Next button
    else {
      // Wait for the question to be submitted before going any further
      await handleQuestionSubmit(event);
     //Call the setter function with prevData as its argument, then use it to map each answer to an index. If the index matches currentQuestion,
     //set alreadyAnswered to true and keep the other attributes as is, otherwise do just answer.
      setAnswerArray((prevData) =>
        prevData.map((answer, index) =>
        index === currentQuestion ? {...answer, questionId: questions[stageQuestion].question_id, alreadyAnswered: true} : answer
      ))
      /* prev => prev + 1 is an example of a functional update in useState. Prev is the immediate, latest version of the
      state before it was updated. It is a function that takes prev as its argument and returns prev + 1 as the result.
      */
      setCurrentQuestion(prev => prev + 1)
    }
  }
  
  //HTML return for the test form page
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <form name = "placeTest" onSubmit = {handleTestForm} className = "flex flex-col spacey-4 items-center justify-center">
            {
              //If questions exists and its length is greater than 0, or currentQuestion is less than the length, display the current question
              // questions && questions.length > 0 && currentQuestion <= questions.length && (
              questions && currentQuestion < testLength && (
                <QuestionDisplay
                questionId = {currentQuestion+1}
                questionText = {questions[stageQuestion].question_text}
                questionBody = {questions[stageQuestion].question_body}
                questionCategory = {questions[stageQuestion].question_level}
                answerId = {questions[stageQuestion].answer_id}
                answerText = {questions[stageQuestion].answer_text}
                selectedAnswer = {answerArray[currentQuestion].userText}
                alreadyAnswered = {answerArray[currentQuestion].alreadyAnswered}
                wasCorrect = {gradedAnswers.current[currentQuestion]}
                //Send the handleChange const as the value for onChangeValue so that the onChange field can be properly handled
                onChangeValue = {handleChange}
                />)
              /* disabled checks if the currentQuestion is 0, and disables it if it is.*/ 
              /* disabled checks if the currentQuestion is the current length of questions, and disables it if it is.*/
              /* REWRITE THE COMMENTS FOR THE CODE DOWN BELOW*/
            }
            {
              /* Below I used shorthand for an if-else statement in Typescript. It first has the condition, then it uses "?" to check if
              it is true or not. If it is true, run the code in the first set of paranthesis. If not, it will go to the ":" and run
              the code in the second set of paranthesis. Additional conditions require another condition followed by "?" and "()".
              
              For the Back and Next buttons below, the CSS styling is determined by the result of the if statement. If the boolean
              isFirstQuestion returns true, then it will be disabled and the disabledButton style will be used. Otherwise it will be
              regular. The Next button acts the same, except it checks if the boolean isLastQuestion returns true.
              */
            }
          </form>
          <div className = "flex items-center justify-center gap-40">
            {isLastQuestion ? (
              <button type = "submit" form = "placeTest" name = "submitButton" className = {//!isLastQuestion || isSubmitted === true ? (disabledButton) : (regularButton)
                !isLastQuestion ? (disabledButton) : (regularButton)}
              disabled = {//!isLastQuestion || isSubmitted === true
                !isLastQuestion}
              onClick = {handleButtonChange}>Submit Test</button>
            ) : (
              <button 
              type = "button" form = "placeTest" name = "next" className = {//isLastQuestion || !answerArray[currentQuestion] || isSubmitted === true ? (disabledButton) : (regularButton)
                isLastQuestion || !answerArray[currentQuestion] ? (disabledButton) : (regularButton)}
              disabled = {//isLastQuestion || !answerArray[currentQuestion] || isSubmitted === true
                isLastQuestion || !answerArray[currentQuestion]}
              onClick = {handleButtonChange}>Next</button>
            )
            }
          </div>
        </div>
      </main>
    </div>
  );
}
