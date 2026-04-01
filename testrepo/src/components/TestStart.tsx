"use client";

import { 
  useState, 
  useEffect, 
  Dispatch, 
  SetStateAction,
} from "react";
import { TestQuestion } from "@/types/sharedInterface";
import { InfoData, RequestData } from "@/types/sharedType";
import { 
  errorType, 
  checkEmail, 
  checkName 
} from "@/utils/utilFunctions";
import { ActionKey, apiAction } from "@/utils/apiUtilFunctions";

//These variables will apply the styling for the regular and disabled buttons
const buttonDefaults = "mt-4 px-8 py-4 font-semibold text-sm text-white cursor-pointer disabled:pointer-events-none";
const regularButton = "bg-[#d1190d] hover:bg-[#700f09]";
const disabledButton = "bg-gray-500";

// This interface will be used to properly receive the two useState which are passed to the component
interface TestProps {
  initialTestInfo: InfoData;
  setInitialTestInfo: Dispatch<SetStateAction<InfoData>>;
  setCurrentDisplay: Dispatch<SetStateAction<string>>;
  setInitialQuestionsPromise: Dispatch<SetStateAction<Promise<TestQuestion[]> | undefined>>;
};

interface InputErrors {
  nameError: string;
  emailError: string;
};

// The parameters will be the testInfo useState alongside its setter function. Since I am using an interface, add a colon and assign it to testProps
export default function TestStart({
  initialTestInfo, 
  setInitialTestInfo,
  setCurrentDisplay,
  setInitialQuestionsPromise
} : TestProps) {

  // Here's a useState to ensure that the record is only created and stored AFTER the user presses the submit button
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Here's a useState to track user input errors
  const [InputErrors, setInputErrors] = useState<InputErrors>({
    nameError: '',
    emailError: ''
  });

  //Finally, useState for errors
  const [error, setError] = useState<Error | null>();

  // These two variables will be used to store the error messages (if any) returned from checking the user's email and name
  const emailTest = checkEmail(initialTestInfo.email);
  const nameTest = checkName(initialTestInfo.name);

  
  if (error) {
    console.log("AN ERROR OCCURED IN TESTSTART: ", error);
    throw error; // This "throws" it into the React render cycle so error.tsx sees it
  }

  // FOR DEBUG. This useEffect will track all current relevant info needed
  useEffect(() => {
      console.log("CURRENT TEST INFO: ", initialTestInfo);
      console.log(`USER INFO SUBMITTED?: ${isSubmitted}`);
  }, [initialTestInfo, isSubmitted]);

  // This useEffect will merely display a warning message if the user tries to refresh the page without submitting their info
  useEffect(() => {
    if (isSubmitted) {
      return;
    }
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isSubmitted]);

  //Function to handle the submission form itself, once the user presses the submit button
  async function handleSubmission(event: React.SubmitEvent) {
    // Default behavior of form submission, to send data and reload the page, is prevented here.
    event.preventDefault();
    console.log("BEFORE PROCEEDING WITH THE TEST, CHECK THE EMAIL AND NAME FIELDS.");

    if (emailTest || nameTest) {
      setInputErrors((prevData) => ({
        ...prevData,
        nameError : nameTest || '',
        emailError : emailTest || ''
      }));
      console.log("THERE WAS AN ERROR WITH THE PROVIDED FIELDS.");
      return;
    }
    else  {
      console.log("NO ERRORS IN THE USER INPUT, MOVE ONTO THE CREATION OF THE SCORE RECORD.");
    }

    try {
      const infoRecord: ActionKey = {
        action: 'createRecord',
        givenFields: initialTestInfo
      };
      //const fetchedInfo = await createRecord('createRecord', initialTestInfo);
      const fetchedInfo = await apiAction(infoRecord);
      // If the current result's ID in the database was successfully retrieved, set the value to resultId. Otherwise log an error.
      if (fetchedInfo) {
        console.log("HERE IS THE ID OF THE RESULTS AND ATTEMPT ID THAT WILL BE STORED WHEN SUBMITTED.");
        console.log(fetchedInfo);
        // This will set the result ID (index 0) and attempt ID (index 1) for the current test.
        setInitialTestInfo((prevData) => ({
          ...prevData,
          ['resultId']: fetchedInfo[0],
          ['attemptId']: fetchedInfo[1]
        }));
        console.log("Current resultId and attemptId fetched and set.");
        console.log("RECORD WAS CREATED!");
        console.log("PLEASE CHECK HERE FOR FINALIZED USER INFO BEFORE STARTING");
        console.log(initialTestInfo);

        //Make a default request for fetching the first questions
        let initialRequest: RequestData = {
          questionId: [0],
          pastId: [],
          questionCategory: "Beginner I",
          wasCorrect: [false]
        };
      
        // Fetch the initial set of questions from the backend, with 'retrieveStage' as the action to take
        console.log("ABOUT TO FETCH THE INITIAL STAGE!");
        //const fetchedQuestion = testUtils.questionFetch('retrieveStage', initialRequest) as Promise<TestQuestion[]>;
        const initialQuestionRecord: ActionKey = {
          action: 'retrieveStage',
          givenFields: initialRequest
        }
        const fetchedQuestion = apiAction(initialQuestionRecord) as Promise<TestQuestion[]>;
        console.log("FETCHED THE INITIAL STAGE!");
        console.log(`HERE IS THE RESULT OF THE FETCHED QUESTION: ${fetchedQuestion}`);
        setInitialQuestionsPromise(fetchedQuestion);
        setIsSubmitted(true);
        setCurrentDisplay('test');
      }
      else {
        console.log("Error creating the record.");
        throw new Error("The test could not be started as an error occured while making the record.");
      }
    }
    catch(error){
      console.log("ERROR WAS CAUGHT IN TESTSTART!");
      setError(errorType(error));
      console.log("ERROR WAS SET!");
    }
  }

  //Here the change in the user's input is tracked and handled.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This line refers to the name and value fields of an HTML input tag, and uses object destructuring to assign them values from
    // event.target, which itself refers to the HTML element that triggered the event in the first place.
    const {name, value} = event.target;
    //Set the test info based off of the previous data, if there are any changes.
    setInitialTestInfo((prevData) => ({
        ...prevData,
        [name] : value
    }));
  };
    
  //HTML return for the test start
  return (
    <div className="sm:px-12 flex flex-col min-h-screen items-center justify-center gap-6">
      <h1 className = "text-2xl sm:text-3xl font-semibold text-black text-center">Japanese Placement Test</h1>
        <form 
          id = "userInfo" 
          name = "userInfo" 
          onSubmit = {handleSubmission} 
          className = "flex flex-col space-y-2 items-center"
        >
          <label htmlFor = "namefield" className = "mt-2">Full Name</label>
          <input 
            type = "text" 
            name = "name" 
            id = "namefield" 
            placeholder = "Enter your full name." 
            className = "mt-2 shadow-md border-2 border-gray-300 rounded-sm p-1" 
            onChange = {handleChange} 
            required
          />
          { // Display any errors for the name check here
            nameTest && (
              <p className = "text-xs text-red-500 font-semibold">{InputErrors.nameError}</p>
            )
          }
          <label htmlFor = "emailfield" className = "mt-2">Email</label>
          <input 
            type = "text" 
            name = "email" 
            id = "emailfield" 
            placeholder = "Enter your email address." 
            className = "mt-2 shadow-md border-2 border-gray-300 rounded-sm p-1" 
            onChange = {handleChange} 
            required
          />
          { // Display any errors for the email check here
            emailTest && (
              <p className = "text-xs text-red-500 font-semibold">{InputErrors.emailError}</p>
            )
          }
        </form>
        <div className = "text-xs text-gray-500 p-2 bg-gray-100 rounded-lg text-center justify-center">
          <p className = "font-semibold">Important! For record-keeping purposes, please ensure that your name and email address are correct!</p>
        </div>
        <div className = "flex items-center justify-center">
          <button 
            type = "submit" 
            form = "userInfo" 
            name = "submitButton" 
            className = {` 
              ${buttonDefaults}
              // If the user has not input an email or a name, use the disabled style. Otherwise use regular.
              ${!initialTestInfo.email || !initialTestInfo.name ? (disabledButton) : (regularButton)}
            `}
            disabled = { // If it is not the last question, or if the user has not typed in an email or name
              !initialTestInfo.email || !initialTestInfo.name
            }
          >
            Begin the Test
          </button>
        </div>
    </div>
  );
  }