"use client";

import { useEffect } from "react";
import MessageModal from "@/app/components/MessageModal";


export default function ErrorPage( { error } : { error: Error & { digest?: string } } ) {
    useEffect(() => {
        console.log(error);
    }, [error])

    return(
        <MessageModal messageText = "Failed to retrieve the test results! Please reload the page and try again." buttonText = "Back to Home" />
    );
}