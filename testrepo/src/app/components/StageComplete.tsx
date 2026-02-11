"use client";

import { useState } from "react";

interface messageProps {
    stageNum: number;
    stagePassed: boolean;
    difficultyLevel: string;
    totalQuestions: number;
    totalCorrect: number;

    //This function will handle the button
    onButtonChange?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}


export default function StageComplete(props: messageProps) {

    console.log(`CURRENT STAGE: ${props.stageNum}`);
    console.log(`STAGE PASSED? ${props.stagePassed}`);
    console.log(`CURRENT DIFFICULTY: ${props.difficultyLevel}`);
    console.log(`TOTAL ANSWERS CORRECT: ${props.totalCorrect}`);

    // Create a string whose message will change depending on whether or not the user passed the current stage.
    let stageMessage, buttonText, buttonName;

    if (props.stagePassed !== false) {
        stageMessage = "Congratulations! You've moved onto the next stage!"
        buttonText = "Continue"
    }
    else {
        stageMessage = "Unfortunately, you did not qualify for the next stage."
        buttonText = "Submit Test"
    }

    return(
        <div>
        {
                <div className = "overflow-hidden shadow-xl backdrop-blur-sm">
                    <h1>Stage {props.stageNum + 1}: {props.difficultyLevel}</h1>
                    <h2>{stageMessage}</h2>
                    <p>{props.totalCorrect} out of {props.totalQuestions} correct!</p>
                    <button type = "submit" name = "submitButton" data-dismiss = "modal" 
                    className = "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 position:sticky top:0" onClick = {props.onButtonChange}>{buttonText}</button>
                </div>
        }
        </div>
    );
}