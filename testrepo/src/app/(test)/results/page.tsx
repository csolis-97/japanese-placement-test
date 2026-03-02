"use server";

import { Suspense } from "react";
import ResultsDisplay from "@/app/components/ResultDisplay/ResultDisplay";

export default async function Home() {


  //Although not needed, here is a sample of a constant being defined to map results from one table to another
  /*const mapNewTestForm = (question: any): testForm => {
    questionId: question.new_question_id
  }
  */

  // Use useEffect to fetch the test data when the component mounts.
  async function fetchResults() {

  }

  //HTML return for the test form page
  return (
    <>
    <Suspense fallback= {<div>Loading Results...</div>}>
      <ResultsDisplay/>
    </Suspense>
    </>
  );
}
