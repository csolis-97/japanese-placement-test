"use client";

import Link from "next/link";
import { use } from "react";
import { TestResult } from "@/app/types/sharedInterface";
import { formatResultsDate } from "../utils/utilFunctions";

//Define the props used for displaying results
interface InfoProps {
    resultsPromise: Promise<TestResult>;
    totalQuestions: number;
    children: React.ReactNode;
};

// Component to display the results of the test
export default function ResultInfo(props: InfoProps) {
    // Take the resultsPromise prop and use it to get the results data
    const results = use(props.resultsPromise) as TestResult;
    // Format the date too
    const formattedDate = formatResultsDate(results.end_time);
    
    return (
        <div className = {`
        flex flex-col 
        bg-gray-100 rounded-lg shadow-lg 
        p-4 sm:p-6 
        w-full min-w-[16rem] sm:min-w-[32rem] 
        min-h-[10rem] sm:min-h-[14rem]
        `}>
            <h2 className = "text-gray-800 font-semibold mt-2">Test Attempt #{results.attempt_id} Results</h2>
            <p className = "text-gray-600">Test Date: {formattedDate}</p>
            <p className = "text-gray-600">Total Score: {(Math.round(results.total_score) / 100) * props.totalQuestions} / {props.totalQuestions}</p>
            <p className = "text-gray-600">Your Suggested Entrance Level: {results.entrance_level}</p>
            <div className = "flex flex-col sm:flex-row items-center sm:gap-6">
                <Link 
                    href = "/testform" 
                    className = {`
                        button-style 
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
                {
                    props.children
                }
            </div>
        </div>
    );
}