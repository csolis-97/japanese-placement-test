export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import ResultsDisplay from "@/app/components/ResultDisplay/ResultDisplay";

export default async function Home() {


  //HTML return for the results page
  return (
    <>
    <Suspense fallback= {<div>Loading Results...</div>}>
      <ResultsDisplay/>
    </Suspense>
    </>
  );
}
