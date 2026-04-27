// Interface below will be used for when each question itself is displayed during the test. Fields should be the exact 
// same as the ones in the database in order to be properly displayed.
export interface TestQuestion {
  question_id: number;
  question_text: string;
  question_text_furigana?: string;
  question_body: string;
  question_body_furigana?: string;
  question_level: string;
  question_audio?: string;
  answer_id: number[];
  answer_text: string[];
  answer_text_furigana?: string[];
  already_answered?: boolean;
  correct_answer?: boolean[];
  is_correct?: boolean;
};

// Interface below will be used for when each question itself is displayed in the results page. Fields should be the exact 
// same as the ones in the database in order to be properly displayed.
export interface ResultQuestion {
  question_id: number;
  question_text: string;
  question_text_furigana?: string;
  question_body: string;
  question_body_furigana?: string;
  question_level: string;
  question_audio?: string;
  answer_id: number[];
  answer_text: string[];
  answer_text_furigana?: string[];
  already_answered?: boolean;
  correct_answer?: boolean[];
  user_answer_text: string;
  user_was_correct?: boolean;
  response_order: number;
};
  
// Interface below will be used for displaying the user's test result info. Fields should be the exact
// same as the ones in the database in order to be properly displayed.
export interface TestResult {
  score_id: number;
  attempt_id: number;
  total_score: number;
  entrance_level: string;
  end_time: Date;
};