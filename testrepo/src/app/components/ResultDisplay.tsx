"use client";
import Link from "next/link";

//Define the props used for displaying results
interface resultDisplayProps {
    resultId: number;
    totalScore: number;
    entranceLevel: string;
    testDate: Date;
}

// Component to display the results of the test
export default function resultDisplay(props: resultDisplayProps) {
    return (
        <div>
            <h2 className = "text-gray-800 font-semibold mt-2">Test Attempt #{props.resultId} Results</h2>
            <p className = "text-gray-600">Test Date: {props.testDate.toString()}</p>
            <p className = "text-gray-600">Total Score: {props.totalScore}</p>
            <p className = "text-gray-600">Your Suggested Entrance Level: {props.entranceLevel}</p>
            <Link href = "/testform" className = "text-blue-400 text-sm hover:underline">Click here to retake the test.</Link>
        </div>
    )
}