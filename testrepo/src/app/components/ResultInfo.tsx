"use client";

import Link from "next/link";

//Define the props used for displaying results
interface InfoProps {
    attemptId: number;
    totalScore: number;
    totalQuestions: number;
    entranceLevel: string;
    testDate: Date;
};

// Component to display the results of the test
export default function resultinfo(props: InfoProps) {

    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    };

    let formattedDate = props.testDate.toLocaleString("en-US", dateOptions);
    /* This is the first time I've formally learned method chaining in Typescript so, here goes
        editFormat is initially assigned to the value of formattedDate, and two method calls are chained
        and the result of them returned to editFormat. I decided to go with this, since the alternative
        was two different if statements with the same function being called. Note that the semicolon
        is added only at the end of the last chained method */
    const editFormat = formattedDate
        .replace("AM", "A.M.")
        .replace("PM", "P.M.");

    formattedDate = editFormat;
    
    return (
        <div className = {`
        flex flex-col 
        bg-gray-100 rounded-lg shadow-lg 
        p-4 sm:p-6 
        w-full min-w-[16rem] sm:min-w-[32rem] 
        min-h-[10rem] sm:min-h-[14rem]
        `}>
            <h2 className = "text-gray-800 font-semibold mt-2">Test Attempt #{props.attemptId} Results</h2>
            <p className = "text-gray-600">Test Date: {formattedDate}</p>
            <p className = "text-gray-600">Total Score: {Math.round(props.totalScore)} / {props.totalQuestions}</p>
            <p className = "text-gray-600">Your Suggested Entrance Level: {props.entranceLevel}</p>
            <Link 
                href = "/testform" 
                className = {`
                    buttonStyle 
                    flex justify-center 
                    items-center
                    w-[14rem]
                    sm:w-[16rem] 
                    h-[3.375rem]
                    sm:h-[3.375rem]
                `}
                type = "button">
                Click here to retake the test.
            </Link>
        </div>
    );
}