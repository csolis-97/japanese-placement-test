"use server";

const getURL = () => {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return `${process.env.FRONTEND_URL}` || "http://localhost:3000";
}

console.log(`"HERE IS THE URL BEING USED!" ${getURL()}`)

//Define a type for storing the test form data
export type answerData = {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
    correctAnswer: boolean[];
    attemptId: number;
    resultId: number;
    userText: string;
    wasCorrect: boolean;
}

export type resultData = {
    resultId:  number;
    attemptId: number;
    totalScore: number;
    entranceLevel: string;
    testDate: Date;
}

export async function answersData(action: string, givenFields: answerData) {

    //Divide the form data into separate variables
    const questionId = givenFields.questionId;
    const questionText = givenFields.questionText;
    const questionBody = givenFields.questionBody;
    const questionCategory = givenFields.questionCategory;
    const answerId = givenFields.answerId;
    const answerText = givenFields.answerText;
    const correctAnswer = givenFields.correctAnswer;
    const attemptId = givenFields.attemptId;
    const resultId = givenFields.resultId;
    const userText = givenFields.userText;
    const wasCorrect = givenFields.wasCorrect;


    console.log("BEGIN ANSWER DATA RETRIEVAL");

    //Try to retrieve the test data from the database
    
    try {
        console.log("Attempt to retrieve test data...");
        const response = await fetch(`${getURL()}/api/flask/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'action' : action, 'question_category' : questionCategory, 'question_id' : questionId, 
                'question_text' : questionText, 'question_body' : questionBody, 'answer_id' : answerId, 'answer_text' : answerText, 
                'correct_answer' : correctAnswer, 'user_answer_text' : userText, 'user_was_correct' : wasCorrect,
                'attempt_id' : attemptId, 'score_id' : resultId})
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

export async function resultsData(action: string, givenFields: resultData) {

    //Divide the form data into separate variables
    const resultId = givenFields.resultId;
    const attemptId = givenFields.attemptId;
    const totalScore = givenFields.totalScore;
    const entranceLevel = givenFields.entranceLevel;
    let testDate = givenFields.testDate;

    console.log("BEGIN RESULTS DATA RETRIEVAL");

    //Try to retrieve the test data from the database
    
    try {
        console.log("Attempt to retrieve test data...");
        const response = await fetch(`${getURL()}/api/flask/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'action' : action, 'score_id' : resultId, 'attempt_id' : attemptId, 'total_score' : totalScore,
                'entrance_level' : entranceLevel, 'test_date' : testDate})
        });

        //Get the response from the database and return
        const data = await response.json();
        console.log("Here is the response from the database:");
        console.log(data);

        //Since the date was converted into a string after it was retrieved in the backend, convert it back to a Date object before
        //returning
        const newTest = new Date(data['test_date'])
        testDate = newTest
        data['test_date'] = testDate
        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (error) {
        console.log(error);
        return "Internal Server Error";
    }
}
//Only async functions are allowed to be exported in a "use server" file.