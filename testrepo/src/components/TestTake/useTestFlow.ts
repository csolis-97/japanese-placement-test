"use client";

import { useRouter } from "next/navigation";
import { 
  useState, 
  useRef, 
  Dispatch, 
  SetStateAction, 
  RefObject
} from "react";
import { stageRetrieve, stageSubmit, testSubmit } from "./TestFlowLogic";
import { handleCorrectCount } from "./TestUtilities";
import { TestQuestion } from "@/types/sharedInterface";
import { InfoData, StageData, UserAnswerType } from "@/types/sharedType";
import { errorType } from "@/utils/utilFunctions";

type TestFlowProps = {
  state: {
    currentTestInfo: InfoData;
    questions: TestQuestion[];
    currentQuestion: number;
    answerArray: UserAnswerType[];
  },
  setState: {
    setQuestions: Dispatch<SetStateAction<TestQuestion[]>>;
    setAnswerArray: Dispatch<SetStateAction<UserAnswerType[]>>;
  },
  ref: {
    stageInfo: RefObject<StageData>;
    gradedAnswers: RefObject<boolean[]>;
    questionIdTrack: RefObject<number[]>;
    correctTotal: RefObject<number>;
  }
};

export function useTestFlow({ state, setState, ref } : TestFlowProps) {
  const { currentTestInfo, questions, currentQuestion, answerArray } = state;
  const { setQuestions, setAnswerArray } = setState;
  const { stageInfo, gradedAnswers, questionIdTrack, correctTotal } = ref;

  // RIGHT NOW EACH STAGE IS HARDCODED TO BE JUST 5 QUESTIONS, SO CHECK HERE IF THAT EVER CHANGES!
  const STAGE_SIZE = questions.length;

  //Finally, useState for errors
  const [error, setError] = useState<Error | null>();

  // Create a random UUID to display the properly test results later on
  const randomUrlId = useRef<string>(crypto.randomUUID());

  // Router will be used to push certain info when routed to the results page
  const router = useRouter();

  if (error) {
    console.log("AN ERROR OCCURED IN THE USETESTFLOW HOOK: ", error);
    throw error;
  }

  // This function deals with the logic for fetching questions
  async function handleQuestionRetrieve(event: React.SyntheticEvent) {
    event.preventDefault();
    console.log("ABOUT TO RETRIEVE SOME NEW QUESTIONS FOR THE NEXT STAGE");
    try {
      const nextStage = await stageRetrieve({
        stageInfo: stageInfo.current,
        questionIdTrack: questionIdTrack.current,
        gradedAnswers: gradedAnswers.current,
        STAGE_SIZE: STAGE_SIZE,
        currentTestInfo: currentTestInfo,
        answerArray: answerArray
      });

      // If the next stage's data was fetched and created succsessfully, set it here
      if (nextStage) {
        stageInfo.current = nextStage.nextStageInfo;
        setQuestions(nextStage.nextQuestions);
        setAnswerArray(nextStage.nextAnswerArray);
      }
      else {
          console.log("THERE WAS AN ERROR IN THE HANDLEQUESTIONRETRIEVE OF THE USETESTFLOW HOOK!");
          throw new Error("Error setting the data for the next stage.");
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
    if (!forcedSubmit) {
      forcedSubmit = false;
    }
    try {
      // Wait for the question to be submitted before going any further
      // Set forcedSubmit to false as this is a regular submission
      const latestGradedAnswers = await stageSubmit({
        stageInfo: stageInfo.current,
        answerArray: answerArray,
        currentQuestion: currentQuestion,
        forcedSubmit: forcedSubmit,
        STAGE_SIZE: STAGE_SIZE,
        questionIdTrack: questionIdTrack.current, 
        currentTestInfo: currentTestInfo,
        gradedAnswers: gradedAnswers.current
      });

      // If the next stage's data was fetched and created succsessfully, set it here
      if (latestGradedAnswers) {
        gradedAnswers.current = latestGradedAnswers;
        // Await the correct number of answers for the stage before moving on
        correctTotal.current = handleCorrectCount(gradedAnswers.current, STAGE_SIZE);
      }
      else {
        console.log("THERE WAS AN ERROR IN THE HANDLEQUESTIONSUBMIT OF THE USETESTFLOW HOOK!");
        throw new Error("Error submitting and/or grading the questions from the current stage.");
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
      if (currentTestInfo.attemptId !== 0) {
        // Await the test submission
        await testSubmit({
          randomUrlId: randomUrlId.current,
          currentTestInfo: currentTestInfo,
          questionIdTrack: questionIdTrack.current,
          gradedAnswers: gradedAnswers.current,
          stageInfo: stageInfo.current
        });
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

  // Function to handle the actual routing itself, using the randomly generated UUID
  async function handleRouter() {
    try {
      if (currentTestInfo.attemptId !== 0) {
        const currentUrlId = randomUrlId.current;
        const urlParams = new URLSearchParams();
        urlParams.set('id', currentUrlId);

        console.log(`ABOUT TO PUSH THROUGH ROUTE WITH THIS ID VALUE: ${currentUrlId}!`);
        router.push(`/results/${currentUrlId.toString()}`);
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

  // Function to handle a forced test submission, once the timer runs out.
  async function handleForcedTestForm(forcedSubmit: boolean) {
    console.log("TIMER RAN OUT, ABOUT TO AUTO SUBMIT THE TEST INFO!");
    try {
      if (currentTestInfo.attemptId !== 0 || forcedSubmit) {
        // Await the test submission
        await testSubmit({
          randomUrlId: randomUrlId.current,
          currentTestInfo: currentTestInfo,
          questionIdTrack: questionIdTrack.current,
          gradedAnswers: gradedAnswers.current,
          stageInfo: stageInfo.current
        });
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

  // Function to handle forced routing, once the timer runs out.
  async function handleForcedRouter(event: React.SyntheticEvent) {
    event.preventDefault();
    console.log("TIMER RAN OUT, ABOUT TO ROUTE TO THE RESULTS!");
    try {
      if (currentTestInfo.attemptId !== 0) {
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

  return { 
    handleQuestionRetrieve, 
    handleQuestionSubmit, handleTestForm,
    handleForcedTestForm, handleForcedRouter
  };
}