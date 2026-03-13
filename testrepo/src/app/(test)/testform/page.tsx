export const dynamic = 'force-dynamic';

import * as testUtils from "@/app/components/testTake/testActions";
import TestDisplay from "@/app/components/TestDisplay";

export default async function Home() {

  //Make a default request for fetching the first question
  let initialRequest: testUtils.requestData = {
    questionId: [0],
    pastId: [],
    questionCategory: "Beginner I",
    wasCorrect: [false]
  };

  async function fetchInitialQuestions() {
    // Fetch the test form data from the backend, with 'retrieveOneQuestion' as the action to take
    console.log("ABOUT TO FETCH THE INITIAL STAGE!")
    const fetchedQuestion = await testUtils.questionFetch('retrieveStage', initialRequest)
    console.log("FETCH A NEW STAGE!")
    if (fetchedQuestion) {
      console.log("HERE IS THE RESULT OF THE FETCHED QUESTION")
      console.log(fetchedQuestion)
    }
    else {
      console.log("Error retrieving the initial questions.")
    }
    return fetchedQuestion;
  }
    
  const initialQuestions = await fetchInitialQuestions();
  
  //HTML return for the test form page
  return (
    <div className="flex sm:min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
      <main className="flex sm:min-h-screen sm:w-full sm:max-w-3xl flex-col items-center justify-between px-16 bg-white dark:bg-black ">
        {
          // Send the initial questions as a prop to testDisplay component
          <TestDisplay initialQuestions = {initialQuestions}/>
        }
      </main>
    </div>
  );
}
