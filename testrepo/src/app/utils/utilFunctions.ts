import { testQuestion } from "@/app/components/TestDisplay";
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

// This function will shuffle the answer_id and answer_text (and correct_answer if it exists) (using the seedRNG that was also passed)
// of the testQuestion array provided as the argument, and return it.

export function shuffleList(givenList: testQuestion[], seedRNG: XORShift128) {
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

//
export function seedShuffle(givenList: testQuestion[], seedRNG: XORShift128) {

    console.log(`ENTERED THE SEED SHUFFLE WITH THIS SEED: ${seedRNG}!`);
    for (let i = givenList.length - 1; i > -1; i--) {

        const originalId = givenList[i].answer_id;
        const originalText = givenList[i].answer_text;
        const originalCorrect = givenList[i].correct_answer;
        let indexList = [];
        for (let j = 0; j < givenList[0].answer_id.length; j++) {
            indexList[j] = j;
        }
        const shuffledIndex = JSON.parse(JSON.stringify(indexList));
        seedRNG.shuffle(shuffledIndex);



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

//This little function will calculate the correct answers for the stage
export async function calculateCorrect(gradedAnswers:  boolean[], stageSize: number) {
    const correctCount = gradedAnswers.slice(-stageSize).filter(Boolean).length;
    console.log("HERE IS CORRECT COUNT!");
    console.log(correctCount);
    return correctCount;
  }