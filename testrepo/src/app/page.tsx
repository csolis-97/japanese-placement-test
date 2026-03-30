import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 sm:py-32 px-16 bg-white sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className = "text-2xl sm:text-3xl font-semibold leading-10 text-black">Japanese Placement Test</h1>
          <p className="text-sm sm:text-lg leading-4 sm:leading-8 text-zinc-600">
            Welcome to the Japanese Placement Test! This is a simple web application that will help decide which Japanese class you will place 
            into. The test is divided into five distinct stages and the difficulty will only increase if you get enough questions right in
            the current stage, otherwise the test will end. Once the test ends, you will receive the results alongside your recommended placement.
          </p>
          <p className="text-sm sm:text-lg leading-4 sm:leading-8 text-zinc-600">
            Each stage currently contains five randomly selected questions from the following difficulty levels, increasing in difficulty as you 
            progress: Beginner I, Beginner II, Intermediate I, Intermediate II, and Advanced. In order to move onto the next stage, you must get 
            at least four out of five of the questions from the current stage correct. Otherwise, the test will end. Furthermore, you will only
            have five minutes to complete the placement test before the results are automatically submitted. Good luck!
          </p>
          <Link href = "/testform" className = "button-style" type = "button">
              Start
          </Link>
        </div>
      </main>
    </div>
  );
}
