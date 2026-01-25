"use client"

import {attemptNumber, questionCheck, testForm} from "./actions";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation"
import {useState, useActionState, useEffect} from "react";
import QuestionDisplay from "../../components/QuestionDisplay";

export default function Home() {

  //Type defined below will be used for setting the test questions and answers
  type testFormType = {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    userAttempt: number;
    resultId: number;
  }

  type responseType = {
    questionId: number;
    userText: string;
    userAttempt: number;
    resultId: number;
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

  //Although not needed, here is a sample of a constant being defined to map results from one table to another
  /*const mapNewTestForm = (question: any): testForm => {
    questionId: question.new_question_id
  }
  */

  // This useState is used to store the questions received from the database
  const [questions, setQuestions] = useState<testQuestion[]>([]);
  // This useState is used to track the current question
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  //These variables will be used for checking when to disable the Back and Next buttons
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion >= questions.length-1;

  //These variables will apply the styling for the regular and disabled buttons
  const regularButton = "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 position:sticky top:0";
  const disabledButton = "mt-4 px-4 py-2 bg-gray-500 text-white rounded position:sticky top:0";

  // This useState is used to fetch the results from the database, which will then be stored in the questions useState.
  const [testFormat, setTestFormat] = useState<testFormType>({
    'questionId' : 0,
    'questionText' : '',
    'questionBody' : '',
    'questionCategory' : '',
    'answerId' : [],
    'answerText' : [],
    'userAttempt' : 0,
    'resultId' : 0
  })

  //The different between const and let is that const variables cannot be reassigned, while let variables can.
  // answerArray will track all user answers.
  let answerArrayBuild: string[] = [];
  let answerStatusBuild: boolean[] = [];
  let ctr: number = 0;

  for (ctr; ctr <= questions.length-1; ctr++) {
    answerArrayBuild.push("");
  }

  const [answerArray, setAnswerArray] = useState<string[]>(answerArrayBuild)

  //This useState will track the user's selected answer for each question
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  
  //This useState will track the current difficult level of the test
  const [selectedLevel, setSelectedLevel] = useState<string>('N3');

  //THis useState will track if the current question was answered or not
  ctr = 0
  for (ctr; ctr <= questions.length-1; ctr++) {
    answerStatusBuild.push(false)
  }
  const [answerStatus, setAnswerStatus] = useState<boolean[]>(answerStatusBuild);

  //This useState will track the current attempt number for the user
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);

  //This useStatewill track the user's current result ID
  const [resultId, setResultid] = useState<number>(0);

  //This useState will check if the test has been submitted
  const [isSubmitted, setIsSubmitted] = useState<boolean>();

  //This useState will work together with the context in order to track the user's graded scores
  const [gradedAnswers, setGradedAnswers] = useState<boolean[]>([]);

  //Finally, useState for errors
  const [error, setError] = useState<string | string[] | undefined>('');

  const router = useRouter();

  async function handleQuestionSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log("BEFORE SUBMITTING THE CURRENT ANSWER")
    if (answerArray[currentQuestion]) {
      console.log("USER ANSWER TO BE SUBMITTED")
      console.log(answerArray[currentQuestion])

      let currentAnswer: responseType = {
        questionId: currentQuestion,
        userText: answerArray[currentQuestion],
        userAttempt: currentAttempt,
        resultId: resultId
      };
      const fetchedresultId = await questionCheck('sendOneAnswer', currentAnswer)
      console.log("ANSWER SUBMITTED!")
      if (fetchedresultId && resultId === 0) {
        console.log("HERE IS THE RESULTID THAT WILL BE USED")
        console.log(fetchedresultId)
        setResultid(fetchedresultId)
        console.log("SET RESULTID TO THIS")
        console.log(resultId)
      }
      else {
        console.log("Error fetching the current result ID.");
      }
    }
  }

  //Function to handle the test form itself, once the user presses the submit button
  async function handleTestForm(event: React.FormEvent) {
    // Default behavior of form submission, to send data and reload the page, is prevented here.
    event.preventDefault();
    console.log("BEFORE SUBMITTING ANSWERS");
    //Here, the test data will be fetched from the database
    // If the data is successfully retrieved, log the data, assign it to questionsData, then set the testFormat useState
    if (answerArray) {
      // Set the isSubmitted useState to true once test is submitted
      setIsSubmitted(true);
      console.log("TEST WAS SUBMITTED!")
      console.log(isSubmitted);
      console.log("PLEASE CHECK HERE")
      console.log(answerArray)

      //In order to submit the answers, create finalAnswers to properly map the answers to an object of testFormType.
      //Since we only need answerText, everything else is left blank.
      let finalAnswers: testFormType = {
        questionId : 0,
        questionText: '',
        questionBody: '',
        questionCategory: '',
        answerId: [],
        answerText : answerArray,
        userAttempt: currentAttempt,
        resultId: resultId
      };
      console.log("HERE IS THE FINALANSWERS");
      console.log(finalAnswers);
      if (currentAttempt !== 0) {
        const fetchedCheckedAnswers = await testForm('sendAnswers', finalAnswers);
        setGradedAnswers(fetchedCheckedAnswers);
        // THIS PRINTS AN EMPTY ARRAY
        console.log("HERE ARE THE GRADED ANSWERS");
        console.log(gradedAnswers)
        // EVERYTHING HERE IS NOT PRINTED FOR SOME REASON
        console.log("ABOUT TO PUSH THROUGH ROUTE WITH THIS ATTEMPT NUMBER!")
        console.log(currentAttempt)
        // Since the  currentAttempt value is a single integer, append it to router push for use in the results screen
        router.push(`/results?attempt=${currentAttempt}`);
      }
      // If there is an error, set the error useState and log to console.
      else {
        setError(answerArray);
        console.log("An error occured while retrieving the test form data from the backend.");
        console.log(answerArray);

        // Set the isSubmitted useState to false in case of error
        setIsSubmitted(false);
      }
    }
  }

  // Use useEffect to fetch the test form data when the component mounts
  console.log("ABOUT TO ENTER THE USEFFECT FOR QUESTIONS!")
  useEffect(() => {
    if (questions !== undefined) {
      // Note, this can also be written as async function fetchTestFormat() {...}. It's called an arrow function here.
        const fetchTestInfo = async () => {
          // Fetch the test form data from the backend, with 'retrieveQuestions' as the action to take
          const fetchedTestFormat = await testForm('retrieveQuestions', testFormat);
          // If the data is successfully retrieved, set the testFormat useState. Otherwise log an error.
          if (fetchedTestFormat) {
            console.log("HERE IS FETCHED TEST FORMAT")
            console.log(fetchedTestFormat)
            setQuestions(fetchedTestFormat);
            console.log("Test form data fetched and set in useEffect.")
          }
          else {
            console.log("Error fetching test form data in useEffect.")
          }
        }
        // Call the function to fetch the test format after defining it
        fetchTestInfo();
    }
  }, []); // [testFormat.questionId], This dependency array ensures the effect runs when questionId changes

  // use another useEffect to fetch the attempt number for the user when the component mounts
  useEffect(() => {
    if (currentAttempt === 0) {
      const getAttemptNumber = async() => {
      // Next, fetch the test attempt number for the user, as this will be needed to display the correct results later on
      const fetchedAttemptNum = await attemptNumber('getAttemptNumber', currentAttempt);
      // If the attempt number is successfully retrieved, set the value to currentAttempt. Otherwise log an error.
      if (fetchedAttemptNum) {
        console.log("HERE IS THE USER'S CURRENT ATTEMPT NUMBER");
        console.log(fetchedAttemptNum);
        setCurrentAttempt(fetchedAttemptNum);
        console.log("Test attempt number fetched and set to currentAttempt");
        console.log(currentAttempt);
      }
      else {
        console.log("Error fetching test attempt number.");
      }
      }
    // Call the function to fetch the current attempt number after defining it
    getAttemptNumber();
    }
  }, [])

  // FOR DEBUG. This second useEffect will track the user's current answer for the current question
  useEffect(() => {
    console.log("CURRENT SELECTED ANSWER")
    console.log(selectedAnswer)
  }, [selectedAnswer])
  

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

    //Update the array containing the user's answers, regardless of whether or not they moved onto a different question
    //IF THE USER DOESN'T PRESS A DIFFERENT OPTION THAN THE ONE THAT IS CURRENTLY HIGHLIGHTED, IT WILL NOT BE RECOGNIZED!
    setAnswerArray((prevData) => ({
      ...prevData,
      [currentQuestion] : value
    }))

    console.log("REPLACED IN ARRAY OF USER'S ANSWERS!!!!")
    console.log(answerArray)
  }

  //This function handles the logic for the Back and Next buttons. Do some research on the specific React.stuff here
  const handleButtonChange = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //Take the name of the event that cause the current call to handleButtonChange
    const {name} = event.currentTarget
    //Logic for the Back button
    if (name === 'back') {
      /* prev => prev - 1 is an example of a functional update in useState. Prev is the immediate, latest version of the
      state before it was updated. It is a function that takes prev as its argument and returns prev - 1 as the result.
      */
      setCurrentQuestion(prev => prev - 1)
    }
    // Logic for the Next button
    else {
      setAnswerStatus((prevData) => ({
        ...prevData,
        [currentQuestion] : true
      }))
      /* prev => prev + 1 is an example of a functional update in useState. Prev is the immediate, latest version of the
      state before it was updated. It is a function that takes prev as its argument and returns prev + 1 as the result.
      */
      setCurrentQuestion(prev => prev + 1)
      handleQuestionSubmit(event);
    }
  }

    //This function handles the logic for submitting the current question using a button.
  const handleButtonQuestionSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //Take the name of the event that cause the current call to handleButtonChange
    const {name, value, onclick} = event.currentTarget
    //Logic for the Back button
      /* prev => prev + 1 is an example of a functional update in useState. Prev is the immediate, latest version of the
      state before it was updated. It is a function that takes prev as its argument and returns prev + 1 as the result.
      */
      setCurrentQuestion(prev => prev + 1)
  }

  console.log("ABOUT TO ENTER THE HTML!")
  console.log(questions)
  console.log("CURRENT QUESTION!")
  console.log(currentQuestion)

  {console.log("QUESTIONS.LENGTH")}
  {console.log(questions.length)}
  console.log("CURRENT FIRST AND LAST CHECKS")
  console.log(isFirstQuestion, isLastQuestion)
  

  //HTML return for the test form page
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <form name = "placeTest" onSubmit = {handleTestForm} className = "flex flex-col spacey-4 items-center justify-center">
            {
              //If questions exists and its length is greater than 0, or currentQuestion is less than the length, display the current question
              questions && questions.length > 0 && currentQuestion <= questions.length && (
                <QuestionDisplay
                questionId = {questions[currentQuestion].question_id}
                questionText = {questions[currentQuestion].question_text}
                questionBody = {questions[currentQuestion].question_body}
                questionCategory = {questions[currentQuestion].question_level}
                answerId = {questions[currentQuestion].answer_id}
                answerText = {questions[currentQuestion].answer_text}
                //selectedAnswer is used to track which radio option the user has chosen
                selectedAnswer = {answerArray[currentQuestion]}
                alreadyAnswered = {answerStatus[currentQuestion]}
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
            <button
            type = "button" form = "placeTest" name = "back" className = {isFirstQuestion || isSubmitted === true ? (disabledButton) : (regularButton)}
            disabled = {isFirstQuestion || isSubmitted === true}
            onClick = {handleButtonChange}>Back</button>
            {isLastQuestion ? (
              <button type = "submit" form = "placeTest" name = "submitButton" className = {!isLastQuestion || isSubmitted === true ? (disabledButton) : (regularButton)}
              disabled = {!isLastQuestion || isSubmitted === true}
              onClick = {handleTestForm}>Submit Test</button>
            ) : (
              <button 
              type = "button" form = "placeTest" name = "next" className = {isLastQuestion || !answerArray[currentQuestion] || isSubmitted === true ? (disabledButton) : (regularButton)}
              disabled = {isLastQuestion || !answerArray[currentQuestion] || isSubmitted === true}
              onClick = {handleButtonChange}>Next</button>
            )
            }
          </div>
        </div>
      </main>
    </div>
  );
}
