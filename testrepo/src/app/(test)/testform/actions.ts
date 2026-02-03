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
    resultId: number;
}

type responseData = {
    questionId: number[];
    pastId: number[];
    userText: string[];
    userAttempt: number;
    resultId: number;
}

type requestData = {
    questionId: number[];
    pastId: number[];
    questionCategory: string;
    wasCorrect: boolean[];
}

type submitData = {
    resultId: number;
    userAttempt: number;
    pastId: number[];
    isCorrect: boolean[];
    stageArray: string[];
}

export async function resultNumber(action: string, resultId: number) {
    // This action will create the record that will be used to store the results and return the resultId to be used

    console.log(resultId)
    console.log("GET THE ID FOR THE CURRENT SCORES FROM THE BACKEND");
    try {
        console.log("Attempting to create the score record and fetch the result_id...")
        const response = await fetch('http://localhost:5000/testform', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({'action' : action, 'score_id' : resultId})
        });

        const data = await response.json();
        console.log("Here is the response from the database after requesting the current result ID:");
        console.log(data);
        return data;
    }
    catch(error) {
        console.log(error);
        console.log("Internal Server Error: Current score's result ID could not be fetched.")
    }
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
        console.log("Here is the response from the database in regards to the current attempt number to be used:");
        console.log(data);
        return data;
    }

    catch(error) {
        console.log(error);
        console.log("Internal Server Error: Attempt number could not be retrieved.")
    }
}

export async function submitTest(action: string, givenFields: submitData) {
    //Divide the form data into separate variables
    const isCorrect = givenFields.isCorrect;
    const resultId = givenFields.resultId;
    const userAttempt = givenFields.userAttempt;
    const pastId = givenFields.pastId;
    const stageArray = givenFields.stageArray;

    // This action will submit the test to the backend for processing
    action == "submitTest"
    // Create a snapshot of the submission time to send alongside the POST request
    let submittedTime = new Date();
    console.log("HERE IS THE SUBMISSION TIMESTAP")
    console.log(submittedTime)
    console.log("USING RESULT ID OF:")
    console.log(resultId)
    console.log(isCorrect)
    console.log("SEND THE ANSWERS TO THE BACKEND");
    try {
        console.log("Attempt to submit the test...")
        const response = await fetch('http://localhost:5000/testform', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({'action' : action, 'date' : submittedTime, 'was_correct' : isCorrect, 'score_id' : resultId,
                 'user_attempt' : userAttempt, 'past_id' : pastId, 'stage_array' : stageArray})
        });

        const data = await response.json();
        console.log("Here is the response from the database in regards to submitting the scores:");
        console.log(data);
        return data;
    }

    catch(error) {
        console.log(error);
        console.log("Internal Server Error: The score could not be calculated.")
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
            body: JSON.stringify({'action' : action, 'question_category' : questionCategory, 'question_id' : questionId, 
                'question_text' : questionText, 'question_body' : questionBody, 'answer_id' : answerId, 'answer_text' : answerText})
        });

        //Get the response from the database and return
        const data = await response.json();
        console.log("Here is the response from the database in regards to the question data:");
        console.log(data);
        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (error) {
        console.log(error);
        return "Internal Server Error: Test question and answer data could not be retrieved.";
    }
}

export async function questionFetch(action: string, givenFields: requestData) {
    //Divide the form data into separate variables
    const questionId = givenFields.questionId;
    const pastId = givenFields.pastId;
    const questionCategory = givenFields.questionCategory;
    const wasCorrect = givenFields.wasCorrect;

    action = "retrieveStage"
    console.log("HERE IS THE USER'S CURRENT LEVEL AND QUESTION ID ALONGSIDE WHETHER THEY WERE CORRECT OR NOT AND ALL PAST ID's")
    console.log(questionCategory, questionId, wasCorrect, pastId)
    console.log("SEND THIS INFO TO THE BACKEND")
        try {
        console.log("Attempt to retrieve a new question...")
        const response = await fetch('http://localhost:5000/testform', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({'action' : action, 'question_id' : questionId, 'past_id' : pastId, 
                'question_category' : questionCategory, 'was_correct' : wasCorrect})
        });

        const data = await response.json();
        console.log("Here is the response from the database after sending the current level, question ID, and correct boolean:");
        console.log(data);
        return data;
    }

    catch(error) {
        console.log(error);
        console.log("Internal Server Error: New question could not be fetched.")
    }
}

export async function questionCheck(action: string, givenFields: responseData) {

    //Divide the form data into separate variables
    const questionId = givenFields.questionId;
    const pastId = givenFields.pastId;
    const userText = givenFields.userText;
    const userAttempt = givenFields.userAttempt;
    const resultId = givenFields.resultId;

    // This action will create the record that will be used to store the results and return the resultId to be used
    action = "sendStage"
    // Create a snapshot of the submission time to send alongside the POST request
    let submittedTime = new Date();
    console.log("HERE IS THE SUBMISSION TIMESTAP")
    console.log(submittedTime)

    console.log("CURRENT ANSWER")
    console.log(userText)
    console.log("CURRENT ATTEMPT")
    console.log(userAttempt)
    console.log("RESULT ID")
    console.log(resultId)
    console.log("CURRENT QUESTION ID")
    console.log(questionId)
    console.log("SEND THE ANSWERS TO THE BACKEND");
    try {
        console.log("Attempt to send the answers...")
        const response = await fetch('http://localhost:5000/testform', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({'action' : action, 'question_id' : questionId, 'past_id' : pastId, 
                'user_answer_text' : userText, 'user_attempt' : userAttempt, 'score_id' : resultId})
        });

        const data = await response.json();
        console.log("Here is the response from the database after sending the current answer data:");
        console.log(data);
        return data;
    }

    catch(error) {
        console.log(error);
        console.log("Internal Server Error: Answer could not be checked.")
    }
}