"use server";

//Define a type for storing the test form data
type testFormData = {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    userAttempt: number;
}

export async function attemptNumber(action: string, userAttempt: number) {
    // This action will send the answers to the backend for processing
    action = "getAttemptNumber"
    console.log("BEGIN RETRIEVAL OF THE USER'S CURRENT ATTEMPT")
    try {
        console.log("Attempt to get the attempt number...")
        const response = await fetch('http://localhost:5000/testform', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({'action' : action, 'user_attempt' : userAttempt})
        });

        const data = await response.json();
        console.log("Here is the response from the database");
        console.log(data);
        return data;
    }

    catch(error) {
        console.log(error);
        console.log("Internal Server Error")
    }
}

export async function testForm(action: string, givenFields: testFormData) {

    //Divide the form data into separate variables
    const questionId = givenFields.questionId;
    const questionText = givenFields.questionText;
    const questionBody = givenFields.questionBody;
    const questionCategory = givenFields.questionCategory;
    const answerId = givenFields.answerId;
    const answerText = givenFields.answerText;
    const userAttempt = givenFields.userAttempt;

    // This action will send the answers to the backend for processing
    if (action === "sendAnswers") {
        // Create a snapshot of the submission time to send alongside the POST request
        let submittedTime = new Date();
        console.log("HERE IS THE SUBMISSION TIMESTAP")
        console.log(submittedTime)

        console.log(answerText)
        console.log("SEND THE ANSWERS TO THE BACKEND");
        try {
            console.log("Attempt to send the answers...")
            const response = await fetch('http://localhost:5000/testform', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({'action' : action, 'date' : submittedTime, 'question_category' : questionCategory, 'question_id' : questionId, 'question_text' : questionText,
                    'question_body' : questionBody, 'answer_id' : answerId, 'answer_text' : answerText, 'user_attempt' : userAttempt})
            });

            const data = await response.json();
            console.log("Here is the response from the database");
            console.log(data);
            return data;
        }

        catch(error) {
            console.log(error);
            console.log("Internal Server Error")
        }

    }
    //Default action is to retrieve the test data
    else {
        action = "retrieveQuestions"
        console.log("BEGIN TEST DATA RETRIEVAL");

        //Try to retrieve the test data from the database
        
        try {
            console.log("Attempt to retrieve test data...");
            const response = await fetch('http://localhost:5000/testform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'action' : action, 'question_category' : questionCategory, 'question_id' : questionId, 'question_text' : questionText,
                    'question_body' : questionBody, 'answer_id' : answerId, 'answer_text' : answerText})
            });

            //Get the response from the database and return
            const data = await response.json();
            console.log("Here is the response from the database:");
            console.log(data);
            return data;
        }
        //If an error occured during retrieval, catch it and log it
        catch (error) {
            console.log(error);
            return "Internal Server Error";
        }
    }
}
//export default {attemptNumber, testForm};