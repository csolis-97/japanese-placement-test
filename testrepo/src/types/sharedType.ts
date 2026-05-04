// Type defined below will be used to store and send necessary background info for the current test.
export type InfoData = {
  resultId: number;
  attemptId: number;
  email: string;
  name: string;
};

// Type defined below will be used to store and send necessary info to grade the current stage
export type ResponseData = {
    questionId: number[];
    pastId: number[];
    userText: string[];
    attemptId: number;
    resultId: number;
    currentStageNum: number;
};

// Type defined below will be used to store and send necessary info to fetch the next stage
export type RequestData = {
    questionId: number[];
    pastId: number[];
    questionCategory: string;
    wasCorrect: boolean[];
};

// Type defined below will be used to store and send info for submitting the test
export type SubmitData = {
    resultId: number;
    attemptId: number;
    pastId: number[];
    isCorrect: boolean[];
    stageDifficultyArray: string[];
    urlId: string;
};

// Type defined below will be used to request the answers for the current attemptId and resultId
export type AnswersRequest = {
    attemptId: number;
    resultId: number;
};

// Type defined below will be used to request the result info for the current urlId, alongside testDate
export type ResultRequest = {
    testDate: Date;
    urlId: string;
};

// Type defined below will be used for tracking each stage's info, including each stage's difficulty,
// the current stage number, the current question of the stage, and the current stage's question_ids.
export type StageData = {
  stageDifficulty: string[];
  stageNum: number;
  stageQuestion: number;
  stageQuestionId: number[];
};

// Type defined below will be used for setting the test questions and answers for components.
export type QuestionType = {
  questionId: number;
  questionAudio?: string;
  questionText: string;
  questionTextFurigana?: string;
  questionBody: string;
  questionBodyFurigana?: string;
  questionCategory: string;
  answerId: number[];
  answerText: string[];
  answerTextFurigana?: string[];
  userText: string;
  alreadyAnswered: boolean;
};

// Type defined below is a more cut-down version of QuestionType, used to track the user's answers.
export type UserAnswerType = {
  questionId: number;
  userText: string;
  alreadyAnswered: boolean;
};