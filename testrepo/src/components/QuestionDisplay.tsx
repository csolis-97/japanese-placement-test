"use client";

import { generateFurigana } from "@/utils/generateFurigana";

interface QuestionDisplayProps {
    questionId: number;
    questionText: string;
    questionTextFurigana?: string;
    questionBody: string;
    questionBodyFurigana?: string;
    questionCategory: string;
    questionAudio?: string;
    answerId: number[];
    answerText: string[];
    answerTextFurigana?: string[];
    selectedAnswer: string;
    alreadyAnswered?: boolean;
    correctAnswer?: boolean[];
    wasCorrect?: boolean;
    onChangeValue?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// These strings will be used for determining the className styling for the radio buttons
const regularRadio = "text-gray-600 has-[:checked]:bg-blue-500";
const correctRadio = "text-green-600 bg-green-600";
const wrongRadio = "text-red-600 bg-red-600";
const regularNumberLabel = "text-gray-600 peer-checked:text-white";
const coloredNumberLabel = "text-white";

export default function QuestionDisplay(props: QuestionDisplayProps) {
    // DEBUG, Log the values to check the current values
    console.log("ALREADY ANSWERED?");
    console.log(props.alreadyAnswered);
    console.log("LOG THE CORRECT ANSWERS IF ANY!");
    console.log(props.correctAnswer);
    console.log("VALUE IN SELECTED ANSWER!");
    console.log(props.selectedAnswer);
    console.log("WAS CORRECT?");
    console.log(props.wasCorrect);

    // This arrow function will check if questionAudio exists, and if it does, if it is a valid audio file
    const audioQuestion = () => {
        try {
            // check if the question is listening comprehension
            if (props.questionAudio) {
                console.log(`VALUE OF QUESTIONAUDIO: ${props.questionAudio}`);
                console.log("Check if is an audio file!");
                // Provided regex for a few different types of common audio extensions
                const audioFormatRegex = /\.(mp3|ogg|wav|flac|aac)$/i;
                const isAudio = audioFormatRegex.test(props.questionAudio);
                if (isAudio) {
                    console.log("Provided path is indeed an audio file!");
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        catch {
            console.log("Provided path was either not valid, or it was not an audio file!");
            return false;
            //throw new Error(`There was an error retrieving the audio file for question #${props.questionId}!`);
        }
    }

    return (
        <div className = 
            {`
                flex flex-col 
                bg-gray-100 rounded-lg 
                min-w-[20rem] sm:min-w-[40.625rem] 
                min-h-[25rem] sm:min-h-[40.625rem]
                shadow-md
            `}
        >
            <div className = "divide-y-2 divide-gray-400">
                <div className = "text-gray-600 font-semibold">
                    <h1 className = "sm:text-3xl p-4">Question #{props.questionId}</h1>
                    <h1 className = "sm:text-xl px-4">Level: {props.questionCategory}</h1>
                    <h2 className = "divide-y-2 px-4">
                        { // Check if there is furigana for the question text, and generate it if there is
                            generateFurigana(props.questionText, props.questionTextFurigana, props.questionCategory)
                        }
                    </h2>
                    { // Check if this is a listening comprehension question here
                        audioQuestion() && (
                            <audio className = "divide-y-2 px-4 mt-4" src = {props.questionAudio} controls></audio>
                        )
                    }
                    <p className = "sm:text-2xl p-4">
                        { // Check if there is furigana for the question body, and generate it if there is
                            generateFurigana(props.questionBody, props.questionBodyFurigana, props.questionCategory)
                        }
                    </p>
                </div>
                <div className = "p-4 sm:pt-10">
                    <fieldset disabled = {props.alreadyAnswered} className = "sm:text-xl" >
                        { 
                            props.answerText?.map((answer, index) => {
                                // Determine the boolean values for whether the answer is correct or incorrect, for styling purposes.
                                const userChoseThisAnswer = props.selectedAnswer === answer;
                                const isAnswerCorrect = Number(props.correctAnswer?.[index]) === 1;
                                const userInCorrect = userChoseThisAnswer && Number(props.wasCorrect) === 0;
                                const cursorStatus = props.alreadyAnswered ? "pointer-events-none" : "cursor-pointer";

                                return (
                                //checked tracks which radio option the user has selected by setting selectedAnswer to the value of answer
                                //readOnly is enabled only during the results page, as no onChange will be provided
                                //Although booleans in the data, convert correctAnswers to numbers for comparison.
                                //Each radio option will only be colored correct IF the user chose that option, or if it was actually correct.
                                //If the user chose the wrong option, color only that radio red.
                                <div key = {index} className = {`
                                    flex flex-row 
                                    mt-2 relative
                                    text-sm sm:text-base 
                                    items-stretch
                                    bg-gray-200 rounded-lg
                                    shadow-md p-1
                                    min-w-[2rem] sm:min-w-[35rem] 
                                    min-h-[2rem] sm:min-h-[4rem]
                                    ${isAnswerCorrect ? (correctRadio) : userInCorrect ? (wrongRadio) : (regularRadio)}
                                `}>
                                    <input type = "radio" 
                                        id = {`answer-${props.answerId[index]}`} 
                                        name = {`question-${props.questionId}`} 
                                        value = {answer || props.selectedAnswer}
                                        className = {`
                                            absolute appearance-none
                                            w-full h-full
                                            peer
                                            ${cursorStatus}
                                        `}
                                        onChange = {props.onChangeValue} 
                                        checked = { props.selectedAnswer === answer}
                                        readOnly = {props.alreadyAnswered} 
                                    />
                                    <p className = {`flex items-center font-semibold ml-4 ${isAnswerCorrect || userInCorrect ? coloredNumberLabel : regularNumberLabel}`}>
                                        {index + 1}
                                    </p>
                                    <label 
                                        htmlFor ={`answer-${props.answerId[index]}`} 
                                        className = {`
                                            flex relative
                                            flex-1
                                            p-2 ml-4
                                            items-center
                                            rounded-sm bg-white
                                            ${cursorStatus}
                                            ${isAnswerCorrect ? (correctRadio) : userInCorrect ? (wrongRadio) : (regularRadio)}
                                    `}>
                                        <p className = "text-sm sm:text-xl">
                                            { // Check if there is furigana for the given answer text, and generate it if there is
                                                props.answerTextFurigana && generateFurigana(props.answerText[index], props.answerTextFurigana[index], props.questionCategory)
                                            }
                                        </p>
                                    </label>
                                </div>
                                );
                            })
                        }
                    </fieldset>
                {   // Check if the question was not answered by the user during the test, and display this message.
                    // "not answered" is the text assigned as a default to answers that were received as empty in the backend
                    props.selectedAnswer === "not answered" ? (
                        <div className = {`
                            flex p-4
                            mt-6 bg-red-600
                            rounded shadow-md 
                            font-semibold justify-center
                            items-stretch
                        `}>
                            <h1 className = {`
                                flex
                                flex-1
                                p-2
                                rounded-sm bg-white
                                text-center text-red-600
                                text-sm sm:text-base
                                justify-center items-center
                            `}>
                                X Question was not answered.
                            </h1>
                        </div>
                    ) : (
                        <>
                        </>
                    )
                }
                </div>
            </div>
        </div>
    );
}