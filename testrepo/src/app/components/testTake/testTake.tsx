"use client";

import * as testUtils from "./testActions";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, Dispatch, SetStateAction} from "react";
import QuestionDisplay from "../QuestionDisplay";
import StageComplete from "../StageComplete";
import { infoData } from "@/app/components/testStart/startActions";
import test from "node:test";

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

//Type defined below will be used for tracking each stage's info, including each stage's difficulty,
//The current stage number, the current question of the stage, and the current stage's question_ids.
type stageType = {
  stageDifficulty: string[];
  stageNum: number;
  stageQuestion: number;
  stageQuestionId: number[];
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

// This interface will be used to properly receive the two useState which are passed to the component
interface testProps {
  currentTestInfo: infoData;
  setCurrentTestInfo: Dispatch<SetStateAction<infoData>>;
  currentDisplay: string;
  setCurrentDisplay: Dispatch<SetStateAction<string>>;
}


export default function TestTake({currentTestInfo, setCurrentTestInfo, currentDisplay, setCurrentDisplay} : testProps) {
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

    //This useRef will be used to track all info of the stages of the test. Since the number of questions asked is
    //dynamic, use the current question number modulus 5 to determine the current question index.
    let stageInfo = useRef<stageType>({
    'stageDifficulty': [''],
    'stageNum' : 0,
    'stageQuestion' : currentQuestion % 5,
    'stageQuestionId' : []
    })

    const testLength = questions.length;

    //This useState is used for storing the info for the user's answers
    const [answerArray, setAnswerArray] = useState<questionType[]>([])

    //This useState will track the user's selected answer for each question
    //THIS USESTATE IS MERELY FOR DEBUG
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    //This useState will be used for displaying the modal, depending on whether the user has submitted the answers
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    //Finally, useState for errors
    const [error, setError] = useState<string | string[] | undefined>('');

    //This useRef will track the user's graded answers
    const gradedAnswers = useRef<boolean[]>([])

    //This useRef is used for storing the total number of answers correct per stage
    const correctTotal = useRef<number>(0);

    //This useRef will track all of the question IDs used, regardless of stage
    const questionIdTrack = useRef<number[]>([])

    // RIGHT NOW EACH STAGE IS HARDCODED TO BE JUST 5 QUESTIONS, SO CHECK HERE IF THAT EVER CHANGES!
    const stageSize = 5;
    const startStage = stageInfo.current.stageNum * stageSize

    //These variables will be used for checking when to disable and enable certain buttons

    // IF THERE ARE ANY ERRORS WITH TEST BEING SUBMITTED EARLY, THEN THE LOGIC BELOW IS LIKELY CAUSING IT
    const isFirstQuestion = stageInfo.current.stageQuestion === 0;
    const isLastQuestion = stageInfo.current.stageQuestion >= testLength-1;

    console.log("TESTLENGTH")
    console.log(testLength)
    console.log("ISLASTQUESTION?")
    console.log(isLastQuestion)

    //These variables will apply the styling for the regular and disabled buttons
    const regularButton = "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 position:sticky top:0";
    const disabledButton = "mt-4 px-4 py-2 bg-gray-500 text-white rounded position:sticky top:0";

    let currentRequest: testUtils.requestData
    let currentAnswer: testUtils.responseData

    //Router will be used to push certain info when routed to the results page
    const router = useRouter();


    async function handleQuestionRetrieve(event: React.FormEvent) {
      event.preventDefault();
      console.log("ABOUT TO RETRIEVE SOME NEW QUESTIONS")
      if (stageInfo.current.stageNum <= 4) {
        console.log("GOING INTO THE FETCHING ANSWER FUNCTION")
        // Note, this can also be written as async function fetchTestFormat() {...}. It's called an arrow function here.
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        console.log("REDEFINING THE CURRRENT REQUEST")
        currentRequest = {
          questionId: stageInfo.current.stageQuestionId,
          pastId: questionIdTrack.current,
          questionCategory: stageInfo.current.stageDifficulty[stageInfo.current.stageNum-1],
          // Check the last stage's five answers
          wasCorrect: gradedAnswers.current.slice(-5)
        };
        console.log("ABOUT TO FETCH A NEW STAGE!")
        const fetchedQuestion = await testUtils.questionFetch('retrieveStage', currentRequest)
        console.log("FETCH A NEW STAGE!")
        if (fetchedQuestion) {
          console.log("HERE IS THE RESULT OF THE FETCHED QUESTION")
          setQuestions(fetchedQuestion)

          // If the questions were fetched, combine the previous answerData with new indices to be used, depending on how many questions
          // were received. Just for my own reference, ({...}) after the arrow in an arrow function is shorthand for {...return x;}
          setAnswerArray((prevData) => {
            const newArray = fetchedQuestion.map((question: any) => ({
              'questionId' : question.question_id,
              'questionText' : '',
              'questionBody' : '',
              'questionCategory' : '',
              'answerId' : [],
              'answerText' : [],
              'userText' : '',
              'alreadyAnswered' : false,
            }))
            // If it is the first stage, return the array that was created above. Otherwise, combine the two
            return stageInfo.current.stageNum === 0 ? newArray : [...prevData, ...newArray]
          })

          console.log("SET THE CURRENT QUESTION TO THIS")
          console.log(questions)
          console.log("SET THE CURRENT STAGE USING THE CURRENT STAGE NUM")
          stageInfo.current.stageDifficulty[stageInfo.current.stageNum] = fetchedQuestion[0].question_level
          console.log("SET THE CURRENT STAGE QUESTION IDS")
          stageInfo.current.stageQuestionId = fetchedQuestion.map((question: any) => question.question_id)
        }
        else {
          console.log("Error retrieving the next question.")
        }
      }
    }

    async function handleQuestionSubmit(event: React.FormEvent) {
      event.preventDefault();
      if (answerArray[currentQuestion] && stageInfo.current.stageQuestion === 4 ) {
        console.log("BEFORE SUBMITTING THE CURRENT ANSWER")
        const currentAnswerData = answerArray[currentQuestion];
        // Debugging: Check what is actually in the state
        console.log("Current State Answer:", currentAnswerData);
        console.log("USER ANSWER TO BE SUBMITTED")
        console.log(answerArray[currentQuestion])
        // Append the current question_id to questionIdTrack, use ... to "spread" the values. The spread operator is useful when copying or
        // combining list data because it directly takes out the values from the array.
        questionIdTrack.current.push(...stageInfo.current.stageQuestionId)
        
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        console.log("REDEFINING THE CURRRENT RESPONSE")
        currentAnswer = {
          questionId: stageInfo.current.stageQuestionId,
          pastId: questionIdTrack.current,
          // I understand why the slice is being used here, figure out how the map works exactly
          userText: answerArray.slice((startStage), (startStage+stageSize)).map(answer => answer.userText),
          userAttempt: currentTestInfo.userAttempt,
          resultId: currentTestInfo.resultId,
          currentStage: stageInfo.current.stageNum
        };

        const fetchedGradedAnswer = await testUtils.questionCheck('sendStage', currentAnswer)
        console.log("ANSWER SUBMITTED!")
        if (fetchedGradedAnswer) {
            console.log("HERE IS THE RESULT OF THE QUESTION THAT WAS JUST ANSWERED")
            console.log(fetchedGradedAnswer)
            const gradedAnswer = fetchedGradedAnswer
            // Use the "..." to keep the list flat
            gradedAnswers.current.push(...gradedAnswer)
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
      let submitInfo: testUtils.submitData = {
        resultId: currentTestInfo.resultId,
        pastId: questionIdTrack.current,
        userAttempt: currentTestInfo.userAttempt,
        isCorrect: gradedAnswers.current,
        stageArray: stageInfo.current.stageDifficulty
      }
      console.log("HERE IS THE FINALANSWERS");
      console.log(gradedAnswers)
      if (currentTestInfo.userAttempt !== 0) {
        const fetchedResponse = await testUtils.submitTest('submitTest', submitInfo);
        console.log(fetchedResponse)

        const currentAttempt = currentTestInfo.userAttempt;
        const currentRecord = currentTestInfo.resultId;
        const urlParams = new URLSearchParams();
        urlParams.set('attempt', currentAttempt.toString());
        urlParams.set('r', currentRecord.toString());

        console.log("ABOUT TO PUSH THROUGH ROUTE WITH THIS ATTEMPT NUMBER AND THIS RECORD NUMBER!")
        console.log(currentAttempt)
        console.log(currentRecord)
        router.push(`/results?${urlParams.toString()}`);
      }
      // If there is an error, set the error useState and log to console.
      else {
        //setError(answerArray);
        console.log("An error occured while retrieving the test form data from the backend.");
      }
    }
  }

  // Use useEffect to fetch the test form data when the component mounts, only up until the 20th question.
  console.log("ABOUT TO ENTER THE USEFFECT FOR SETTING THE INITIAL QUESTIONS!")
  useEffect(() => {
    if (currentQuestion < testLength && currentQuestion % 5 === 0 && stageInfo.current.stageNum <= 4) {
    // Note, this can also be written as async function fetchTestFormat() {...}. It's called an arrow function here.
      const fetchInitialQuestions = async () => {
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        //Make a default request for fetching the first question
        currentRequest = {
        questionId: [0],
        pastId: questionIdTrack.current,
        questionCategory: "Beginner II",
        wasCorrect: [true]
        }
        // Now reset the ids of the current stage
        stageInfo.current.stageQuestionId = []
        console.log("ABOUT TO FETCH THE INITIAL STAGE!")
        const fetchedQuestion = await testUtils.questionFetch('retrieveStage', currentRequest)
        console.log("FETCH A NEW STAGE!")
        if (fetchedQuestion) {
          console.log("HERE IS THE RESULT OF THE FETCHED QUESTION")
          setQuestions(fetchedQuestion)
          console.log("SET THE CURRENT QUESTION TO THIS")
          console.log(questions)
          console.log("SET THE FIRST STAGE'S DIFFICULTY")
          stageInfo.current.stageDifficulty[stageInfo.current.stageNum] = fetchedQuestion[0].question_level
          console.log("SET THE FIRST STAGE'S QUESTION IDS")
          stageInfo.current.stageQuestionId = fetchedQuestion.map((question: any) => question.question_id)
        }
        else {
          console.log("Error retrieving the initial questions.")
        }
      }
      // Call the function to fetch the test format after defining it
      fetchInitialQuestions();
    }
     //The empty array below states that this will only occur on mount.
  }, []);

  // This useEffect will populate the answerArray ONLY when the answerArray is shorter than questions, and questions is not empty
  useEffect(() => {
    if (questions.length > 0 && answerArray.length < questions.length) {
      const initialArray = questions.map((question: any) => ({
        'questionId' : question.question_id,
        'questionText' : '',
        'questionBody' : '',
        'questionCategory' : '',
        'answerId' : [],
        'answerText' : [],
        'userText' : '',
        'alreadyAnswered' : false,
      }));
      setAnswerArray(initialArray);
    }
  }, [questions]);

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
    console.log("LENGTH OF THE ANSWER ARRAY")
    console.log(answerArray.length)

    console.log("CURRENT LIST OF GRADED ANSWERS")
    console.log(gradedAnswers)
    console.log("CURRENT LIST OF STAGE VALUES")
    console.log(stageInfo.current.stageDifficulty)
    console.log("CURRENT STAGE")
    console.log(stageInfo.current.stageNum)
    console.log("DISPLAY THE CURRENT QUESTION OF THE CURRENT STAGE")
    console.log(stageInfo.current.stageQuestion)

    console.log("CURRENT TEST INFO WHILE TAKING THE TEST")
    console.log(currentTestInfo)
    console.log("CURRENT DISPLAY OPTION")
    console.log(currentDisplay)
    console.log("HAS THE STAGE BEEN SUBMITTED?")
    console.log(isSubmitted)
  }, [selectedAnswer, questions, currentQuestion, answerArray, isSubmitted])
  

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

  //This little function will calculate the correct answers for the stage
  async function calculateCorrect(gradedAnswers:  boolean[]) {
    const correctCount = gradedAnswers.slice(-5).filter(Boolean).length;
    console.log("HERE IS CORRECT COUNT!")
    console.log(correctCount)
    //Also set correctTotal so that the count can be used through a useRef
    correctTotal.current = correctCount
    return correctCount
  }

  const handleNextStage = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    // After the user presses the continue button, the following will be executed
    // If the user did well enough and they have not reached the final stage, move onto the next stage but do not submit the test.
    if (stageInfo.current.stageNum < 4 && correctTotal.current > 3) {
      console.log(`SCORES FOR STAGE ${stageInfo.current.stageNum} WERE SUFFICIENT, MOVE ONTO THE NEXT STAGE.`)
      // Now reset the ids of the current stage
      stageInfo.current.stageQuestionId = []
      console.log("INCREMENT THE CURRENT STAGE NUMBER AND RESET THE STAGE QUESTION COUNTER BACK TO 0!")
      stageInfo.current.stageNum = stageInfo.current.stageNum + 1;
      stageInfo.current.stageQuestion = 0;
      //Reset it before exiting
      setIsSubmitted(false);

      await handleQuestionRetrieve(event);
      setCurrentQuestion(prev => prev + 1);
    }
    // Otherwise, do the following
    else {
      if (stageInfo.current.stageNum > 4) {
        console.log(`USER HAS REACHED THE FINAL STAGE, END THE TEST NOW.`)
      }
      else {
        console.log(`SCORES FOR STAGE ${stageInfo.current.stageNum} WERE TOO LOW, END THE TEST NOW.`)
      }
      // Now handle the submission
      await handleTestForm(event);
    }
  }

  //This function handles the logic for the Submit and Next buttons. Do some research on the specific React.stuff here
  const handleButtonChange = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Default behavior of form submission, to send data and reload the page, is prevented here.
    event.preventDefault();
    //Take the name of the event that cause the current call to handleButtonChange
    const {name} = event.currentTarget

    //Call the setter function with prevData as its argument, then use it to map each answer to an index. If the index matches currentQuestion,
    //set alreadyAnswered to true, the questionId to the current question in the stage, and keep the other attributes as is, otherwise do just answer.
    setAnswerArray((prevData) =>
      prevData.map((answer, index) =>
      index === currentQuestion ? {...answer, questionId: questions[stageInfo.current.stageQuestion].question_id, alreadyAnswered: true} : answer
    ))

    //Logic for the Test Submit Button
    if (name === 'submitButton') {
      // Wait for the question to be submitted before going any further
      await handleQuestionSubmit(event);

      // Await the correct number of answers for the stage before moving on
      await calculateCorrect(gradedAnswers.current);

      //Set submitted to true so that the modal can be displayed
      setIsSubmitted(true);
      //await handleNextStage(event);
    }
    // Logic for the Next button
    else {
      setCurrentQuestion(prev => prev + 1);
      //Also set the current stage's question too
      stageInfo.current.stageQuestion = stageInfo.current.stageQuestion + 1;
    }
  }
  
  //HTML return for the test form page
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {
          // Await the correct number of answers for the stage before moving on
          isSubmitted !== false && (<StageComplete
            stageNum = {stageInfo.current.stageNum}
            stagePassed = {correctTotal.current > 3 ? true : false}
            difficultyLevel = {stageInfo.current.stageDifficulty[stageInfo.current.stageNum]}
            totalQuestions = {stageInfo.current.stageQuestion + 1}
            totalCorrect = {correctTotal.current}
            onButtonChange = {handleNextStage}
          />)
        }
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <form name = "placeTest" onSubmit = {handleTestForm} className = "flex flex-col spacey-4 items-center justify-center">
            {
              //If questions exists and its length is greater than 0, or currentQuestion is less than the length, display the current question
              // questions && questions.length > 0 && currentQuestion <= questions.length && (
              questions && questions[stageInfo.current.stageQuestion] && answerArray[currentQuestion] && (
                <QuestionDisplay
                  questionId = {currentQuestion + 1}
                  questionText = {questions[stageInfo.current.stageQuestion].question_text}
                  questionBody = {questions[stageInfo.current.stageQuestion].question_body}
                  questionCategory = {questions[stageInfo.current.stageQuestion].question_level}
                  answerId = {questions[stageInfo.current.stageQuestion].answer_id}
                  answerText = {questions[stageInfo.current.stageQuestion].answer_text}
                  selectedAnswer = {answerArray[currentQuestion]?.userText}
                  alreadyAnswered = {answerArray[currentQuestion]?.alreadyAnswered}
                  //Send the handleChange const as the value for onChangeValue so that the onChange field can be properly handled
                  onChangeValue = {handleChange}
                />)
            }
            {
              /* Below I used shorthand for an if-else statement in Typescript. It first has the condition, then it uses "?" to check if
              it is true or not. If it is true, run the code in the first set of paranthesis. If not, it will go to the ":" and run
              the code in the second set of paranthesis. Additional conditions require another condition followed by "?" and "()".
              For the Submit and Next buttons below, the CSS styling is determined by the result of the if statement.
              */
            }
          </form>
          <div className = "flex items-center justify-center gap-40">
            {isLastQuestion  ? (
              <button type = "submit" form = "placeTest" name = "submitButton" className = {
                // If it is not the last question, the stage was submitted, or if the user has not selected an answer, used the disabled style. Otherwise use regular.
                !isLastQuestion || isSubmitted || !answerArray[currentQuestion]?.userText ? (disabledButton) : (regularButton)}
              disabled = { // If it is not the last question, the stage was submitted, or if the user has not selected an answer
                !isLastQuestion || isSubmitted || !answerArray[currentQuestion]?.userText}
              onClick = {handleButtonChange}>Submit Answers</button>
            ) : (
              <button 
              type = "button" form = "placeTest" name = "next" className = { 
                // If the user has not selected an answer, used the disabled style. Otherwise use regular.
                !answerArray[currentQuestion]?.userText ? (disabledButton) : (regularButton)}
              disabled = { // If the user has not selected an answer
                !answerArray[currentQuestion]?.userText}
              onClick = {handleButtonChange}>Next</button>
            )
            }
          </div>
        </div>
      </main>
    </div>
  );
}