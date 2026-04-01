"use server";

import { getURL, responseMessage } from "@/utils/utilFunctions";

console.log(`"HERE IS THE URL BEING USED!" ${getURL()}`);

//Define a type for storing the test form data
export type AnswersRequest = {
    attemptId: number;
    resultId: number;
};

export type ResultRequest = {
    testDate: Date;
    urlId: string;
};

export async function answersData(action: string, givenFields: AnswersRequest) {
    //Divide the form data into separate variables
    const attemptId = givenFields.attemptId;
    const resultId = givenFields.resultId;


    console.log("BEGIN ANSWER DATA RETRIEVAL");

    //Try to retrieve the test data from the database
    
    try {
        console.log("Attempt to retrieve test data...");
        const response = await fetch(`${getURL()}/api/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'action' : action,
                'attempt_id' : attemptId, 
                'score_id' : resultId
            })
        });

        // If there were any errors in the response, it will be stored in this const and caught.
        const errorMessage = await responseMessage(response);

        //Get the response from the database and return
        const data = await response.json();
        console.log("Here is the response from the database:");
        console.log(data);
        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (errorMessage) {
        console.log(errorMessage);
        throw new Error ("Internal Server Error: The record of the user's test results could not be retrieved.");
    }
}

export async function resultsData(action: string, givenFields: ResultRequest) {
    //Divide the form data into separate variables
    const urlId = givenFields.urlId;
    let testDate = givenFields.testDate;

    console.log("BEGIN RESULTS DATA RETRIEVAL");

    //Try to retrieve the test data from the database
    
    try {
        console.log("Attempt to retrieve test data...");
        const response = await fetch(`${getURL()}/api/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'action' : action, 
                'end_time' : testDate,
                'url_id' : urlId
            })
        });

        // If there were any errors in the response, it will be stored in this const and caught.
        const errorMessage = await responseMessage(response);

        //Get the response from the database and return
        const data = await response.json();
        console.log("Here is the response from the database:");
        console.log(data);

        //Since the date was converted into a string after it was retrieved in the backend, convert it back to a Date object before
        //returning
        const newTest = new Date(data['end_time']);
        testDate = newTest;
        data['end_time'] = testDate;
        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (errorMessage) {
        console.log(errorMessage);
        throw new Error ("Internal Server Error: The user's answers could not be retrieved.");
    }
}