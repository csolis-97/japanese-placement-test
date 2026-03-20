export const dynamic = 'force-dynamic';

import * as testUtils from "@/app/components/testTake/testActions";
import TestDisplay from "@/app/components/TestDisplay";

interface TestQuestion {
question_id: number;
question_text: string;
question_body: string;
question_level: string;
answer_id: number[];
answer_text: string[];
already_answered?: boolean;
correct_answer?: boolean[];
is_correct?: boolean;
};

export default async function Test() {
  
  //Make a default request for fetching the first questions
  let initialRequest: testUtils.RequestData = {
    questionId: [0],
    pastId: [],
    questionCategory: "Beginner I",
    wasCorrect: [false]
  };

  // Fetch the initial set of questions from the backend, with 'retrieveStage' as the action to take
  console.log("ABOUT TO FETCH THE INITIAL STAGE!");
  const fetchedQuestion = testUtils.questionFetch('retrieveStage', initialRequest) as Promise<TestQuestion[]>;
  console.log("FETCHED THE INITIAL STAGE!");
  console.log(`HERE IS THE RESULT OF THE FETCHED QUESTION: ${fetchedQuestion}`);
  
  //HTML return for the test form page
  return (
    <div className = {`
      flex 
      justify-center bg-[#d1190d] 
      font-sans dark:bg-black
    `}>
      <main className={`
        max-w-3xl
        px-[1.7rem] sm:px-16 
        bg-white dark:bg-black
      `}>
        {
          // Send the initial questions as a prop to testDisplay component
          <TestDisplay initialQuestionsPromise = {fetchedQuestion}/>
        }
      </main>
    </div>
  );
}