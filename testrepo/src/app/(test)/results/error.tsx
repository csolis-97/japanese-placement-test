"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";

//This variable will apply the styling for the button
const buttonStyle = "mt-4 px-8 py-4 font-semibold text-sm text-white position:sticky top:0 bg-[#d1190d] hover:bg-[#700f09]";

export default function ErrorPage( { error } : { error: Error & { digest?: string } } ) {
    useEffect(() => {
        console.log(error);
    }, [error])

    return createPortal(
    <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
        <main className="flex sm:min-h-screen sm:w-full sm:max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
            <div className = "fixed inset-0 w-screen h-screen flex items-center text-center justify-center bg-black/40">
            {
                <div className = "inset-0 items-center justify-center gap-6 text-center opacity-100 transition-opacity duration-300 sm:items-start sm:text-left border-8 border-gray-400 shadow-lg rounded-lg bg-white p-4 dark:text-gray-400">
                    <h1>Failed to retrieve the test results! Please reload the page and try again.</h1>
                    <Link href = "/">
                        <button className = {buttonStyle} type = "button">Back to Home</button>
                    </Link>
                </div>
            }
            </div>
        </main>
    </div>, document.body
);
}