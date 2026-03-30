"use client";

import { 
  Suspense, 
  use, 
  useRef,
  useState,
  useEffect
} from "react";
import QuestionDisplay from "./QuestionDisplay";
import { QuestionDisplaySkeleton } from "./skeletons";
import { ResultQuestion } from "@/app/types/sharedInterface";

interface ResultsProps {
  answersPromise: Promise<ResultQuestion[]>;
  children: React.ReactNode;
};

export default function ResultsDisplay({ answersPromise, children } : ResultsProps) {

  const questions = use(answersPromise);

  // This useState will be used to track whether or not the button that allows the user to go back to the top of the page
  // is toggled or not
  const[showTopButton, setshowTopButton] = useState<boolean>(false);

  // This const will be used as a ref value for the div that contains the ResultInfo component, to which the button will return
  const topDivRef = useRef<HTMLDivElement>(null);

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
      <div className = "p-12" ref = {topDivRef}>
        { //DEBUG ONLY, TEST THE RESULTINFO SKELETON
          // <skeletons.ResultInfoSkeleton />
        }
        { children }
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
            button-style sm:button-style 
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