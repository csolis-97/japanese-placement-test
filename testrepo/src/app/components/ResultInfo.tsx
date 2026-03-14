"use client";

import Link from "next/link";

//Define the props used for displaying results
interface resultDisplayProps {
    attemptId: number;
    totalScore: number;
    totalQuestions: number;
    entranceLevel: string;
    testDate: Date;
}

// Component to display the results of the test
export default function resultinfo(props: resultDisplayProps) {
    return (
        <div className = "flex flex-col bg-gray-100 rounded-lg shadow-lg p-4 sm:p-6 w-full min-w-[16rem] sm:min-w-[20rem] min-h-[10rem] sm:min-h-[14rem]">
            <h2 className = "text-gray-800 font-semibold mt-2">Test Attempt #{props.attemptId} Results</h2>
            <p className = "text-gray-600">Test Date: {props.testDate.toString()}</p>
            <p className = "text-gray-600">Total Score: {Math.round(props.totalScore)} / {props.totalQuestions}</p>
            <p className = "text-gray-600">Your Suggested Entrance Level: {props.entranceLevel}</p>
            <Link href = "/testform">
                <button className = {"buttonStyle"} type = "button">Click here to retake the test.</button>
            </Link>
        </div>
    )
}