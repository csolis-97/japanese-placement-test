"use server";

import { getURL, responseMessage } from "@/app/utils/utilFunctions";

console.log(`"HERE IS THE URL BEING USED!" ${getURL()}`);

//Type defined below will be used for tracking each stage's info, including each stage's difficulty,
//The current stage number, the current question of the stage, and the current stage's question_ids.
export type StageData = {
    stageDifficulty: string[];
    stageNum: number;
    stageQuestion: number;
    stageQuestionId: number[];
};

//Define a type for storing the test form data
export type TestFormData = {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    userAttempt: number;
    resultId: number;
};

export type ResponseData = {
    questionId: number[];
    pastId: number[];
    userText: string[];
    userAttempt: number;
    resultId: number;
    currentStage: number;
};

export type RequestData = {
    questionId: number[];
    pastId: number[];
    questionCategory: string;
    wasCorrect: boolean[];
};

export type SubmitData = {
    resultId: number;
    userAttempt: number;
    pastId: number[];
    isCorrect: boolean[];
    stageArray: string[];
};

export async function submitTest(action: string, givenFields: SubmitData) {
    //Divide the form data into separate variables
    const isCorrect = givenFields.isCorrect;
    const resultId = givenFields.resultId;
    const userAttempt = givenFields.userAttempt;
    const pastId = givenFields.pastId;
    const stageArray = givenFields.stageArray;

    // This action will submit the test to the backend for processing
    action = "submitTest";
    // Create a snapshot of the submission time to send alongside the POST request
    let submittedTime = new Date().toISOString();
    console.log("HERE IS THE SUBMISSION TIMESTAP");
    console.log(submittedTime);
    console.log("USING RESULT ID OF:");
    console.log(resultId);
    console.log(isCorrect);
    console.log("SEND THE ANSWERS TO THE BACKEND");
    try {
        console.log("Attempt to submit the test...");
        const response = await fetch(`${getURL()}/api/testform`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({
                'action' : action, 
                'date' : submittedTime, 
                'was_correct' : isCorrect, 
                'score_id' : resultId,
                'user_attempt' : userAttempt, 
                'past_id' : pastId, 
                'stage_array' : stageArray
            })
        });

        // If there were any errors in the response, it will be stored in this const and caught.
        const errorMessage = await responseMessage(response);

        const data = await response.json();
        console.log("Here is the response from the database in regards to submitting the test:");
        console.log(data);
        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (errorMessage) {
        console.log(errorMessage);
        throw new Error ("Internal Server Error: An error occured while submitting the test results.");
    }
}

export async function questionFetch(action: string, givenFields: RequestData) {
    //Divide the form data into separate variables
    const questionId = givenFields.questionId;
    const pastId = givenFields.pastId;
    const questionCategory = givenFields.questionCategory;
    const wasCorrect = givenFields.wasCorrect;

    action = "retrieveStage";
    console.log("HERE IS THE USER'S CURRENT LEVEL AND QUESTION ID ALONGSIDE WHETHER THEY WERE CORRECT OR NOT AND ALL PAST ID's");
    console.log(questionCategory, questionId, wasCorrect, pastId);
    console.log("SEND THIS INFO TO THE BACKEND");
        try {
        console.log("Attempt to retrieve the questions for the next stage...");
        const response = await fetch(`${getURL()}/api/testform`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({
                'action' : action, 
                'question_id' : questionId, 
                'past_id' : pastId, 
                'question_category' : questionCategory, 
                'was_correct' : wasCorrect
            })
        });

        // If there were any errors in the response, it will be stored in this const and caught.
        const errorMessage = await responseMessage(response);

        const data = await response.json();
        console.log("Here is the response from the database after sending the current level, question ID, and correct boolean:");
        console.log(data);
        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (errorMessage) {
        console.log(errorMessage);
        throw new Error ("Internal Server Error: The questions for the next stage could not be fetched.");
    }
}

export async function questionCheck(action: string, givenFields: ResponseData) {
    //Divide the form data into separate variables
    const questionId = givenFields.questionId;
    const pastId = givenFields.pastId;
    const userText = givenFields.userText;
    const userAttempt = givenFields.userAttempt;
    const resultId = givenFields.resultId;
    const currentStage = givenFields.currentStage;

    // This action will create the record that will be used to store the results and return the resultId to be used
    action = "sendStage";
    console.log("CURRENT ANSWER");
    console.log(userText);
    console.log("CURRENT ATTEMPT");
    console.log(userAttempt);
    console.log("RESULT ID");
    console.log(resultId);
    console.log("CURRENT QUESTION ID");
    console.log(questionId);
    console.log("SEND THE ANSWERS TO THE BACKEND");
    try {
        console.log("Attempt to send the answers for the current stage...");
        const response = await fetch(`${getURL()}/api/testform`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({
                'action' : action, 
                'question_id' : questionId, 
                'past_id' : pastId, 
                'user_answer_text' : userText, 
                'user_attempt' : userAttempt, 
                'score_id' : resultId,
                'current_stage' : currentStage
            })
        });

        // If there were any errors in the response, it will be stored in this const and caught.
        const errorMessage = await responseMessage(response);

        const data = await response.json();
        console.log("Here is the response from the database after sending the current answer data:");
        console.log(data);
        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (errorMessage) {
        console.log(errorMessage);
        throw new Error ("Internal Server Error: The answers for the current stage could not be checked.");
    }
}