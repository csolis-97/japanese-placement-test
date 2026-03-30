// Type defined below will be used to store and send necessary background info for the current test.
export type InfoData = {
    resultId: number;
    userAttempt: number;
    email: string;
    name: string;
};

// Type defined below will be used for setting the test questions and answers for components.
export type QuestionType = {
  questionId: number;
  questionText: string;
  questionBody: string;
  questionCategory: string;
  answerId: number[];
  answerText: string[];
  userText: string;
  alreadyAnswered: boolean;
};