"use client";

import { useRouter } from "next/navigation";
import { 
  useState, 
  useRef, 
  Dispatch, 
  SetStateAction, 
  RefObject
} from "react";
import * as testUtils from "./testActions";
import { QuestionType } from "./testTake";
import { TestQuestion } from "../TestDisplay";
import { InfoData } from "../testStart/startActions";
import { 
  errorType,
  shuffleList, 
  seedCreate
} from "@/app/utils/utilFunctions";

type TestFlowProps = {
  currentTestInfo: InfoData;
  questions: TestQuestion[];
  setQuestions: Dispatch<SetStateAction<TestQuestion[]>>;
  answerArray: QuestionType[];
  setAnswerArray: Dispatch<SetStateAction<QuestionType[]>>;
  currentQuestion: number;
  stageInfo: RefObject<testUtils.StageData>;
  gradedAnswers: RefObject<boolean[]>;
  correctTotal: RefObject<number>;
};

export function useTestFlow({ 
  currentTestInfo, 
  questions, 
  setQuestions, 
  answerArray, 
  setAnswerArray, 
  currentQuestion, 
  stageInfo, 
  correctTotal, 
  gradedAnswers 
} : TestFlowProps) {

  // RIGHT NOW EACH STAGE IS HARDCODED TO BE JUST 5 QUESTIONS, SO CHECK HERE IF THAT EVER CHANGES!
  const STAGE_SIZE = questions.length;
  const START_STAGE = stageInfo.current.stageNum * STAGE_SIZE;

  let currentRequest: testUtils.RequestData;
  let currentAnswer: testUtils.ResponseData;

  //Finally, useState for errors
  const [error, setError] = useState<Error | null>();

  //This useRef will track all of the question IDs used, regardless of stage
  const questionIdTrack = useRef<number[]>([]);

  //Router will be used to push certain info when routed to the results page
  const router = useRouter();

  if (error) {
    console.log("AN ERROR OCCURED IN THE USETESTFLOW HOOK: ", error);
    throw error;
  }

  // This little function will calculate the correct answers for the stage, using the current value of the gradedAnswers useRef
  async function handleCorrectCount(gradedAnswers: boolean[]) {
    const correctCount = gradedAnswers.slice(-STAGE_SIZE).filter(Boolean).length;
    console.log("HERE IS CORRECT COUNT!");
    console.log(correctCount);
    correctTotal.current = correctCount;
  }

  // This function deals with the logic for fetching questions
  async function handleQuestionRetrieve(event: React.SyntheticEvent) {
    event.preventDefault();
    console.log("ABOUT TO RETRIEVE SOME NEW QUESTIONS FOR THE NEXT STAGE");
    try {
      if (stageInfo.current.stageNum <= 4) {
        console.log("GOING INTO THE FETCHING NEW QUESTIONS FUNCTION");
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        console.log("REDEFINING THE CURRRENT QUESTION REQUEST");
        currentRequest = {
          questionId: stageInfo.current.stageQuestionId,
          pastId: questionIdTrack.current,
          questionCategory: stageInfo.current.stageDifficulty[stageInfo.current.stageNum],
          // Check the last stage's five answers
          wasCorrect: gradedAnswers.current.slice(-STAGE_SIZE)
        };
        console.log("ABOUT TO FETCH THE NEXT STAGE!");
        const fetchedQuestion = await testUtils.questionFetch('retrieveStage', currentRequest);
        console.log("FETCHED THE NEXT STAGE!");
        if (fetchedQuestion) {
          console.log("HERE IS THE RESULT OF THE FETCHED QUESTION");

          let nextQuestions = JSON.parse(JSON.stringify(fetchedQuestion));
          const nextShuffleSeed = seedCreate([
            currentTestInfo.userAttempt,
            (currentTestInfo.userAttempt % currentTestInfo.resultId),
            currentTestInfo.resultId
          ]);
          //seedShuffle(shuffleQuestions, nextShuffleSeed);
          const shuffleQuestions = shuffleList(nextQuestions, nextShuffleSeed);
          console.log("NEW QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");

          for (let i = shuffleQuestions.length - 1; i > -1; i--) {
            console.log(`HERE IS THE QUESTION ID FOR THE CURRENT QUESTION: ${shuffleQuestions[i].question_id}`);
            console.log(`HERE ARE THE ANSWER IDS FOR THE CURRENT QUESTION: ${shuffleQuestions[i].answer_id}`);
            console.log(`HERE ARE THE ANSWER TEXTS FOR THE CURRENT QUESTION: ${shuffleQuestions[i].answer_text}`);
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
            }));
            // If it is the first stage, return the array that was created above. Otherwise, combine the two
            return stageInfo.current.stageNum === 0 ? newArray : [...prevData, ...newArray];
          });

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
          console.log("THERE WAS AN ERROR IN THE HANDLEQUESTIONRETRIEVE OF THE USETESTFLOW HOOK!");
          throw new Error("Error retrieving the next stage's questions.");
        }
      }
    }
    catch(fetchError) {
      console.log("ERROR WAS CAUGHT IN THE HANDLEQUESTIONRETRIEVE OF THE USETESTFLOW HOOK!");
      setError(errorType(fetchError));
      console.log("ERROR WAS SET!");
    }
  }

  // This function deals with the logic of submitting questions
  // The event argument is optional, as this function can also be called when forcefully ending the test through the timer
  // but by default the forcedSubmit is set to false, making it also optional
  async function handleQuestionSubmit(event?: React.SyntheticEvent, forcedSubmit?: boolean) {
    // Check if it is an event, otherwise the questions are being submitted because the timer ran out
    if (event) {
      event.preventDefault();
    }
    console.log(`ABOUT TO SUBMIT THE ANSWERS OF STAGE ${stageInfo.current.stageNum + 1}!`);
    try {
      if ((answerArray[currentQuestion] && stageInfo.current.stageQuestion === 4) || forcedSubmit === true) {
        console.log("USER ANSWERS TO BE SUBMITTED");
        // Since answerArray is an object with no toString function, use JSON.stringify to properly display the answer data in the console log
        console.log(JSON.stringify(answerArray.slice(currentQuestion - STAGE_SIZE, currentQuestion)));
        // Append the current question_id to questionIdTrack, use ... to "spread" the values. The spread operator is useful when copying or
        // combining list data because it directly takes out the values from the array.
        questionIdTrack.current.push(...stageInfo.current.stageQuestionId);
        
        // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
        console.log("REDEFINING THE CURRRENT ANSWERS TO BE SUBMITTED");
        currentAnswer = {
          questionId: stageInfo.current.stageQuestionId,
          pastId: questionIdTrack.current,
          userText: answerArray.slice((START_STAGE), (START_STAGE+STAGE_SIZE)).map(answer => answer.userText),
          userAttempt: currentTestInfo.userAttempt,
          resultId: currentTestInfo.resultId,
          currentStage: stageInfo.current.stageNum
        };

        const fetchedGradedAnswer = await testUtils.questionCheck('sendStage', currentAnswer);
        console.log("ANSWERS FOR THE CURRENT STAGE SUBMITTED SUBMITTED!");
        if (fetchedGradedAnswer) {
          console.log("HERE ARE THE RESULTS OF THE CURRENT STAGE");
          console.log(fetchedGradedAnswer);
          // Use the "..." to directly push the values of fetchedGradedAnswer to gradedAnswers.current
          gradedAnswers.current.push(...fetchedGradedAnswer);
          console.log("HERE ARE THE LAST FIVE GRADED ANSWERS, THE ONES FROM THE CURRENT STAGE");
          console.log(gradedAnswers.current.slice(-STAGE_SIZE));
          return fetchedGradedAnswer;
        }
        else {
          console.log("THERE WAS AN ERROR IN THE HANDLEQUESTIONSUBMIT OF THE USETESTFLOW HOOK!");
          throw new Error("Error submitting the current stage's questions.");
        }
      }
    }
    catch(gradeError) {
      console.log("ERROR WAS CAUGHT IN THE HANDLEQUESTIONSUBMIT OF THE USETESTFLOW HOOK!");
      setError(errorType(gradeError));
      console.log("ERROR WAS SET!");
    }
  }

  //Function to handle the test form itself, once the user presses the submit button
  async function handleTestForm(event: React.SyntheticEvent) {
    event.preventDefault();
    console.log("ABOUT TO SUBMIT THE TEST!");
    try {
      if (currentTestInfo.userAttempt !== 0) {
        // Await the test submission logic
        await handleTestSubmit();
        // Await the routing logic
        await handleRouter();
      }
      else {
        console.log("THERE WAS AN ERROR IN THE HANDLETESTFORM OF THE USETESTFLOW HOOK!");
        throw new Error("Error submitting the test.");
      }
    }
    catch(submitError) {
      console.log("ERROR WAS CAUGHT IN THE HANDLETESTFORM OF THE USETESTFLOW HOOK!");
      setError(errorType(submitError));
      console.log("ERROR WAS SET!");
    }
  }

  // Function to handle a forced test submission, once the time runs out.
  async function handleForcedTestForm(forcedSubmit: boolean) {
    console.log("TIMER RAN OUT, ABOUT TO AUTO SUBMIT THE TEST INFO!");
    try {
      if (currentTestInfo.userAttempt !== 0 || forcedSubmit) {
        // Await the test submission logic
        await handleTestSubmit();
      }
      else {
        console.log("THERE WAS AN ERROR IN THE HANDLEFORCEDTESTFORM OF THE USETESTFLOW HOOK!");
        throw new Error("Error submitting the test results after a forced submission.");
      }
    }
    catch(formError) {
      console.log("ERROR WAS CAUGHT IN THE HANDLEFORCEDTESTFORM OF THE USETESTFLOW HOOK!");
      setError(errorType(formError));
      console.log("ERROR WAS SET!");
    }
  }

  // Function to handle a forced routing, once the time runs out.
  async function handleForcedRouter(event: React.SyntheticEvent) {
    event.preventDefault();
    console.log("TIMER RAN OUT, ABOUT TO ROUTE TO THE RESULTS!");
    try {
      if (currentTestInfo.userAttempt !== 0) {
        // Await the routing logic
        await handleRouter();
      }
      else {
        console.log("THERE WAS AN ERROR IN THE HANDLEFORCEDROUTER OF THE USETESTFLOW HOOK!");
        throw new Error("Error routing to the results after a forced submission.");
      }
    }
    catch(formError) {
      console.log("ERROR WAS CAUGHT IN THE HANDLEFORCEDROUTER OF THE USETESTFLOW HOOK!");
      setError(errorType(formError));
      console.log("ERROR WAS SET!");
    }
  }

  async function handleTestSubmit() {
    try {
      if (currentTestInfo.userAttempt !== 0) {
        let submitInfo: testUtils.SubmitData = {
          resultId: currentTestInfo.resultId,
          pastId: questionIdTrack.current,
          userAttempt: currentTestInfo.userAttempt,
          isCorrect: gradedAnswers.current,
          stageArray: stageInfo.current.stageDifficulty
        };
        const fetchedResponse = await testUtils.submitTest('submitTest', submitInfo);
        console.log(fetchedResponse);
      }
      else {
        console.log("THERE WAS AN ERROR IN THE HANDLETESTSUBMIT OF THE USETESTFLOW HOOK!");
        throw new Error("Error submitting the test record info.");
      }
    }
    catch(submitError) {
      console.log("ERROR WAS CAUGHT IN THE HANDLETESTSUBMIT OF THE USETESTFLOW HOOK!");
      setError(errorType(submitError));
      console.log("ERROR WAS SET!");
    }
  }

  async function handleRouter() {
    try {
      if (currentTestInfo.userAttempt !== 0) {
        const currentAttempt = currentTestInfo.userAttempt;
        const currentRecord = currentTestInfo.resultId;
        const urlParams = new URLSearchParams();
        urlParams.set('attempt', currentAttempt.toString());
        urlParams.set('r', currentRecord.toString());

        console.log(`ABOUT TO PUSH THROUGH ROUTE WITH THIS ATTEMPT NUMBER: ${currentAttempt} AND THIS RECORD NUMBER: ${currentRecord}!`);
        router.push(`/results?${urlParams.toString()}`);
      }
      else {
        console.log("THERE WAS AN ERROR IN THE HANDLEROUTER OF THE USETESTFLOW HOOK!");
        throw new Error("Error routing to the results page.");
      }
    }
    catch(routerError) {
      console.log("ERROR WAS CAUGHT IN THE HANDLEROUTER OF THE USETESTFLOW HOOK!");
      setError(errorType(routerError));
      console.log("ERROR WAS SET!");
    }
  }

  return { 
    handleCorrectCount, 
    handleQuestionRetrieve, 
    handleQuestionSubmit, 
    handleTestForm,
    handleForcedTestForm,
    handleForcedRouter
  };
}