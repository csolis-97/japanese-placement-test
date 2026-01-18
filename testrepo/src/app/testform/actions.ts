"use server";

//Define a type for storing the test form data
type testFormData = {
    questionId: number;
    questionText: string;
    questionBody: string;
    questionCategory: string;
    answerId: number[];
    answerText: string[];
}

export async function testForm(givenFields: testFormData) {

    //Divide the form data into separate variables
    const questionId = givenFields.questionId;
    const questionText = givenFields.questionText;
    const questionBody = givenFields.questionBody;
    const questionCategory = givenFields.questionCategory;
    const answerId = givenFields.answerId;
    const answerText = givenFields.answerText;

    /*const answerOne = givenFields.answerId[0];
    const answerTwo = givenFields.answerId[1];
    const answerThree = givenFields.answerId[2];
    const answerFour = givenFields.answerId[3];
    const answerTextOne = givenFields.answerText[0];
    const answerTextTwo = givenFields.answerText[1];
    const answerTextThree = givenFields.answerText[2];
    const answerTextFour = givenFields.answerText[3];
    */

    //Check that each const is properly logged
    console.log(questionId);
    console.log(questionText);
    console.log(questionBody);
    console.log(questionCategory);
    console.log(answerId);
    console.log(answerText);
    
    /*console.log(answerOne);
    console.log(answerTwo);
    console.log(answerThree);
    console.log(answerFour);
    console.log(answerTextOne);
    console.log(answerTextTwo);
    console.log(answerTextThree);
    console.log(answerTextFour);
    */

    console.log("BEGIN TEST DATA RETRIEVAL");

    //Try to retrieve the test data from the database
    
    try {
        console.log("Attempt to retrieve test data...");
        const response = await fetch('http://localhost:5000/testform', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'question_category' : questionCategory, 'question_id' : questionId, 'question_text' : questionText,
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
export default testForm;