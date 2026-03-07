// The getURL function will check if an environmental variable named VERCEL_URL exists. If it does,
// return the address prefixed by https://. Otherwise, return the value of the FRONTEND_URL
// environmental variable, or the default localhost at port 5000, or whichever port is specified in Flask.
export function getURL() {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return `${process.env.FRONTEND_URL}` || "http://localhost:5000";
}

// This function will check if the email provided meets the bare minimum requirements. That being that it is under
// a certain length, and that there is a @ and a . included in the email string.
export function checkEmail(email: string) {
    const lengthLimit = 254;
    // const emailRegex = RegExp('^[A-Za-z0-9._+-]+@[A-Za-z0-9._]+\.[A-Za-z]{2,}$');
    const laxRegex = RegExp('^[\S]+@[\S]+\.[\S]+$');
    // Check if the email length is above 254 characters and return the message below if it is.
    if (email.length > lengthLimit) {
        console.log("EMAIL LENGTH ERROR.")
        return "Email length cannot be more than 254 characters."
    }
    // Test if the email passes the test for the given regex. Swap out the regex if a different one is required.
    if (laxRegex.test(email) === false) {
        console.log("EMAIL FORMAT ERROR.")
        return "Please ensure that the email address format is correct."
    }
}

// This function will check if the name provided is shorter than the character limit. If not, return an error.
export function checkName(name: string) {
    const lengthLimit = 254;
    if (name.length > lengthLimit) {
        console.log("NAME LENGTH ERROR.")
        return "Name length cannot be more than 254 characters."
    } 
}