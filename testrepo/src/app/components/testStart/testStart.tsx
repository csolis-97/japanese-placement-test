"use client";

import * as infoUtils from "./startActions";
import { useState, useEffect, useRef } from "react";
import { Dispatch, SetStateAction } from "react";

//These variables will apply the styling for the regular and disabled buttons
const buttonStyle = "mt-4 px-8 py-4 font-semibold text-sm text-white position:sticky top:0";
const regularButton = "bg-[#d1190d] hover:bg-[#700f09]";
const disabledButton = "bg-gray-500";

// This interface will be used to properly receive the two useState which are passed to the component
interface testProps {
  initialTestInfo: infoUtils.infoData;
  setInitialTestInfo: Dispatch<SetStateAction<infoUtils.infoData>>;
  currentDisplay: string;
  setCurrentDisplay: Dispatch<SetStateAction<string>>;
}

// The parameters will be the testInfo useState alongside its setter function. Since I am using an interface, add a colon and assign it to testProps
export default function TestStart({initialTestInfo, setInitialTestInfo, currentDisplay, setCurrentDisplay} : testProps) {

  //Here's a useState to ensure that the record is only created and stored AFTER the user presses the submit button
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // FOR DEBUG. This useEffect will track all current relevant info needed
  useEffect(() => {
      console.log("CURRENT TEST INFO")
      console.log(initialTestInfo)
      console.log("CURRENT DISPLAY VALUE?")
      console.log(currentDisplay)
      console.log("USER INFO SUBMITTED?")
      console.log(isSubmitted)
  }, [initialTestInfo, isSubmitted])

  //Function to handle the submission form itself, once the user presses the submit button
  async function handleSubmission(event: React.FormEvent) {
    // Default behavior of form submission, to send data and reload the page, is prevented here.
    event.preventDefault();
    console.log("BEFORE PROCEEDING WITH THE TEST");
    const getRecord = async () => {
    const fetchedInfo = await infoUtils.createRecord('createRecord', initialTestInfo);
    // If the current result's ID in the database was successfully retrieved, set the value to resultId. Otherwise log an error.
    if (fetchedInfo) {
        console.log("HERE IS THE ID OF THE RESULTS AND ATTEMPT ID THAT WILL BE STORED WHEN SUBMITTED");
        console.log(fetchedInfo);

        //This will set the result ID (index 0) and attempt ID (index 1) for the current test.
        setInitialTestInfo((prevData) => ({
        ...prevData,
        ['resultId']: fetchedInfo[0],
        ['userAttempt']: fetchedInfo[1]
        }))
        console.log("Current resultId and userAttempt fetched and set.");
    }
    else {
        console.log("Error creating the record.")
    }
  }
  // Call the function to fetch the resultId to be used
  getRecord();
  // Here, the test data will be fetched from the database
  // If the data is successfully retrieved, log the data, assign it to questionsData, then set the testFormat useState
      // use a useEffect to fetch the ID to be used for the scores alongside the attempt number for the user when 
  // the component mounts

  //if (initialTestInfo.resultId !== 0 || initialTestInfo.userAttempt !== 0) {
    console.log("RECORD WAS CREATED!")
    console.log("PLEASE CHECK HERE FOR FINALIZED USER INFO BEFORE STARTING")
    console.log(initialTestInfo)
    setCurrentDisplay('test')
    if (initialTestInfo.userAttempt !== 0 && initialTestInfo.resultId !== 0) {
      setIsSubmitted(true)
      const currentAttempt = initialTestInfo.userAttempt
      console.log("ABOUT TO ENTER THE TEST WITH THIS ATTEMPT NUMBER!")
      console.log(currentAttempt)
      //
    }
    // If there is an error, set the error useState and log to console.
    else {
      //setError(answerArray);
      console.log("An error occured while attempting to start the test.");
    }
  }

    //Here the change in the user's input is tracked and handled.
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // This line refers to the name and value fields of an HTML input tag, and uses object destructuring to assign them values from
      // event.target, which itself refers to the HTML element that triggered the event in the first place.
      const {name, value} = event.target;
      /* the set UseState function is called with an updater function that uses prevData as its argument. An updater function is used
      in order to update the data of an object and then set the new object as the state of testFormat. For this reason, prevData ensures 
      that it  receives the most updated information and that if there are other fields that won't be updated within the function, the 
      information is passed on and not lost.
        /*...prevData is a copy of the current useState and its values. The next line replaces the current value with the value
        that was assigned from event.target based on the name that was also assigned. Since the name field is assigned dynamically,
        if you wanted to replace more than one field, you would have to hardcode the keys, but you can still dynamically assign new
        values. If there are other fields that you do not wish to replace, however, remember to use ...prevData to carry them over*/

      //Set the test info based off of the previous data, if there are any changes.
      setInitialTestInfo((prevData) => ({
          ...prevData,
          [name] : value
      }))
    }
    
  //HTML return for the test start
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-6">
      <h1 className = "text-3xl font-semibold leading-10 text-black dark:text-zinc-50">Japanese Placement Test</h1>
        <form id = "userInfo" name = "userInfo" onSubmit = {handleSubmission} className = "flex flex-col space-y-2 items-center justify-center">
            <label htmlFor = "namefield" className = "mt-2">Full Name</label>
            <input type = "text" name = "name" id = "namefield" placeholder = "Enter your full name." className = "mt-2 shadow-md border-2 border-gray-300 rounded-sm p-1" onChange = {handleChange} required/>
            <label htmlFor = "emailfield" className = "mt-2">Email</label>
            <input type = "text" name = "email" id = "emailfield" placeholder = "Enter your email address." className = "mt-2 shadow-md border-2 border-gray-300 rounded-sm p-1" onChange = {handleChange} required/>
        {
            /* Below I used shorthand for an if-else statement in Typescript. It first has the condition, then it uses "?" to check if
            it is true or not. If it is true, run the code in the first set of paranthesis. If not, it will go to the ":" and run
            the code in the second set of paranthesis. Additional conditions require another condition followed by "?" and "()".
            For the Submit and Next buttons below, the CSS styling is determined by the result of the if statement.
            */
        }
        </form>
        <div className = "text-xs text-gray-500 p-2 bg-gray-100 rounded-lg text-center justify-center">
          <p className = "font-semibold">Important! For record-keeping purposes, please ensure that your name and email address are correct!</p>
        </div>
        <div className = "flex items-center justify-center">
            <button type = "submit" form = "userInfo" name = "submitButton" className = {` ${buttonStyle}
            // If the user has not input an email or a name, use the disabled style. Otherwise use regular.
             ${!initialTestInfo.email || !initialTestInfo.name ? (disabledButton) : (regularButton)}`}
            disabled = { // If it is not the last question, or if the user has not typed in an email or name
            !initialTestInfo.email || !initialTestInfo.name}>Begin the Test</button>
        </div>
    </div>
  );
  }