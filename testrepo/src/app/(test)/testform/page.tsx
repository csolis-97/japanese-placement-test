"use server";

import TestDisplay from "@/components/TestDisplay";

export default async function Test() {
  
  //HTML return for the test form page
  return (
    <div className = {`
      flex font-sans
      justify-center bg-[#d1190d]
    `}>
      <main className={`
        max-w-3xl bg-white
        px-[1.7rem] sm:px-16 
      `}>
        {
          <TestDisplay />
        }
      </main>
    </div>
  );
}