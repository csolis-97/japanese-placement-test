"use client";

//Define the props for the questions being displayed
interface questionDisplayProps {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
}

/* Below, I learned a new syntax for string interpolation in React components using Typescript. While variables are inserted alone by enclosing
them within {}, when combining them with strings, use backticks `` and preface each variable with a $ before enclosing them with {}. This
works similar to how f is used for string literals in Python, the backticks I mean. */
export default function questionDisplay(props: questionDisplayProps) {
    return (
        <div>
            <div>
                {props.answerText.map((answer, index) => (
                    <div key={index} className = "mt-2">
                        <h2 className = "text-gray-800 font-semibold mt-2">{props.questionText}</h2>
                        <p className = "text-gray-600">{props.questionBody}</p>
                        <p className = "text-gray-600">{props.questionId}</p>
                        <input type = "radio" id = {`answer-${props.answerId[index]}`} name = {`question-${props.questionId}`} value = {answer}/>
                        <label htmlFor ={`answer-${props.answerId[index]}`} className = "ml-2 text-gray-600">{props.answerText[index]}</label>
                    </div>
                    ))
                }
            </div>
        </div>
    )
}