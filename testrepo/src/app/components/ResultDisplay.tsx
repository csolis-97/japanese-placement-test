"use client";

import { 
  Suspense, 
  use, 
  useRef,
  useState,
  useEffect
} from "react";
import QuestionDisplay from "./QuestionDisplay";
import ResultInfo from "./ResultInfo";
import CreateResultsPDF from "./CreateResultsPDF";
import { QuestionDisplaySkeleton } from "./skeletons";
import dynamic from "next/dynamic";

//Interface below will be used for when each question itself is displayed. Fields should be the exact same as the ones in
//the database in order to be properly displayed.
interface ResultQuestion {
  question_id: number;
  question_text: string;
  question_body: string;
  question_level: string;
  answer_id: number[];
  answer_text: string[];
  already_answered?: boolean;
  correct_answer?: boolean[];
  user_answer_text: string;
  user_was_correct?: boolean;
  response_order: number;
};

//Interface below will be used for displaying the user's results.
interface TestResult {
  attempt_id: number;
  total_score: number;
  totalQuestions: number;
  entrance_level: string;
  end_time: Date;
};

interface ResultsProps {
  answersPromise: Promise<ResultQuestion[]>;
  resultsPromise: Promise<TestResult>;
};

export default function ResultsDisplay({
  answersPromise, 
  resultsPromise 
} : ResultsProps) {

  //const questions = use(answersPromise) as TestQuestion[];
  const questions = use(answersPromise);
  const results = use(resultsPromise) as TestResult;

  // This useState will be used to track whether or not the button that allows the user to go back to the top of the page
  // is toggled or not
  const[showTopButton, setshowTopButton] = useState<boolean>(false);

  // This const will be used as a ref value for the div that contains the ResultInfo component, to which the button will return
  const topDivRef = useRef<HTMLDivElement>(null);

  // Dynamically import PDFDownloadLink, so that the pdfs can work without issue.
  // Note that dynamic imports return a promise, which is why I chained with a .then to return it since it is a named export.
  // ssr is set to false so that the server does not try to render this component
  const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then((module) => module.PDFDownloadLink), {
    ssr: false,
    loading: () => <p>Now Loading...</p>
  });

  // This const contains an arrow function that defines how the page will scroll from the button all the way to the top
  const topScroll = () => {
    if (topDivRef.current) {
    topDivRef.current.scrollIntoView({behavior : "smooth", inline : "start"})
    }
  }

  // I haven't really needed to use EventListener, so let my explain. scroll is the type of event, handleScroll is the function called
  // if window.scrollY is greater than 2000 pixels, then display the button to go the top. Otherwise, do not
  useEffect(() => {
    const handleScroll = () => {
      // Check if screen size is above the sm breakpoint, if not use the else value
      if (window.matchMedia("(min-width: 640px)").matches) {
        setshowTopButton(window.scrollY > 850);
      }
      else {
        setshowTopButton(window.scrollY > 600);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Clean up function
    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  //Fetch the user's graded responses from the test page
  console.log("ABOUT TO ENTER THE HTML!");
  console.log("HERE IS THE QUESTION AND ANSWER INFORMATION");
  //console.log(questions);
  console.log("QUESTIONS.LENGTH");
  //console.log(questions.length);
  
  return (
    <>
      <PDFDownloadLink 
        document = {<CreateResultsPDF TestResultProps = {results} ResultQuestionProps = {questions}/>} 
        fileName = "results.pdf"
      >
        {
          // This is a function call that destructures the loading boolean, instead of using all of the props
          ({ loading }) => loading ? (<p>Cooking up your PDF...</p>) : (<p>Click Here!</p>)
        }
      </PDFDownloadLink>
      <div className = "p-12" ref = {topDivRef}>
        { //DEBUG ONLY, TEST THE RESULTINFO SKELETON
          // <skeletons.ResultInfoSkeleton />
        }
        {
          <ResultInfo
            attemptId = {results.attempt_id}
            totalScore = { // The total_score stored is actually the percentage of overall correct questions, so calculate the correct number here
              (results.total_score / 100) * questions.length
            }
            entranceLevel = {results.entrance_level}
            testDate = {results.end_time}
            totalQuestions = {questions.length}
          />
        }
        </div>
        <div className = "flex flex-col gap-6">
          { // DEBUG ONLY, TEST THE QUESTIONDISPLAY SKELETON
            // <skeletons.QuestionDisplaySkeleton />
          }
          {
            questions.map((question) =>
              <Suspense
                key = {question.response_order}
                fallback = { <QuestionDisplaySkeleton />}>
                <QuestionDisplay
                  questionId = {question.response_order}
                  questionText = {question.question_text}
                  questionBody = {question.question_body}
                  questionCategory = {question.question_level}
                  answerId = {question.answer_id}
                  answerText = {question.answer_text}
                  correctAnswer = {question.correct_answer}
                  wasCorrect = {question.user_was_correct}
                  //selectedAnswer is used to track which radio option the user has chosen
                  selectedAnswer = {question.user_answer_text}
                  alreadyAnswered = {true}
                />
              </Suspense>
          )}
      </div>
      { /* The div below contains the button for scrolling to the top of the page. It transitions with opacity, and if it is not visible,
        then the button is disabled from receiving pointer events.*/ }
      <div className = {`
        fixed 
        right-6 bottom-6 
        sm:right-12 sm:bottom-12 
        sm:bg-white sm:p-4 
        sm:rounded-lg
        transition-opacity duration-500
        ${showTopButton ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
      >
        <button 
          className = {`
            flex 
            w-36 h-12 
            sm:w-48 sm:h-16 
            !m-0 !p-0 
            buttonStyle sm:buttonStyle 
            cursor-pointer justify-center 
            items-center text-center
          `}
            type = "button" 
            onClick = {topScroll}
            disabled = {!showTopButton}
        >
          Back to the Top
        </button>            
      </div>
    </>
  );
}