"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useTransition, use } from "react";
import * as testUtils from "./testActions";
import QuestionDisplay from "../QuestionDisplay";
import StageComplete from "../StageComplete";
import { infoData } from "../testStart/startActions";
import { testQuestion } from "../TestDisplay";
import { sqidSeed, seedShuffle, calculateCorrect } from "@/app/utils/utilFunctions";
import { XORShift128 } from "random-seedable";

// const shuffleSeed = (Math.floor(Math.random() * 10000000));
// const shuffleSeed = 1234;
// console.log(`CURRENT SEED TO BE USED: ${shuffleSeed}`);

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

// This interface will be used to properly receive the useState and data which are passed to the component
interface testProps {
  shuffleSeed: string;
  currentTestInfo: infoData;
  initialQuestionsPromise: Promise<testQuestion[]>;
}


export default function TestTake({shuffleSeed, currentTestInfo, initialQuestionsPromise} : testProps) {

    //let shuffleSeed: string = "";
    //let shuffleSeed: XORShift128;

    //if (currentTestInfo.resultId !== 0 && currentTestInfo.userAttempt !== 0) {
    console.log("ABOUT TO SET THE SHUFFLE SEED!");
    //const shuffleSeed = sqidSeed([currentTestInfo.userAttempt, currentTestInfo.resultId]);
    console.log(`SHUFFLE SEED SET TO ${shuffleSeed}`);
    //}
    const initialQuestions = use(initialQuestionsPromise) as testQuestion[];  
    // This useState is used to store the questions received from the database
    const [questions, setQuestions] = useState<testQuestion[]>(() => {
      let shuffleInitial = JSON.parse(JSON.stringify(initialQuestions));
      seedShuffle(shuffleInitial, shuffleSeed);

      console.log("INITIAL QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");
      for (let i = shuffleInitial.length - 1; i > -1; i--) {
        console.log(`HERE IS THE QUESTION ID FOR THE CURRENT QUESTION: ${shuffleInitial[i].question_id}`)
        console.log(`HERE ARE THE ANSWER IDS FOR THE CURRENT QUESTION: ${shuffleInitial[i].answer_id}`)
        console.log(`HERE ARE THE ANSWER TEXTS FOR THE CURRENT QUESTION: ${shuffleInitial[i].answer_text}`)
      }
      return shuffleInitial;
    });

    // This useState is used to track the current question
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);

    //This useState is used for storing the info for the user's answers
    const [answerArray, setAnswerArray] = useState<questionType[]>([])

    //This useState will track the user's selected answer for each question
    //THIS USESTATE IS MERELY FOR DEBUG
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    //This useState will be used for displaying the modal, depending on whether the user has submitted the answers
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    //Finally, useState for errors
    const [error, setError] = useState<string | string[] | undefined>('');

    //This useRef will be used to track all info of the stages of the test. Since the number of questions asked is
    //dynamic, use the current question number modulus 5 to determine the current question index.
    let stageInfo = useRef<testUtils.stageData>({
    'stageDifficulty': [initialQuestions[0].question_level],
    'stageNum' : 0,
    'stageQuestion' : currentQuestion % 5,
    'stageQuestionId' : initialQuestions.map((question: any) => question.question_id)
    });

    //This useRef will track the user's graded answers
    const gradedAnswers = useRef<boolean[]>([]);

    //This useRef is used for storing the total number of answers correct per stage
    const correctTotal = useRef<number>(0);

    //This useRef will track all of the question IDs used, regardless of stage
    const questionIdTrack = useRef<number[]>([]);

    //This useTransition will be used when new questions are being fetched, to display a loading state
    const [isPending, startTransition] = useTransition();

    // RIGHT NOW EACH STAGE IS HARDCODED TO BE JUST 5 QUESTIONS, SO CHECK HERE IF THAT EVER CHANGES!
    const stageSize = questions.length;
    const startStage = stageInfo.current.stageNum * stageSize;

    //These variables will be used for checking when to disable and enable certain buttons
    const isFirstQuestion = stageInfo.current.stageQuestion === 0;
    const isLastQuestion = stageInfo.current.stageQuestion >= stageSize - 1;

    console.log("CURRENT STAGE SIZE")
    console.log(stageSize)
    console.log("ISLASTQUESTION?")
    console.log(isLastQuestion)

    //These variables will apply the styling for the regular and disabled buttons
    const buttonDefaults = "mt-4 px-8 py-4 font-semibold text-sm text-white";
    const regularButton = "bg-[#d1190d] hover:bg-[#700f09]";
    const disabledButton = "bg-gray-500";

    let currentRequest: testUtils.requestData;
    let currentAnswer: testUtils.responseData;

    //Router will be used to push certain info when routed to the results page
    const router = useRouter();

    //This little function will calculate the correct answers for the stage, using the current value of the gradedAnswers useRef
    async function handleCorrectCount(gradedAnswers: boolean[]) {
      correctTotal.current = await calculateCorrect(gradedAnswers, stageSize);
    }

    async function handleQuestionRetrieve(event: React.FormEvent) {
      event.preventDefault();
      console.log("ABOUT TO RETRIEVE SOME NEW QUESTIONS FOR THE NEXT STAGE")
      if (stageInfo.current.stageNum <= 4) {
        console.log("GOING INTO THE FETCHING NEW QUESTIONS FUNCTION")
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        console.log("REDEFINING THE CURRRENT QUESTION REQUEST")
        currentRequest = {
          questionId: stageInfo.current.stageQuestionId,
          pastId: questionIdTrack.current,
          questionCategory: stageInfo.current.stageDifficulty[stageInfo.current.stageNum],
          // Check the last stage's five answers
          wasCorrect: gradedAnswers.current.slice(-stageSize)
        };
        console.log("ABOUT TO FETCH THE NEXT STAGE!")
        const fetchedQuestion = await testUtils.questionFetch('retrieveStage', currentRequest)
        console.log("FETCHED THE NEXT STAGE!")
        if (fetchedQuestion) {
          console.log("HERE IS THE RESULT OF THE FETCHED QUESTION");

          //const shuffleSeed = sqidSeed([currentTestInfo.userAttempt, currentTestInfo.resultId]);

          let shuffleQuestions = JSON.parse(JSON.stringify(fetchedQuestion));
          seedShuffle(shuffleQuestions, shuffleSeed);
          console.log("NEW QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");

          for (let i = shuffleQuestions.length - 1; i > -1; i--) {
            console.log(`HERE IS THE QUESTION ID FOR THE CURRENT QUESTION: ${shuffleQuestions[i].question_id}`)
            console.log(`HERE ARE THE ANSWER IDS FOR THE CURRENT QUESTION: ${shuffleQuestions[i].answer_id}`)
            console.log(`HERE ARE THE ANSWER TEXTS FOR THE CURRENT QUESTION: ${shuffleQuestions[i].answer_text}`)
          }
          setQuestions(shuffleQuestions);

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

          console.log("SET THE CURRENT QUESTION TO THIS");
          console.log(fetchedQuestion);

          console.log("INCREMENT THE CURRENT STAGE NUMBER AND RESET THE STAGE QUESTION COUNTER BACK TO 0!");
          stageInfo.current.stageNum = stageInfo.current.stageNum + 1;
          stageInfo.current.stageQuestion = 0;
          console.log("SET THE CURRENT STAGE USING THE CURRENT STAGE NUM");
          stageInfo.current.stageDifficulty[stageInfo.current.stageNum] = fetchedQuestion[0].question_level;
          console.log("SET THE CURRENT STAGE QUESTION IDS");
          stageInfo.current.stageQuestionId = fetchedQuestion.map((question: any) => question.question_id);
        }
        else {
          console.log("Error retrieving the next question.")
        }
      }
    }

    async function handleQuestionSubmit(event: React.FormEvent) {
      event.preventDefault();
      if (answerArray[currentQuestion] && stageInfo.current.stageQuestion === 4 ) {
        console.log("USER ANSWERS TO BE SUBMITTED")
        // Since answerArray is an object with no toString function, use JSON.stringify to properly display the answer data in the console log
        console.log(JSON.stringify(answerArray.slice(currentQuestion - stageSize, currentQuestion)))
        // Append the current question_id to questionIdTrack, use ... to "spread" the values. The spread operator is useful when copying or
        // combining list data because it directly takes out the values from the array.
        questionIdTrack.current.push(...stageInfo.current.stageQuestionId)
        
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        console.log("REDEFINING THE CURRRENT ANSWERS TO BE SUBMITTED")
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
        console.log("ANSWERS FOR THE CURRENT STAGE SUBMITTED SUBMITTED!")
        if (fetchedGradedAnswer) {
            console.log("HERE ARE THE RESULTS OF THE CURRENT STAGE")
            console.log(fetchedGradedAnswer)
            // Use the "..." to directly push the values of fetchedGradedAnswer to gradedAnswers.current
            gradedAnswers.current.push(...fetchedGradedAnswer)
            console.log("HERE ARE THE LAST FIVE GRADED ANSWERS, THE ONES FROM THE CURRENT STAGE")
            console.log(gradedAnswers.current.slice(-stageSize))
            return fetchedGradedAnswer
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
      console.log("TEST WILL BE SUBMITTED!")
      let submitInfo: testUtils.submitData = {
        resultId: currentTestInfo.resultId,
        pastId: questionIdTrack.current,
        userAttempt: currentTestInfo.userAttempt,
        isCorrect: gradedAnswers.current,
        stageArray: stageInfo.current.stageDifficulty
      }
      if (currentTestInfo.userAttempt !== 0) {
        const fetchedResponse = await testUtils.submitTest('submitTest', submitInfo);
        console.log(fetchedResponse)

        const currentAttempt = currentTestInfo.userAttempt;
        const currentRecord = currentTestInfo.resultId;
        const urlParams = new URLSearchParams();
        urlParams.set('attempt', currentAttempt.toString());
        urlParams.set('r', currentRecord.toString());
        urlParams.set('s', shuffleSeed.toString());

        console.log(`ABOUT TO PUSH THROUGH ROUTE WITH THIS ATTEMPT NUMBER: ${currentAttempt}, THIS RECORD NUMBER: ${currentRecord}, AND THIS SEED: ${shuffleSeed}!`);
        router.push(`/results?${urlParams.toString()}`);
      }
      // If there is an error, log to console.
      else {
        console.log("An error occured while sending the test form data to the backend.");
      }
    }
  }
  
  //const correctCount = calculateCorrect(gradedAnswers.current, stageSize);

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
    console.log("CURRENT SELECTED ANSWER");
    console.log(selectedAnswer);
    console.log("ABOUT TO ENTER THE HTML!");
    console.log(questions);
    console.log("CURRENT QUESTION!");
    console.log(currentQuestion);
    console.log("CURRENT FIRST AND LAST CHECKS");
    console.log(isFirstQuestion, isLastQuestion);

    console.log("CURRENT STATUS OF ANSWER ARRAY");
    console.log(answerArray);
    console.log("LENGTH OF THE ANSWER ARRAY");
    console.log(answerArray.length);

    console.log("CURRENT LIST OF GRADED ANSWERS");
    console.log(gradedAnswers);
    console.log("CURRENT LIST OF STAGE VALUES");
    console.log(stageInfo.current.stageDifficulty);
    console.log("CURRENT STAGE");
    console.log(stageInfo.current.stageNum);
    console.log("DISPLAY THE CURRENT QUESTION OF THE CURRENT STAGE");
    console.log(stageInfo.current.stageQuestion);

    console.log("CURRENT TEST INFO WHILE TAKING THE TEST");
    console.log(currentTestInfo);
    console.log("HAS THE STAGE BEEN SUBMITTED?");
    console.log(isSubmitted);
  }, [selectedAnswer, questions, currentQuestion, answerArray, isSubmitted])
  
  //Here the change in the selection of an answer for the current question will be handled
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This line refers to the name and value fields of an HTML input tag, and uses object destructuring to assign them values from
    // event.target, which itself refers to the HTML element that triggered the event in the first place.
    const {name, value} = event.target;

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

  const handleNextStage = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    // After the user presses the continue button, the following will be executed
    // If the user did well enough and they have not reached the final stage, move onto the next stage but do not submit the test.
    if (stageInfo.current.stageNum < 4 && correctTotal.current > 3) {
      startTransition(async () => {
        console.log(`SCORES FOR STAGE ${stageInfo.current.stageNum} WERE SUFFICIENT, MOVE ONTO THE NEXT STAGE.`);
        await handleQuestionRetrieve(event);

        setCurrentQuestion(prev => prev + 1);
        //Reset it before exiting
        setIsSubmitted(false);
      });
    }
    // Otherwise, do the following
    else {
      if (stageInfo.current.stageNum > 4) {
        console.log(`USER HAS REACHED THE FINAL STAGE, END THE TEST NOW.`);
      }
      else {
        console.log(`SCORES FOR STAGE ${stageInfo.current.stageNum} WERE TOO LOW, END THE TEST NOW.`);
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
      await handleCorrectCount(gradedAnswers.current);

      //Set submitted to true so that the modal can be displayed
      setIsSubmitted(true);
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
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-start justify-between bg-white dark:bg-black">
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
        <form name = "placeTest" onSubmit = {handleTestForm} className = "flex flex-col space-y-4 items-start justify-start">
          {
            //If questions exists and its length is greater than 0, or currentQuestion is less than the length, display the current question
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
          <div className = "flex w-full justify-end">
            {isLastQuestion  ? (
              <button type = "submit" form = "placeTest" name = "submitButton" className = {`${buttonDefaults} 
                // If it is not the last question, the stage was submitted, or if the user has not selected an answer, used the disabled style. Otherwise use regular.
                ${!isLastQuestion || isSubmitted || !answerArray[currentQuestion]?.userText ? (disabledButton) : (regularButton)}`}
              disabled = { // If it is not the last question, the stage was submitted, or if the user has not selected an answer
                !isLastQuestion || isSubmitted || !answerArray[currentQuestion]?.userText}
              onClick = {handleButtonChange}>Submit Answers</button>
            ) : (
              <button 
              type = "button" form = "placeTest" name = "next" className = {`${buttonDefaults} 
                // If the user has not selected an answer, used the disabled style. Otherwise use regular.
                ${!answerArray[currentQuestion]?.userText ? (disabledButton) : (regularButton)}`}
              disabled = { // If the user has not selected an answer
                !answerArray[currentQuestion]?.userText}
              onClick = {handleButtonChange}>Next</button>
            )
            }
          </div>
        </form>
      </main>
    </div>
  );
}