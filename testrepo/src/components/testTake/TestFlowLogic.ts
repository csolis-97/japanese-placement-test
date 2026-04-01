import { ActionKey, apiAction } from "@/utils/apiUtilFunctions";
import { handleStageInfoUpdate, expandAnswerArray } from "./TestUtilities";
import { TestQuestion } from "@/types/sharedInterface";
import { InfoData, SubmitData, StageData, UserAnswerType } from "@/types/sharedType";
import { shuffleList, seedCreate, shuffleResultsPrint } from "@/utils/utilFunctions";

type StageRetrieveParams = {
  stageInfo: StageData,
  questionIdTrack: number[], 
  gradedAnswers: boolean[], 
  STAGE_SIZE: number,
  currentTestInfo: InfoData, 
  answerArray: UserAnswerType[]
};

type StageSubmitParams = {
  stageInfo: StageData,
  answerArray: UserAnswerType[],
  currentQuestion: number,
  forcedSubmit: boolean,
  STAGE_SIZE: number,
  questionIdTrack: number[], 
  currentTestInfo: InfoData,
  gradedAnswers: boolean[]
};

type TestSubmitParams = {
  randomUrlId: string
  currentTestInfo: InfoData,
  questionIdTrack: number[],
  gradedAnswers: boolean[],
  stageInfo: StageData
};

// This function deals with the logic for fetching questions
export async function stageRetrieve(params: StageRetrieveParams) {
  const { stageInfo, questionIdTrack, gradedAnswers, STAGE_SIZE } = params;
  if (stageInfo.stageNum <= 4) {
    console.log("REDEFINING THE CURRRENT QUESTION REQUEST");
    const currentRequest = {
      questionId: stageInfo.stageQuestionId,
      pastId: questionIdTrack,
      questionCategory: stageInfo.stageDifficulty[stageInfo.stageNum],
      // Check the last stage's five answers
      wasCorrect: gradedAnswers.slice(-STAGE_SIZE)
    };
    console.log("ABOUT TO FETCH THE NEXT STAGE!");
    const fetchQuestionRecord: ActionKey = {
      action: 'retrieveStage',
      givenFields: currentRequest
    }
    const fetchedQuestion = await apiAction(fetchQuestionRecord);
    //const fetchedQuestion = await testUtils.questionFetch('retrieveStage', currentRequest);
    if (fetchedQuestion) {
      console.log("FETCHED THE NEXT STAGE!");
      const nextStage = prepareStage(fetchedQuestion, params);

      return {
        nextQuestions: nextStage.shuffleQuestions,
        nextAnswerArray: nextStage.expandedArray,
        nextStageInfo: nextStage.newStageInfo
      }
    }
    else {
      console.log("THERE WAS AN ERROR IN THE STAGERETRIEVE IN SHAREDHOOKLOGIC!");
      throw new Error("Error retrieving the next stage's questions.");
    }
  }
}

// The helper function for stageRetrieve. It handles the question shuffling, expanding the answer array, and updating the stage info
function prepareStage(fetchedQuestion: TestQuestion[], params: StageRetrieveParams) {
  const {currentTestInfo, answerArray, stageInfo } = params;
  let nextQuestions = fetchedQuestion;
  const nextShuffleSeed = seedCreate([
      currentTestInfo.attemptId,
      (currentTestInfo.attemptId % currentTestInfo.resultId),
      currentTestInfo.resultId
  ]);

  const shuffleQuestions: TestQuestion[] = shuffleList(nextQuestions, nextShuffleSeed);
  console.log("NEW QUESTION ANSWER OPTIONS HAVE BEEN SHUFFLED!");
  shuffleResultsPrint(shuffleQuestions);
  // If the questions were fetched, combine the previous answerData with new indices to be used
  const expandedArray = expandAnswerArray(answerArray, fetchedQuestion, stageInfo.stageNum);
  const newStageInfo = handleStageInfoUpdate(stageInfo, fetchedQuestion);
  return {
    shuffleQuestions,
    expandedArray,
    newStageInfo
  };
}

// This function deals with the logic of submitting questions. The forcedSubmit argument is used when the test must be auto submitted
export async function stageSubmit(params: StageSubmitParams) {
  const { 
    stageInfo, answerArray, 
    currentQuestion, forcedSubmit, 
    STAGE_SIZE, questionIdTrack, 
    currentTestInfo, gradedAnswers 
  } = params;

  console.log(`ABOUT TO SUBMIT THE ANSWERS OF STAGE ${stageInfo.stageNum + 1}!`);
  if ((answerArray[currentQuestion] && stageInfo.stageQuestion === 4) || forcedSubmit === true) {
    const START_STAGE = stageInfo.stageNum * STAGE_SIZE;
    console.log("USER ANSWERS TO BE SUBMITTED");
    console.log(answerArray.slice(currentQuestion - STAGE_SIZE, currentQuestion));
    // Append the current question_id to questionIdTrack, use ... to "spread" the values. The spread operator is useful when copying or
    // combining list data because it directly takes out the values from the array.
    questionIdTrack.push(...stageInfo.stageQuestionId);
    
    console.log("REDEFINING THE CURRRENT ANSWERS TO BE SUBMITTED");
    const currentAnswers = {
      questionId: stageInfo.stageQuestionId,
      pastId: questionIdTrack,
      userText: answerArray.slice((START_STAGE), (START_STAGE + STAGE_SIZE)).map(answer => answer.userText),
      attemptId: currentTestInfo.attemptId,
      resultId: currentTestInfo.resultId,
      currentStageNum: stageInfo.stageNum
    };

    const fetchGradedRecord: ActionKey = {
      action: 'sendStage',
      givenFields: currentAnswers
    }
    const fetchedGradedAnswer = await apiAction(fetchGradedRecord);
    //const fetchedGradedAnswer = await testUtils.questionCheck('sendStage', currentAnswers);
    if (fetchedGradedAnswer) {
      console.log("ANSWERS FOR THE CURRENT STAGE SUBMITTED SUBMITTED!");
      const latestGradedAnswers = prepareGradedAnswers(fetchedGradedAnswer, gradedAnswers, STAGE_SIZE);
      return latestGradedAnswers;
    }
    else {
      console.log("THERE WAS AN ERROR IN THE STAGESUBMIT OF SHAREDHOOKLOGIC!");
      throw new Error("Error submitting the current stage's questions and/or grading them.");
    }
  }
}

// The helper funciton for stageSubmit. It handles updating the list of graded answers.
function prepareGradedAnswers(fetchedGradedAnswer: boolean[], gradedAnswers: boolean[], STAGE_SIZE: number) {
  console.log("HERE ARE THE RESULTS OF THE CURRENT STAGE");
  console.log(fetchedGradedAnswer);
  // Use the "..." to directly push the values of fetchedGradedAnswer to gradedAnswers.current
  gradedAnswers.push(...fetchedGradedAnswer);
  const newGradedAnswers = gradedAnswers;
  console.log("HERE ARE THE LAST FIVE GRADED ANSWERS, THE ONES FROM THE CURRENT STAGE");
  console.log(gradedAnswers.slice(-STAGE_SIZE));
  return newGradedAnswers;
}

// This function deals with the logic of submitting the test
export async function testSubmit(params: TestSubmitParams) {
  const { randomUrlId, currentTestInfo, questionIdTrack, gradedAnswers, stageInfo } = params;
  console.log(`HERE IS THE RANDOMLY GENERATED UUID TO BE USED TO FETCH THE RESULTS: ${randomUrlId}`);

  if (currentTestInfo.attemptId !== 0) {
    const submitInfo: SubmitData = {
      resultId: currentTestInfo.resultId,
      pastId: questionIdTrack,
      attemptId: currentTestInfo.attemptId,
      isCorrect: gradedAnswers,
      stageDifficultyArray: stageInfo.stageDifficulty,
      urlId: randomUrlId
    };

    const testRecord: ActionKey = {
      action: 'submitTest',
      givenFields: submitInfo
    }
    const fetchedResponse = await apiAction(testRecord);
    //const fetchedResponse = await testUtils.submitTest('submitTest', submitInfo);
    console.log(fetchedResponse);
  }
  else {
    console.log("THERE WAS AN ERROR IN THE TESTSUBMIT OF THE SHAREDHOOKLOGIC!");
    throw new Error("Error submitting the test record info.");
  }
}