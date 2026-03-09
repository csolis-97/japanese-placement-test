"use client";

import Link from "next/link";
import { Suspense } from "react";

//Define the props used for displaying results
interface resultDisplayProps {
    attemptId: number;
    totalScore: number;
    totalQuestions: number;
    entranceLevel: string;
    testDate: Date;
}

//This variable will apply the styling for the button
const buttonStyle = "mt-4 px-4 sm:px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";

// Component to display the results of the test
export default function resultinfo(props: resultDisplayProps) {
    return (
        <Suspense fallback = {<div>Loading Results...</div>}>
            <div className = "flex flex-col bg-gray-100 rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className = "text-gray-800 font-semibold mt-2">Test Attempt #{props.attemptId} Results</h2>
                <p className = "text-gray-600">Test Date: {props.testDate.toString()}</p>
                <p className = "text-gray-600">Total Score: {Math.round(props.totalScore)} / {props.totalQuestions}</p>
                <p className = "text-gray-600">Your Suggested Entrance Level: {props.entranceLevel}</p>
                <Link href = "/testform">
                    <button className = {buttonStyle} type = "button">Click here to retake the test.</button>
                </Link>
            </div>
        </Suspense>
    )
}