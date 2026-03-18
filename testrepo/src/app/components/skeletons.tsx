"use client";

// Loading animation, taken from the one provided by Vercel
const shimmer = `before:absolute before:inset-0 
    before:-translate-x-full before:animate-[shimmer_1s_infinite] 
    before:bg-gradient-to-r before:from-transparent 
    before:via-white/40 before:to-transparent`;

// Skeleton used as a placeholder for the questions
export function QuestionDisplaySkeleton() {
    return (
        // Here, min-h-[40.625rem] is used to ensure that the height is a minimum of 650px, but will grow if content is bigger than that using h-fit.
        <div className = {`
            relative overflow-hidden ${shimmer} 
            flex flex-col 
            bg-gray-100 rounded-lg
            min-w-[20rem] sm:min-w-[40.625rem] 
            min-h-[25rem] sm:min-h-[40.625rem]
            shadow-md
        `}>
            { /* Because there is a divide in this component, it will break if I move rounded and h to the shared div */}
            <div className = "divide-y-2 divide-gray-400">
                <div className = "flex flex-col pl-4 gap-2">
                    {/* Question Number */}
                    <div className = "bg-gray-300 rounded h-4 sm:h-7 w-22 sm:w-42 mt-5"></div>
                    {/* Question Level */}
                    <div className = "bg-gray-200 rounded h-4 sm:h-6 w-32 sm:w-41 px-4 mt-4 sm:mt-2"></div>
                    {/* Question Text */}
                    <div className = "bg-gray-300 rounded h-4 sm:h-5 w-41 sm:w-42 px-4"></div>
                    {/* Question Body */}
                    <div className = "bg-gray-200 rounded h-4 sm:h-6 w-44 sm:w-75 mt-4 mb-5"></div>                       
                </div>
                <div className = "flex flex-col p-6 pt-4 sm:pt-10 gap-2 sm:gap-3 mt-2 w-40">
                    {/* Option 1 */}
                    <div className = "bg-gray-300 rounded h-5"></div>                
                    {/* Option 2 */}
                    <div className = "bg-gray-200 rounded h-5"></div>
                    {/* Option 3 */}
                    <div className = "bg-gray-300 rounded h-5"></div>
                    {/* Option 4 */}
                    <div className = "bg-gray-200 rounded h-5"></div>
                </div>
            </div>
        </div>
    );
}

// Skeleton used as a placeholder for the test results
export function ResultInfoSkeleton() {
    return (
        <div className = {`
            relative overflow-hidden ${shimmer} 
            flex flex-col 
            bg-gray-100 rounded-lg shadow-lg 
            p-4 sm:p-6
            min-w-[16rem] sm:min-w-[32rem] 
            min-h-[10rem] sm:min-h-[14rem] 
            gap-1
        `}>
            {/* Test Attempt #~ Results */}
            <div className = "bg-gray-300 rounded h-5 w-50 sm:w-51 mt-2"></div>
            {/* Test Date 1st Line*/}
            <div className = "bg-gray-200 rounded h-5 w-55 sm:w-77"></div>
            {/* Test Date 2nd Line*/}
            <div className = "sm:hidden bg-gray-200 rounded h-5 w-20"></div>
            {/* Total Score */}
            <div className = "bg-gray-300 rounded h-5 w-37 sm:w-37"></div>
            {/* Your Suggested Entrance Level Line 1*/}
            <div className = "bg-gray-200 rounded h-5 w-46 sm:w-78"></div>
            {/* Your Suggested Entrance Level Line 2*/}
            <div className = "sm:hidden bg-gray-200 rounded h-5 w-30 sm:w-87"></div>
            <button 
                className = {`
                    mt-4 px-4 sm:px-8 
                    py-4 font-semibold text-sm 
                    text-white sticky 
                    top-0 bg-gray-300
                    w-[14rem] sm:w-[16rem] 
                    h-[3.375rem] sm:h-[3.375rem]
                `} 
                type = "button" 
                disabled
            >
            </button>
        </div>
    );
}

// Skeleton used as a placeholder for individual buttons, such as the one used in TestTake
export function ButtonSkeleton() {
    return (
        <button 
            className = {`
                mt-2 px-4 sm:px-8 
                py-4 font-semibold text-sm 
                text-white sticky 
                top-0 bg-gray-300
            `}  
            type = "button" 
            disabled
        >
            <div className = "h-5 w-8"></div>
        </button>
    )
}