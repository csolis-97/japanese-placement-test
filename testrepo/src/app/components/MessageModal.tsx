"use client";

import Link from "next/link";
import { createPortal } from "react-dom";

interface MessageProps {
    messageText: string;
    buttonText: string;
    reset?: () => void;
}

// MessageModal is a simple component used for displaying messages on screen. It accepts text for the message and button as props.
export default function MessageModal( { messageText, buttonText, reset } : MessageProps) {
    return createPortal(
    <div className = {`
        flex min-h-screen 
        justify-center bg-[#d1190d] 
        font-sans
    `}>
        <main className = "w-full sm:max-w-3xl bg-white sm:items-start">
            <div className = "fixed inset-0 flex items-center justify-center bg-black/40">
                <div className = {`
                    relative border-8 border-gray-400 
                    shadow-lg rounded-lg
                    p-4 bg-white 
                    min-w-[10rem] sm:min-w-[40rem] 
                    min-h-[11rem] sm:min-h-[11rem]
                    max-w-xl text-center
                `}>
                    <h1>{messageText}</h1>
                    <Link href = "/" className = "button-style absolute left-6 sm:left-10 bottom-5">
                        {buttonText}
                    </Link>
                    { // Only render this button if there was a reset function passed to the component
                        reset && (
                            <div className = "absolute right-6 sm:right-10 bottom-5">
                                <button className = {"button-style"} onClick = {() => reset()}>
                                    Reload the Page
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>
        </main>
    </div>, document.body
);
}