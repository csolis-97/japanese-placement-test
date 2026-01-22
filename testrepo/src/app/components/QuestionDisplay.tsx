"use client";

//Define the props for the questions being displayed
interface questionDisplayProps {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    alreadyAnswered?: boolean;
    isCorrect?: boolean;

    /* Since I've never used this syntax before, I'll explain it right now. onChangeValue is the name of the function,
    event: React.ChangeEvent<HTMLInputElement> is the argument, the arrow is part of the arrow function declaration,
    and void is the return type. Since this function will only be used to set the answer selected by the user in the form,
    it does not need to return anything, hence void. I'm curious on the syntax of React.ChangeEvent itself, but I'll leave
    that for later.
    */
    
    onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/* Below, I learned a new syntax for string interpolation in React components using Typescript. While variables are inserted alone by enclosing
them within {}, when combining them with strings, use backticks `` and preface each variable with a $ before enclosing them with {}. This
works similar to how f is used for string literals in Python, the backticks I mean. */
export default function questionDisplay(props: questionDisplayProps) {
        //console.log("MESSAGE FROM QUESTIONDISPLAY!");
        //console.log(props);
    return (
        <div>
            <div>
                <h2 className = "text-gray-800 font-semibold mt-2">{props.questionText}</h2>
                <p className = "text-gray-600">{props.questionBody}</p>
                <p className = "text-gray-600">{props.questionId}</p>
                <fieldset disabled = {props.alreadyAnswered} className = "mt-2">
                {props.answerText?.map((answer, index) => (
                    //fieldset should only be disabled if the question has already been answered.
                    <div key={index} className = "mt-2">
                        <input type = "radio" id = {`answer-${props.answerId[index]}`} name = {`question-${props.questionId}`} value = {answer}
                        onChange = {props.onChangeValue}/>
                        <label htmlFor ={`answer-${props.answerId[index]}`} className = "ml-2 text-gray-600">{props.answerText[index]}</label>
                    </div>
                    ))
                }
                </fieldset>
            </div>
        </div>
    )
}