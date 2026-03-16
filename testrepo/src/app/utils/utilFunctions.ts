import { testQuestion } from "@/app/components/TestDisplay";
import { XORShift128 } from "random-seedable";
import { createHash } from "crypto";
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

// This function will check if the email provided meets the bare minimum requirements. That being that it is under
// a certain length, and that there is a @ and a . included in the email string.
export function checkEmail(email: string) {
    const lengthLimit = 254;
    // const emailRegex = RegExp('^[A-Za-z0-9._+-]+@[A-Za-z0-9._]+\.[A-Za-z]{2,}$', 'i');
    const laxRegex = RegExp('^[\\S]+@[\\S]+\.[\\S]+$', 'i');
    // Check if the email length is above 254 characters and return the message below if it is.
    if (email.length > lengthLimit) {
        console.log("EMAIL LENGTH ERROR.");
        return "Email length cannot be more than 254 characters.";
    }
    // Test if the email passes the test for the given regex. Swap out the regex if a different one is required.
    if (!laxRegex.test(email)) {
        console.log("EMAIL FORMAT ERROR.");
        return "Please ensure that the email address format is correct.";
    }
}

// This function will check if the name provided is shorter than the character limit. If not, return an error.
export function checkName(name: string) {
    const lengthLimit = 254;
    if (name.length > lengthLimit) {
        console.log("NAME LENGTH ERROR.");
        return "Name length cannot be more than 254 characters.";
    } 
}

// This function will shuffle the elements of the list provided as the argument and return it.
export function shuffleList(givenList: string[]) {
    for (let i = givenList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap the values at index i and index j
        [givenList[i], givenList[j]] = [givenList[j], givenList[i]]
    }
    return givenList;
}

// This function will shuffle the answer_id and answer_text at each index of a given testQuestion array
export function shuffleQuestion(givenList: testQuestion[]) {
    for (let i = givenList.length - 1; i > -1; i--) {
        for (let j = givenList[i].answer_id.length - 1; j > -1; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            // Swap the values at index j and index k
            [givenList[i].answer_id[j], givenList[i].answer_id[k]] = [givenList[i].answer_id[k], givenList[i].answer_id[j]];
            [givenList[i].answer_text[j], givenList[i].answer_text[k]] = [givenList[i].answer_text[k], givenList[i].answer_text[j]];
        }
    }
    return givenList;
}

//
export function seedShuffle(givenList: testQuestion[], seed: string) {

    console.log(`ENTERED THE SEED SHUFFLE WITH THIS SEED: ${seed}!`);
    const replaceString = JSON.parse(JSON.stringify(seed));
    // Strip the string of all non-integer characters. The below is Regex, the g flag means global, \D means all non-integers.
    const finalString = replaceString.replace(/\D/g, "");
    console.log(`FINISHED SETTING UP THE REPLACE STRING: ${finalString}`);
    const shuffleQuestions = new XORShift128(Number(finalString));

    for (let i = givenList.length - 1; i > -1; i--) {

        const originalId = givenList[i].answer_id;
        const originalText = givenList[i].answer_text;
        const originalCorrect = givenList[i].correct_answer;
        let indexList = [];
        for (let j = 0; j < givenList[0].answer_id.length; j++) {
            indexList[j] = j;
        }
        const shuffledIndex = indexList;
        shuffleQuestions.shuffle(shuffledIndex);



        for (let k = givenList[i].answer_id.length - 1; k > -1; k--) {
            const replaceIndex = shuffledIndex[k];
            console.log(k);
            // Swap the values at index j and index k
            [givenList[i].answer_id[k], givenList[i].answer_id[replaceIndex]] = [givenList[i].answer_id[replaceIndex], givenList[i].answer_id[k]];
            [givenList[i].answer_text[k], givenList[i].answer_text[replaceIndex]] = [givenList[i].answer_text[replaceIndex], givenList[i].answer_text[k]];

            // Make a const to check if the correct_answer field exists, if so swap
            const correctAnswer = givenList[i].correct_answer;
            if (correctAnswer) {
                [correctAnswer[k], correctAnswer[replaceIndex]] = [correctAnswer[replaceIndex], correctAnswer[k]]; 
            }      
        }
    }
}
/*
    for (let i = givenList.length - 1; i > - 1; i--) {
        shuffleQuestions.shuffle(givenList[i].answer_id);
        shuffleQuestions.shuffle(givenList[i].answer_text);
        // Use the nullish coalescing operator when there is no array for correct answers
        shuffleQuestions.shuffle(givenList[i].correct_answer ?? []);
    }
*/

// This function uses Sqid to encode the seed and use it for the shuffle
export function sqidSeed(seed: number[]) {
    const hash = new Sqids({
        minLength: 16,
    });
    console.log(`HERE IS THE SEED BEFORE ENCODING: ${seed}`);
    const hashedSeed = hash.encode(seed);
    // PURELY DEBUG
    console.log(`HERE IS THE ENCODED SEED: ${hashedSeed}`);
    console.log(`HERE IS THE DECODED SEED: ${hash.decode(hashedSeed)}`);
    return hashedSeed;
}