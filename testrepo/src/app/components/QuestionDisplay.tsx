"use client";

interface QuestionDisplayProps {
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
    onChangeValue?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// These strings will be used for determining the className styling for the radio buttons
const regularRadio = "ml-2 text-gray-600";
const correctRadio = "ml-2 text-green-600";
const wrongRadio = "ml-2 text-red-600";

export default function QuestionDisplay(props : QuestionDisplayProps) {
    console.log("ALREADY ANSWERED?");
    console.log(props.alreadyAnswered);
    console.log("LOG THE CORRECT ANSWERS IF ANY!!");
    console.log(props.correctAnswer);
    console.log("VALUE IN SELECTED ANSWER!");
    console.log(props.selectedAnswer);
    console.log("WAS CORRECT?");
    console.log(props.wasCorrect);

    return (
        // Here, min-h-[40.625rem] is used to ensure that the height is a minimum of 650px, but will grow if content is bigger than that using h-fit.
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
                    <h2 className = "divide-y-2 px-4">{props.questionText}</h2>
                    <p className = "sm:text-2xl p-4">{props.questionBody}</p>
                </div>
                <div className = "p-4 sm:pt-10">
                    <fieldset disabled = {props.alreadyAnswered} className = "sm:text-xl" >
                        {props.answerText?.map((answer, index) => (
                        //fieldset should only be disabled if the question has already been answered.
                        //checked tracks which radio option the user has selected by setting selectedAnswer to the value of answer
                        //readOnly is enabled only during the results page, as no onChange will be provided
                        //Although booleans in the data, convert correctAnswers to numbers for comparison.
                        //Each radio option will only be colored correct IF the user chose that option, or if it was actually correct.
                        //If the user chose the wrong option, color only that radio red.

                        //flex items-start is used to properly algin the radio buttons and the answer text
                        <div key = {index} className = "flex mt-2 text-sm sm:text-base">
                            <input type = "radio" 
                                id = {`answer-${props.answerId[index]}`} 
                                name = {`question-${props.questionId}`} 
                                value = {answer || props.selectedAnswer}
                                className = {`
                                    ${props.selectedAnswer === props.answerText[index] && Number(props.wasCorrect) === 1 || 
                                    Number(props.correctAnswer?.[index]) === 1 ? (correctRadio) : (regularRadio)}
                                `}
                                onChange = {props.onChangeValue} 
                                checked = { props.selectedAnswer === answer}
                                readOnly = {props.alreadyAnswered} 
                            />
                            <label 
                                htmlFor ={`answer-${props.answerId[index]}`} 
                                className = {`
                                    ${props.selectedAnswer === props.answerText[index] && Number(props.wasCorrect) === 1 || 
                                    Number(props.correctAnswer?.[index]) === 1 ? (correctRadio) : props.selectedAnswer === props.answerText[index] && 
                                    Number(props.wasCorrect) === 0 ? (wrongRadio) : (regularRadio)}
                            `}>
                                {props.answerText[index]}
                            </label>
                        </div>
                        ))
                    }
                    </fieldset>
                {   // Check if the question was not answered by the user during the test, and display this message.
                    // "not answered" is the text assigned as a default to answers that were received as empty in the backend
                    props.selectedAnswer === "not answered" ? (
                        <h1 className = "flex p-4 mt-6 bg-gray-200 rounded shadow-md font-semibold justify-center text-red-600 text-sm sm:text-base">
                            X Question was not answered.
                        </h1>
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