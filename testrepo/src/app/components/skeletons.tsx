"use client";

import Link from "next/link";

// Loading animation, taken from the one provided by Vercel
const shimmer = "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent";

// Skeleton used as a placeholder for the questions
export function QuestionDisplaySkeleton() {
    return (
        // Here, min-h-[40.625rem] is used to ensure that the height is a minimum of 650px, but will grow if content is bigger than that using h-fit.
        <div className = {`relative overflow-hidden ${shimmer} flex flex-col shrink-0 grow-0 bg-gray-100 rounded-lg sm:w-full sm:min-w-[40.625rem] sm:min-h-[40.625rem] sm:h-fit shadow-md`}>
            <div className = "flex flex-col min-w-0 min-h-0 divide-y-2 divide-gray-400">
                <div className = "flex flex-col pl-4 gap-2">
                    {/* Question Number */}
                    <div className = "bg-gray-300 rounded h-9 w-45 p-4 mt-4"></div>
                    {/* Question Level */}
                    <div className = "bg-gray-200 rounded h-7 w-45 px-4"></div>
                    {/* Question Text */}
                    <div className = "bg-gray-300 rounded h-5 w-45 px-4"></div>
                    {/* Question Body */}
                    <div className = "bg-gray-200 rounded h-7 w-100 p-4 mt-2 mb-5"></div>                       
                </div>
                <div className = "flex flex-col p-6 pt-10 gap-3 mt-2">
                    {/* Option 1 */}
                    <div className = "bg-gray-300 rounded h-5 w-40"></div>                
                    {/* Option 2 */}
                    <div className = "bg-gray-200 rounded h-5 w-40"></div>
                    {/* Option 3 */}
                    <div className = "bg-gray-300 rounded h-5 w-40"></div>
                    {/* Option 4 */}
                    <div className = "bg-gray-200 rounded h-5 w-40"></div>
                </div>
            </div>
        </div>
    );
}

// Skeleton used as a placeholder for the test results
export function ResultInfoSkeleton() {
    return (
        <div className = {`relative overflow-hidden ${shimmer} flex flex-col bg-gray-100 rounded-lg shadow-lg p-4 sm:p-6 sm:min-w-[34rem] sm:min-h-[14rem] gap-3`}>
            {/* Test Attempt #~ Results */}
            <div className = "bg-gray-300 rounded h-5 w-44 mt-2"></div>
            {/* Test Date */}
            <div className = "bg-gray-200 rounded h-5 w-70"></div>
            {/* Total Score */}
            <div className = "bg-gray-300 rounded h-5 w-34"></div>
            {/* Your Suggested Entrance Level */}
            <div className = "bg-gray-200 rounded h-5 w-87"></div>
            <Link href = "">
                <button className = "mt-2 px-4 sm:px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-gray-300" type = "button" disabled>
                    <div className = "h-5 w-47"></div>
                </button>
            </Link>
        </div>
    );
}