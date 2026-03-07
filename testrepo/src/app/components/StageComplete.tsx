"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface messageProps {
    stageNum: number;
    stagePassed: boolean;
    difficultyLevel: string;
    totalQuestions: number;
    totalCorrect: number;

    //This function will handle the button
    onButtonChange?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

//These variables will apply the styling for the regular and disabled buttons
const buttonStyle = "mt-4 px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";


export default function StageComplete(props: messageProps) {

    console.log(`CURRENT STAGE: ${props.stageNum}`);
    console.log(`STAGE PASSED? ${props.stagePassed}`);
    console.log(`CURRENT DIFFICULTY: ${props.difficultyLevel}`);
    console.log(`TOTAL ANSWERS CORRECT: ${props.totalCorrect}`);

    // Create a string whose message will change depending on whether or not the user passed the current stage.
    let stageMessage, buttonText;

    if (props.stageNum === 4) {
        stageMessage = "Congratulations! You have reached the end of the test!"
        buttonText = "Submit Test"
    }
    else if (props.stagePassed !== false) {
        stageMessage = "Congratulations! You've moved onto the next stage!"
        buttonText = "Continue"
    }
    else {
        stageMessage = "Unfortunately, you did not qualify for the next stage."
        buttonText = "Submit Test"
    }

    /* I had no idea you could do this until I looked it up to be honest. Use a useEffect to add overflow-hidden to the list of the document body's styles
    once this component mounts, and then remove it once it unmounts. This will prevent the user from scrolling while the modal is on screen.
    The arrow function used alongside the return is a cleanup function, which will only run once the component unmounts, rather than
    immediately returning.*/
    useEffect(() => {
        document.body.classList.add("overflow-hidden");
        return () => document.body.classList.remove("overflow-hidden");
    }, [])

    return createPortal(
        <div className = "fixed inset-0 w-screen h-screen flex items-center text-center justify-center bg-black/40">
        {
            <div className = "inset-0 items-center justify-center gap-6 text-center opacity-100 transition-opacity duration-300 sm:items-start sm:text-left border-8 border-gray-400 shadow-lg rounded-lg bg-white p-4 dark:text-gray-400">
                <h1>Stage {props.stageNum + 1}: {props.difficultyLevel}</h1>
                <h2>{stageMessage}</h2>
                <p>{props.totalCorrect} out of {props.totalQuestions} correct!</p>
                <button type = "submit" name = "submitButton" data-dismiss = "modal" 
                className = {buttonStyle} onClick = {props.onButtonChange}>{buttonText}</button>
            </div>
        }
        </div>, document.body
    );
}