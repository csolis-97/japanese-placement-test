"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface MessageProps {
    stageNum: number;
    stagePassed: boolean;
    difficultyLevel: string;
    totalQuestions: number;
    totalCorrect: number;
    testTimerOver: boolean;
    isSubmitted: boolean;

    //This function will handle the button
    onButtonChange: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function StageComplete(props: MessageProps) {

    console.log(`CURRENT STAGE: ${props.stageNum}`);
    console.log(`STAGE PASSED? ${props.stagePassed}`);
    console.log(`CURRENT DIFFICULTY: ${props.difficultyLevel}`);
    console.log(`TOTAL ANSWERS CORRECT: ${props.totalCorrect}`);

    // This useState will house a toggle for transitioning to the display of the button
    const [transitionToggle, setTransitionToggle] = useState<boolean>(false);

    // Create a string whose message will change depending on whether or not the user passed the current stage.
    let stageMessage, buttonText;

    if (props.testTimerOver) {
        stageMessage = "Time is up! The test was submitted."
        buttonText = "Go to Results"
    }
    else if (props.stageNum === 4) {
        stageMessage = "Congratulations! You have reached the end of the test!";
        buttonText = "Submit Test";
    }
    else if (props.stagePassed !== false) {
        stageMessage = "Congratulations! You've moved onto the next stage!";
        buttonText = "Continue";
    }
    else {
        stageMessage = "Unfortunately, you did not qualify for the next stage.";
        buttonText = "Submit Test";
    }

    // This const will handle the transition after the button is pressed and the modal is closed. It will disappear 200 ms
    // after executing onButtonChange.
    const handleModalTransition = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setTransitionToggle(false);
        setTimeout(() => props.onButtonChange(event), 200);
    }

    // This useEffect will handle adding the opacity overlay for the modal, alongside removing it.
    useEffect(() => {
        document.body.classList.add("overflow-hidden");
        // Clean up function
        return () => document.body.classList.remove("overflow-hidden");
    }, []);

    // This useEffect will handle the logic behind the transition of the modal
    useEffect(() => {
        setTransitionToggle(true);
    }, [props.isSubmitted, props.testTimerOver]);

    return createPortal(
        <div className = {`
            flex fixed 
            inset-0 items-center
            justify-center bg-black/40 
            transition-opacity duration-500
            ${transitionToggle ? "opacity-100" : "opacity-0"}
        `}>
            <div className = {`
                border-8 border-gray-400 
                shadow-lg rounded-lg bg-white 
                text-center p-4
                min-w-[4rem] sm:min-w-[30rem] 
                min-h-[5rem] sm:min-h-[10rem]
                transition-opacity duration-1000
                ${transitionToggle ? "opacity-100" : "opacity-0"}
            `}>
                <h1>Stage {props.stageNum + 1}: {props.difficultyLevel}</h1>
                <h2>{stageMessage}</h2>
                <p>{props.totalCorrect} out of {props.totalQuestions} correct!</p>
                <button type = "submit" name = "submitButton" data-dismiss = "modal" 
                className = {"buttonStyle"} onClick = {handleModalTransition}>{buttonText}</button>
            </div>
        </div>, document.body
    );
}