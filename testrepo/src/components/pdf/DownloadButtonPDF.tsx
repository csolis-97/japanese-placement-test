"use client";

import { use } from "react";
import CreateResultsPDF from "./CreateResultsPDF";
import { ResultQuestion, TestResult } from "@/types/sharedInterface";
import dynamic from "next/dynamic";

interface DownloadButtonPDFProps {
    resultsPromise: Promise<TestResult>;
    answersPromise: Promise<ResultQuestion[]>;
};

export default function DownloadButtonPDF(props : DownloadButtonPDFProps) {

    const results = use(props.resultsPromise) as TestResult;
    const questions = use(props.answersPromise) as ResultQuestion[];

    // Dynamically import PDFDownloadLink, so that the pdfs can work without issue.
    // Note that dynamic imports return a promise, which is why I chained with a .then to return it since it is a named export.
    // ssr is set to false so that the server does not try to render this component
    const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then((module) => module.PDFDownloadLink), {
        ssr: false,
        loading: () => <p>Loading...</p>
    });
    
    return (
        <button type = "button" className = {`
            button-style flex 
            justify-center items-center
            w-[8.125rem] sm:w-[10.125rem] 
            h-[3.375rem] sm:h-[3.375rem]
        `}>
            <PDFDownloadLink 
                document = {<CreateResultsPDF TestResultProps = {results} ResultQuestionProps = {questions}/>} 
                fileName = "results.pdf"
            >
                {
                // This is a function call that destructures the loading boolean, instead of using all of the props
                ({ loading }) => loading ? (<p>Preparing PDF...</p>) : (<p>Download PDF</p>)
                }
            </PDFDownloadLink>
        </button>
    );
}