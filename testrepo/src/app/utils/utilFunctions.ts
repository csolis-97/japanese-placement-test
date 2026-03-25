import { TestQuestion } from "@/app/components/TestDisplay";
import { XORShift128 } from "random-seedable";
import Sqids from "sqids";

// The getURL function will check if an environmental variable named VERCEL_URL exists. If it does,
// return the address prefixed by https://. Otherwise, return the value of the FRONTEND_URL
// environmental variable, or the default localhost at port 5000, or whichever port is specified in Flask.
export function getURL() {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return `${process.env.FRONTEND_URL}` || "http://localhost:5000";
}

// This function will be used in case an error occurs when attempting to request info from the backend.
// If the response is not okay, call the text function and store it in a const. Then print and return.
export async function responseMessage(response: Response) {
    console.log(`HERE IS THE STATUS OF THE RESPONSE: ${response.status}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.log(`HERE IS THE FULL ERROR TAKEN FROM THE RESPONSE: ${errorText}`);
        const errorMessage = `Error with a status code of ${response.status}. Full details are as follows: ${errorText}`;
        throw new Error(errorMessage);
    }
}

// This function will take an error of unknown type as an argument, and check its type. If it is Error,
// return it. If it is a string, make a new error with it. Otherwise go to the else.
export function errorType(error: unknown) {
    if (error instanceof Error) {
        return error;
    }
    else if (error instanceof String) {
      return(new Error(String(error)));
    }
    else {
      return(new Error("An unknown error occured."));
    }
}

// This function will check if the email provided meets the bare minimum requirements. That being that it is under
// a certain length, and that there is a @ and a . included in the email string.
export function checkEmail(email: string) {
    const LENGTH_LIMIT = 254;
    // const emailRegex = RegExp('^[A-Za-z0-9._+-]+@[A-Za-z0-9._]+\.[A-Za-z]{2,}$', 'i');
    const LAX_REGEX = RegExp('^[\\S]+@[\\S]+\.[\\S]+$', 'i');
    // Check if the email length is above 254 characters and return the message below if it is.
    if (email.length > LENGTH_LIMIT) {
        console.log("EMAIL LENGTH ERROR.");
        return "Email length cannot be more than 254 characters.";
    }
    // Test if the email passes the test for the given regex. Swap out the regex if a different one is required.
    if (!LAX_REGEX.test(email)) {
        console.log("EMAIL FORMAT ERROR.");
        return "Please ensure that the email address format is correct.";
    }
}

// This function will check if the name provided is shorter than the character limit. If not, return an error.
export function checkName(name: string) {
    const LENGTH_LIMIT = 254;
    if (name.length > LENGTH_LIMIT) {
        console.log("NAME LENGTH ERROR.");
        return "Name length cannot be more than 254 characters.";
    } 
}

// This function will shuffle the answer_id and answer_text (and correct_answer if it exists) (using the seedRNG that was also passed)
// of the testQuestion array provided as the argument, and return it.
export function shuffleList(givenList: TestQuestion[], seedRNG: XORShift128) {
    console.log(`ENTERED THE SEED SHUFFLE WITH THIS SEED: ${seedRNG}!`);
    let cloneList = JSON.parse(JSON.stringify(givenList));
    for (let i = 0; i < givenList.length; i++) {
        let indexList: number[] = [];
        let cloneSublist = JSON.parse(JSON.stringify(givenList[i]));
        for (let j = 0; j < givenList[i].answer_id.length; j++) {
            //indexList.push(givenList[i].answer_id[j]);
            indexList.push(j);
        }
        console.log(`FINISHED GETTING THE INDICES FOR THE INDEX LIST OF THE CURRENT TEST QUESTION: ${indexList}`);
        let shuffleIndex = JSON.parse(JSON.stringify(indexList));
        seedRNG.shuffle(shuffleIndex);
        console.log(`FINISHED SHUFFLING THE INDICES FOR THE INDEX LIST OF THE CURRENT TEST QUESTION: ${shuffleIndex}`);
        //Object.values(cloneSublist as testQuestion).map((value: testQuestion, index: number) => {
        const answerId = cloneSublist.answer_id.map((value: number, index: number) => {
            //value = shuffleIndex[index];
            value = givenList[i].answer_id[shuffleIndex[index]];
            console.log(`MAPPED ${givenList[i].answer_id[index]} AT INDEX ${index} OF GIVENLIST TO ${value} AT INDEX ${index} OF SHUFFLE INDEX!`);
            return value;
        });
        const answerText = cloneSublist.answer_text.map((value: string, index: number) => {
            //value = givenList[i].answer_text[shuffleIndex[index] - 1];
            value = givenList[i].answer_text[shuffleIndex[index]];
            console.log(`MAPPED ${givenList[i].answer_text[index]} AT INDEX ${index} TO ${value} AT INDEX ${index} OF SHUFFLE INDEX!`);
            return value;
        });
        // Make a const so it can define if the correct_answer array is null or not below
        const correctValues = givenList[i].correct_answer;
        if (correctValues) {
            const correctAnswer = cloneSublist.correct_answer.map((value: boolean, index: number) => {
                //value = correctValues[shuffleIndex[index] - 1];
                value = correctValues[shuffleIndex[index]];
                console.log(`MAPPED ${correctValues[index]} AT INDEX ${index} TO ${value} AT INDEX ${index} OF SHUFFLE INDEX!`);
                return value;
            });
            // Set the shuffled array of correct_answer
            cloneSublist.correct_answer = correctAnswer;
        }

        // Set the shuffled arrays of answer_id and answer_text
        cloneSublist.answer_id = answerId;
        cloneSublist.answer_text = answerText;

        console.log(`FINALIZED VERSION OF CLONESUBLIST LOOKS LIKE THIS AT THE CURRENT INDEX ${i}: ${JSON.stringify(cloneSublist)}`);
        console.log(`FOR REFERENCE, ORIGINAL VERSION LOOKS LIKE THIS AT THE CURRENT INDEX ${i}: ${JSON.stringify(givenList[i])}`);
        cloneList[i] = cloneSublist;
        console.log(`REPLACED VALUES AT INDEX ${i} OF CLONELIST WITH THIS: ${JSON.stringify(cloneList[i])}`);
    }
    // After exiting the for loops
    console.log(`NEW CLONELIST: ${JSON.stringify(cloneList)}`);
    return cloneList;
}

// This function uses Sqid to encode the seed, which then strips it of all non-integer characters and passes it as the argument
// for a new XORShift128 object, which is stored in the seedRNG const
export function seedCreate(seed: number[]) {
    const hash = new Sqids({
        minLength: 16,
    });
    console.log(`HERE IS THE SEED BEFORE ENCODING: ${seed}`);
    const hashedSeed = hash.encode(seed);
    // PURELY DEBUG
    console.log(`HERE IS THE ENCODED SEED: ${hashedSeed}`);
    console.log(`HERE IS THE DECODED SEED: ${hash.decode(hashedSeed)}`);

    const replaceString = JSON.parse(JSON.stringify(hashedSeed));
    // Strip the string of all non-integer characters. The below is Regex, the g flag means global, \D means all non-integers.
    const finalString = replaceString.replace(/\D/g, "");
    console.log(`FINISHED SETTING UP THE REPLACE STRING: ${finalString}`);
    const seedRNG = new XORShift128(Number(finalString));
    return seedRNG;
}

// This function will convert a Date object to the proper format used in the results screen
export function formatResultsDate(testDate: Date) {
    // This const will be used in order to get a localeString with the correct info
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    };

    let formattedDate = testDate.toLocaleString("en-US", dateOptions);
    /* This is the first time I've formally learned method chaining in Typescript so, here goes
        editFormat is initially assigned to the value of formattedDate, and two method calls are chained
        and the result of them returned to editFormat. I decided to go with this, since the alternative
        was two different if statements with the same function being called. Note that the semicolon
        is added only at the end of the last chained method */
    const editFormat = formattedDate
        .replace("AM", "A.M.")
        .replace("PM", "P.M.");
    return editFormat;
}