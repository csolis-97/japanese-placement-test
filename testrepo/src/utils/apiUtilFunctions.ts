import { getURL, responseMessage } from "./utilFunctions";
import { 
    InfoData, 
    ResponseData, 
    RequestData, 
    SubmitData, 
    AnswersRequest, 
    ResultRequest 
} from "@/types/sharedType";

type ActionKey = {
    action: string,
    givenFields: InfoData | ResponseData | RequestData | SubmitData | AnswersRequest | ResultRequest
};

type PossibleDataTypes = InfoData | ResponseData | RequestData | SubmitData | AnswersRequest | ResultRequest;

export async function testAction(params: ActionKey) {
    const mappedValues = translateMap(params.action, params.givenFields);

    const jsonBody = mappedValues.jsonBody;
    const apiRoute = mappedValues.apiRoute;
    const routeError = mappedValues.routeError;

    // If the test is being submitted, or the initial test record is being created, make sure to add a timestamp to the jsonBody
    if (params.action === "submitTest" || params.action === "createRecord") {
        // Create a snapshot of the submission time to send alongside the POST request
        switch (params.action) {
            case "submitTest":
                const submittedTime = new Date().toISOString();
                console.log("HERE IS THE SUBMISSION TIMESTAP");
                console.log(submittedTime);
                // See if there is a way to do this automatically without knowing the key name
                jsonBody['date'] = submittedTime;

            case "createRecord":
                const startTime = new Date().toISOString();
                console.log("HERE IS THE SUBMISSION TIMESTAP");
                console.log(startTime);
                // See if there is a way to do this automatically without knowing the key name
                jsonBody['start_time'] = startTime;
        }
    }
    
    // Now, send the request to the backend
    try {
        console.log("Attempt to rend the request to the backend...");
        const response = await fetch(`${getURL()}/api/${apiRoute}`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(jsonBody)
        });

        // If there were any errors in the response, it will be stored in this const and caught.
        const errorMessage = await responseMessage(response);

        const data = await response.json();
        console.log("Here is the response from the database:");
        console.log(data);

        // If the action was to retrieve the test info, make sure to format it properly before returning the data
        if (params.action === 'retrieveResults' && 'testDate' in params.givenFields) {
            // Since the date was converted into a string after it was retrieved in the backend, convert it back to a Date object before
            // returning
            const newTestDate = new Date(data['end_time']);
            params.givenFields.testDate = newTestDate;
            data['end_time'] = params.givenFields.testDate;
        }

        return data;
    }
    //If an error occured during retrieval, catch it and log it
    catch (errorMessage) {
        console.log(errorMessage);
        throw new Error(`${routeError}`);
    }
}

function translateMap(action: string, givenFields: PossibleDataTypes) {
    // This const will be used to properly match each possible field across the data types to the name it referred to as in JSON
    // when received in the backend
    const fieldTranslateMap: Record<string, string> = {
        // Shared fields
        resultId: 'score_id',
        attemptId: 'attempt_id',
        pastId: 'past_id',
        isCorrect: 'was_correct',
        urlId: 'url_id',
        // Fields unique to InfoData
        email: 'email',
        name: 'name',
        startTime: 'start_time',
        // Fields unique to RequestData
        questionId: 'question_id',
        questionCategory: 'question_category',
        // Fields unique to ResponseData
        userText: 'user_answer_text',
        currentStageNum: 'current_stage_num',
        // Fields unique to SubmitData
        submittedTime: 'date',
        stageDifficultyArray: 'stage_difficulty_array',
        // Fields unique to ResultRequest
        // Not actually a duplicate, this is the one that was calculated in the backend
        testDate: 'end_time'
    };

    // Learn how to map these values to each type to make the code less repetitive
    type TestFormKeys = 'createRecord' | 'retrieveStage' | 'sendStage' | 'submitTest';
    type ResultKeys = 'retrieveResults' | 'retrieveAnswers';

    // This const will be used to map the current request type to the proper route
    const apiRouteMap: Record<string, string> = {
        'createRecord' : 'testform',
        'retrieveStage' : 'testform',
        'sendStage' : 'testform',
        'submitTest' : 'testform',
        'retrieveResults' : 'results',
        'retrieveAnswers' : 'results'
    };

    // This const will be used to map the current request type to the proper error message
    const routeErrorMap: Record<string, string> = {
        'createRecord' : "Internal Server Error: Test record could not be created. Result ID and attempt ID could not be fetched.",
        'retrieveStage' : "Internal Server Error: The questions for the next stage could not be fetched.",
        'sendStage' : "Internal Server Error: The answers for the current stage could not be checked.",
        'submitTest' : "Internal Server Error: An error occured while submitting the test results.",
        'retrieveResults' : "Internal Server Error: The record of the user's test results could not be retrieved.",
        'retrieveAnswers' : "Internal Server Error: The user's answers could not be retrieved."
        
    };

    // Map the apiRoute, alongside the error message for the current request incase anything goes wrong
    const apiRoute = apiRouteMap[action];
    const routeError = routeErrorMap[action];

    // Create the jsonBody initially just with the action. Since the values are all of different types, set it to unknown
    const jsonBody: Record<string, unknown> = {action: action};
    // Get the key, value pairs as arrays, and then iterate through them to map the field name to the proper jsonKey recognized by the backend,
    // to the current value
    const fieldEntries = Object.entries(givenFields);
    fieldEntries.forEach(([key, value]) => {
        const jsonKey = fieldTranslateMap[key] || key;
        jsonBody[jsonKey] = value;
    });

    return {
        apiRoute,
        routeError,
        jsonBody
    };
}