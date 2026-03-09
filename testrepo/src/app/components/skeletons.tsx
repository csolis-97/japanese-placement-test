"use client";

import Link from "next/link";

//This variable will apply the styling for the button
const buttonStyle = "mt-4 px-4 sm:px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";

export function QuestionDisplaySkeleton() {
    return (
        // Here, min-h-[40.625rem] is used to ensure that the height is a minimum of 650px, but will grow if content is bigger than that using h-fit.
        <div className = "flex flex-col shrink-0 grow-0 bg-gray-100 rounded-lg sm:w-full sm:min-w-[40.625rem] sm:min-h-[40.625rem] sm:h-fit shadow-md">
            <div className = "flex flex-col min-w-0 min-h-0 divide-y-2 divide-gray-400">
                <div className = "flex flex-col pl-4 gap-4">
                    {/* Question Number */}
                    <div className = "bg-gray-600 rounded h-10 w-45 p-4 mt-6"></div>
                    {/* Question Level */}
                    <div className = "bg-gray-600 rounded h-7 w-45 px-4 mt-6"></div>
                    {/* Question Text */}
                    <div className = "bg-gray-600 rounded h-5 w-45 px-4"></div>
                    {/* Question Body */}
                    <div className = "bg-gray-600 rounded h-8 w-100 p-4 mt-6 mb-6"></div>                       
                </div>
                <div className = "flex flex-col p-4 pt-10 gap-4 mt-2">
                    {/* Option 1 */}
                    <div className = "bg-gray-600 rounded h-5 w-40 shrink-0 mt-2"></div>                
                    {/* Option 2 */}
                    <div className = "bg-gray-600 rounded h-5 w-40 shrink-0 mt-2"></div>
                    {/* Option 3 */}
                    <div className = "bg-gray-600 rounded h-5 w-40 shrink-0 mt-2"></div>
                    {/* Option 4 */}
                    <div className = "bg-gray-600 rounded h-5 w-40 shrink-0 mt-2"></div>
                </div>
            </div>
        </div>
    );
}

// Component to display the results of the test
export function ResultInfoSkeleton() {
    return (
        <div className = "flex flex-col bg-gray-100 rounded-lg shadow-lg p-4 sm:p-6 sm:min-w-[34rem] sm:min-h-[14rem] gap-4">
            {/* Test Attempt #~ Results */}
            <div className = "bg-gray-600 rounded h-5 w-44 mt-4"></div>
            {/* Test Date */}
            <div className = "bg-gray-600 rounded h-5 w-70"></div>
            {/* Total Score */}
            <div className = "bg-gray-600 rounded h-5 w-34"></div>
            {/* Your Suggested Entrance Level */}
            <div className = "bg-gray-600 rounded h-5 w-87"></div>
            <Link href = "">
                <button className = {buttonStyle} type = "button" disabled>
                    <div className = "bg-gray-600 rounded h-5 w-47"></div>
                </button>
            </Link>
        </div>
    )
}