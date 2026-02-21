"use client";

//Define the props for the questions being displayed
interface questionDisplayProps {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    selectedAnswer: string;
    alreadyAnswered?: boolean;
    correctAnswer?: boolean[];
    wasCorrect?: boolean;
    /* Since I've never used this syntax before, I'll explain it right now. onChangeValue is the name of the function,
    event: React.ChangeEvent<HTMLInputElement> is the argument, the arrow is part of the arrow function declaration,
    and void is the return type. Since this function will only be used to set the answer selected by the user in the form,
    it does not need to return anything, hence void. I'm curious on the syntax of React.ChangeEvent itself, but I'll leave
    that for later.
    */

    onChangeValue?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

//These variables will be used for checking when to use the styles defined below

// These strings will be used for determining the className styling for the radio buttons
const regularRadio = "ml-2 text-gray-600"
const correctRadio = "ml-2 text-green-600"
const wrongRadio = "ml-2 text-red-600"

/* Below, I learned a new syntax for string interpolation in React components using Typescript. While variables are inserted alone by enclosing
them within {}, when combining them with strings, use backticks `` and preface each variable with a $ before enclosing them with {}. This
works similar to how f is used for string literals in Python, the backticks I mean. */
export default function questionDisplay(props: questionDisplayProps) {
    //console.log("MESSAGE FROM QUESTIONDISPLAY!");
    //console.log(props);
    console.log("ALREADY ANSWERED?");
    console.log(props.alreadyAnswered);
    console.log("LOG THE CORRECT ANSWERS IF ANY!!")
    console.log(props.correctAnswer);
    console.log("VALUE IN SELECTED ANSWER!")
    console.log(props.selectedAnswer)
    console.log("WAS CORRECT?")
    console.log(props.wasCorrect)

    return (
        // Here, min-h-[650px] is used to ensure that the height is a minimum of 650, but will grow if content is bigger than that using h-fit.
        <div className = "flex flex-col shrink-0 grow-0 bg-gray-100 rounded-lg w-full max-w-[650px] min-h-[650px] h-fit shadow-md">
            <div className = "flex flex-col min-w-0 min-h-0 divide-y-2 divide-gray-400">
                <div className = "">
                    <h1 className = "text-gray-600 font-semibold text-3xl p-4">Question #{props.questionId}</h1>
                    <h1 className = "text-gray-600 font-semibold text-xl px-4">Level: {props.questionCategory}</h1>
                    <h2 className = "text-gray-800 font-semibold divide-y-2 px-4">{props.questionText}</h2>
                    <p className = "text-gray-600 font-semibold text-2xl p-4">{props.questionBody}</p>
                </div>
                <div className = "p-4 pt-10">
                    <fieldset disabled = {props.alreadyAnswered} className = "text-xl" >
                        {props.answerText?.map((answer, index) => (
                        //fieldset should only be disabled if the question has already been answered.
                        //checked tracks which radio option the user has selected by setting selectedAnswer to the value of answer
                        //readOnly is enabled only during the results page, as no onChange will be provided
                        //Although booleans in the data, convert correctAnswers to numbers for comparison.
                        //Each radio option will only be colored correct IF the user chose that option, or if it was actually correct.
                        //If the user chose the wrong option, color only that radio red.

                        //flex items-start is used to properly algin the radio buttons and the answer text
                        <div key={index} className = "mt-2 flex items-start">
                            <input type = "radio" id = {`answer-${props.answerId[index]}`} name = {`question-${props.questionId}`} value = {answer || props.selectedAnswer}
                                className = {`shrink-0 mt-2 ${props.selectedAnswer === props.answerText[index] && Number(props.wasCorrect) === 1 || Number(props.correctAnswer?.[index]) === 1 ? 
                                (correctRadio) : (regularRadio)} `}
                                onChange = {props.onChangeValue} checked = { props.selectedAnswer === answer}
                            readOnly = {props.alreadyAnswered} />
                            <label htmlFor ={`answer-${props.answerId[index]}`} className = {`${props.selectedAnswer === props.answerText[index] && Number(props.wasCorrect) === 1 || Number(props.correctAnswer?.[index]) === 1 ? 
                                (correctRadio) : props.selectedAnswer === props.answerText[index] && Number(props.wasCorrect) === 0 ? 
                                (wrongRadio) : (regularRadio)}`}>{props.answerText[index]}</label>
                        </div>
                        ))
                    }
                    </fieldset>
                </div>
            </div>
        </div>
    );
}