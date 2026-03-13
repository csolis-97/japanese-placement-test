"use client";

import Link from "next/link";
import { createPortal } from "react-dom";

interface messageProps {
    messageText: string;
    buttonText: string;
    reset?: () => void;
}

// MessageModal is a simple component used for displaying messages on screen. It accepts text for the message and button as props.
export default function MessageModal( { messageText, buttonText, reset } : messageProps) {
    return createPortal(
    <div className="flex min-h-screen justify-center bg-[#d1190d] font-sans dark:bg-black">
        <main className="sm:w-full sm:max-w-3xl bg-white dark:bg-black sm:items-start">
            <div className = "fixed inset-0 flex items-center justify-center bg-black/40">
            {
                <div className = "relative border-8 border-gray-400 shadow-lg rounded-lg bg-white p-4 dark:text-black-500 sm:min-w-[10rem] sm:min-h-[10rem]">
                    <h1>{messageText}</h1>
                    <Link href = "/">
                        <div className = "absolute left-10 bottom-5">
                            <button className = {"buttonStyle"} type = "button">{buttonText}</button>
                        </div>
                    </Link>
                    { // Only render this button if there was a reset function passed to the component
                        reset && (
                            <div className = "absolute right-10 bottom-5">
                                <button className = {"buttonStyle"} type = "button" onClick = {() => reset()}>Reload the Page</button>
                            </div>
                        )
                    }
                </div>
            }
            </div>
        </main>
    </div>, document.body
);
}