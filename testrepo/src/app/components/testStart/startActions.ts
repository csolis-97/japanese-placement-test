"use server";

const getURL = () => {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return `https://${process.env.FRONTEND_URL}`;
}

//Define a type that will be used to store and send necessary background info for the current test.
export type infoData = {
    resultId: number;
    userAttempt: number;
    email: string;
    name: string;
}

export async function createRecord(action: string, givenFields: infoData) {
    // This action will create the record that will be used to store the results and return the resultId to be used
    const resultId = givenFields.resultId;
    const userAttempt = givenFields.userAttempt;
    const email = givenFields.email;
    const name = givenFields.name;

    console.log("HERE ARE THE VALUES TO BE SENT TO THE BACKEND TO CREATE THE RECORD")
    console.log(resultId)
    console.log(userAttempt)
    console.log(email)
    console.log(name)

    // Create a snapshot of the submission time to send alongside the POST request
    let submittedTime = new Date();
    console.log("HERE IS THE SUBMISSION TIMESTAP")
    console.log(submittedTime)

    action = "createRecord"
    console.log("CREATE A RECORD IN THE SCORES DATABASE ALONGSIDE FETCHING CURRENT ATTEMPT ID");
    try {
        console.log("Attempting to create the score record and fetch the proper info...")
        const response = await fetch(`${getURL()}/api/flask/testform`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({'action' : action, 'score_id' : resultId, 'user_attempt' : userAttempt,
                'email' : email, 'name' : name, 'submit_time' : submittedTime})
        });

        const data = await response.json();
        console.log("Here is the response from the database after requesting the current result ID and attempt ID:");
        console.log(data);
        return data;
    }
    catch(error) {
        console.log(error);
        console.log("Internal Server Error: Record could not be created. Result ID and attempt ID could not be fetched.")
    }
}