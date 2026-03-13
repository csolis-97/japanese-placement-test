"use client";

import Link from "next/link";
import { createPortal } from "react-dom";

interface messageProps {
    messageText: string;
    buttonText: string;
}

// MessageModal is a simple component used for displaying messages on screen. It accepts text for the message and button as props.
export default function MessageModal( { messageText, buttonText } : messageProps) {
    return createPortal(
    <div className="flex min-h-screen items-center justify-center bg-[#d1190d] font-sans dark:bg-black">
        <main className="flex sm:min-h-screen sm:w-full sm:max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
            <div className = "fixed inset-0 w-screen h-screen flex items-center text-center justify-center bg-black/40">
            {
                <div className = "inset-0 items-center justify-center gap-6 text-center opacity-100 transition-opacity duration-300 sm:items-start sm:text-left border-8 border-gray-400 shadow-lg rounded-lg bg-white p-4 dark:text-gray-400">
                    <h1>{messageText}</h1>
                    <Link href = "/">
                        <button className = {"buttonStyle"} type = "button">{buttonText}</button>
                    </Link>
                </div>
            }
            </div>
        </main>
    </div>, document.body
);
}