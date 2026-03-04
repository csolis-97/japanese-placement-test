export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import ResultsDisplay from "@/app/components/ResultDisplay/ResultDisplay";

export default async function Home() {


  //HTML return for the results page
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Suspense fallback= {<div>Loading Results...</div>}>
          <ResultsDisplay/>
        </Suspense>
      </main>
    </div>
  );
}
