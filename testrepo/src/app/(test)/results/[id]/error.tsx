"use client";

import { useEffect } from "react";
import MessageModal from "@/app/components/MessageModal";


export default function ErrorPage( { error, reset } : { error: Error & { digest?: string }, reset: () => void } ) {
    useEffect(() => {
        console.log(error);
    }, [error]);

    // Assign a string of the error so that it can properly be displayed.
    const errorMessage = String(error);

    return(
        // Slice the first seven characters so that "Error: " is ignored
        <MessageModal 
            messageText = {errorMessage} 
            buttonText = "Back to Home" 
            reset = {reset}
        />
    );
}