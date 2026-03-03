"use client"
import Link from "next/link";

//This variable will apply the styling for the button
const buttonStyle = "mt-4 px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className = "text-3xl font-semibold leading-10 text-black dark:text-zinc-50">Japanese Placement Test</h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Welcome to the Japanese Placement Test! This is a simple web application that will help decide which Japanese class you will place into, based on your
            responses. The test is divided into four different stages, and the difficulty will adjust depending on your results from the previous stage. Once all of
            the questions are answered, you will receive the results alongside your recommended placement.
          </p>
          <Link href = "/testform">
              <button className = {buttonStyle} type = "button">Start</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
