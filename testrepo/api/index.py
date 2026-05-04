from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
import pymysql
import os
import datetime

# Look into Flask-APScheduler for scheduling jobs. Note that two of these schedulers will be launched if Flask is in debug mode
# so set it to false if needed.

# Import all the functions defined elsewhere in the backend. Remove the dot when running locally.
from .test_info_functions import *
from .question_retrieval_fuctions import *
from .answer_storage_functions import *
from .test_submission_functions import *
from .test_results_functions import *
from .util_functions import *

# Import all the functions defined elsewhere in the backend. Remove the dot when running locally.
#from test_info_functions import *
#from question_retrieval_fuctions import *
#from answer_storage_functions import *
#from test_submission_functions import *
#from test_results_functions import *
#from util_functions import *

app = Flask(__name__)

try:
    if os.getenv('VERCEL_URL'):
        frontURL = os.getenv('VERCEL_URL')
    else:
        frontURL = os.getenv('FRONTEND_URL')

    # Enables CORS for the app so that it can accept requests from the frontend running on localhost:3000
    CORS(app, resources={r"/*" : {"origins" : frontURL}})

    # Load the environment variables from the .env file, which will then be used to configure the database connection
    load_dotenv()

    # Get the path for the CA certificate so that SSL can be used to connect to the database.
    caPath = os.path.join(os.path.dirname(__file__), "ca.pem")

    # This function when called will return a connection to the TiDB Cloud database using the environmental variables provided
    def getDB():
        print("ABOUT TO RETURN THE DATABASE CONNECTION!")
        return (pymysql.connect(
            host = os.getenv('TIDB_HOST'),
            port = int(os.getenv('TIDB_PORT')),
            user = os.getenv('TIDB_USER'),
            password = os.getenv('TIDB_PASSWORD'),
            database = os.getenv('TIDB_DATABASE'),
            ssl_verify_cert = os.getenv('TIDB_SSL_VERIFY_CERT'),
            ssl_verify_identity = os.getenv('TIDB_SSL_VERIFY_IDENTITY'),
            ssl_ca = caPath,
            cursorclass = pymysql.cursors.DictCursor,
            # Use this to set the timezone of the current session's connection to the database
            init_command = "SET SESSION time_zone = '+00:00'"
        ))

    # Included a local function for the database connection as well. Use Port 3306 for mySQL
    '''def getDBLocal():
        print("ABOUT TO RETURN LOCAL DATABASE CONNECTION!")
        return (pymysql.connect(
            host = os.getenv('DB_HOST'),
            port = int(os.getenv('DB_PORT')),
            user = os.getenv('DB_USER'),
            password = os.getenv('DB_PASSWORD'),
            database = os.getenv('DB_NAME'),
            cursorclass = pymysql.cursors.DictCursor,
            # Use this to set the timezone of the current session's connection to the database
            init_command = "SET SESSION time_zone = '+00:00'"
        ))'''

# If there were any errors during the initial setup, go here
except Exception as e:
    print(f"Crashed while setting up the Flask application and database connection: {e}")

####//// Route for the home ////####
@app.route('/api', methods=['GET', 'POST'])
def home():
    print("CAN YOU SEE THIS? BACKEND IS RUNNING!")
    return jsonify("Backend is running!"), 200

####//// Route for the test form ////####
@app.route('/api/testform', methods=['GET', 'POST'])
def testForm():
    data = request.json
    if not data:
        dataError = "Backend error: No data provided for the testform route!"
        return jsonify(dataError), 400
    mysql = getDB()
    # mysql = getDBLocal()

    # Test print to see data
    print("HERE IS WHAT IS IN THE DATA!")
    print(data)

    # Parameters to be used regardless of action type
    action = data['action']

    # This will be used to track the parameters passed to the SQL query, if any are needed
    paramList = []

    with mysql.cursor() as cursor:
        # If the action is createRecord, create a record for the results, and send the attempt_id and score_id back
        if action == 'createRecord':
            try:
                initialAttempt = data['attempt_id']
                initialScoreId = data['score_id']
                email = data['email']
                name = data['name']
                submitTime = data['start_time']

                paramList = []

                print(f"HERE IS THE INITIAL ATTEMPT NUMBER: {initialAttempt}")
                print(f"HERE IS THE INITIAL SCORE ID: {initialScoreId}")
                print(f"HERE IS THE USER'S EMAIL: {email}")
                print(f"HERE IS THE USER'S NAME: {name}")

                # DEBUG CHECK SUBMIT TIME VALUE
                print("SUBMIT TIME")
                print(submitTime)
                # Here, the string will be stripped of the T for Time, Z for the UTC offset, using datetime and fromisoformat
                # tempTime = datetime.fromisoformat(submitTime)
                serverTime = datetime.now(timezone.utc)
                # finalTime = str(tempTime)
                finalTime = str(serverTime)
                # DEBUG CHECK FINAL TIME VALUE
                print("FINAL TIME")
                print(finalTime)

                # First, create a new record in the database for the current user, assuming that a user with the same email does not already exist. 
                # If it does, skip to the next step.
                userId = checkEmail(cursor, mysql, email, name, finalTime)

                # Now, create a score record in the database if scoreId was equal or less than 0, so that the answers can be inserted here in 
                # the future.
                scoreId = createScoreRecord(cursor, mysql, initialScoreId, userId, finalTime)

                # Next, get the current attempt number for the user.
                if initialAttempt == 0:
                    attemptNum = getAttemptNum(cursor, initialAttempt, userId)
                else :
                    attemptNum = initialAttempt
                print(f"The current attempt id to be used is {attemptNum}")
                print(f"The current result id is {scoreId}")

                # Now put the score_id and attempt_id into a list and return the values
                testInfo = [scoreId, attemptNum]
                print("Before the return")
                return jsonify(testInfo), 200
            
            # The except statement will call a function that handles errors and returns JSON
            except Exception as error:
                print("An error occured, see below for more details.")
                return handleErrors(error)


        # If the action is retrieveStage, retrieve the questions for the next stage and all of the associated info
        elif action == 'retrieveStage' :
            try:
                # Set the data from the JSON request
                questionCategory = data['question_category']
                questionId = data['question_id']
                wasCorrect = data['was_correct']                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
                questionTrack = data['past_id']

                print("CURRENT QUESTION LEVEL")
                print(questionCategory)
                print("DID USER GET THEM RIGHT?")
                print(wasCorrect)
                print("LIST OF QUESTION IDS THAT WERE ALREADY USED")
                print(questionTrack)

                # Determine the difficulty level of the next question based on the user's answer
                questionCategory = difficultyLevel(wasCorrect, questionCategory)

                # Fetch the next question based on the current level, alongside avoiding all previously used question_ids
                newQuestion = fetchNewQuestion(questionCategory, questionTrack, cursor, mysql)

                # DEBUG PRINT THE RESULT OF FETCHING FROM THE DATABASE
                print("BEFORE THE FOR LOOP!")
                print(newQuestion)

                # Create the key and fields that will be used to map the data into a dictionary and then convert that to one list
                questionKey = 'question_id'
                singleFields = ['question_id', 'question_text', 'question_text_furigana', 'question_body', 'question_body_furigana', 'question_level', 'question_audio']
                nestedFields = ['answer_id', 'answer_text', 'answer_text_furigana']

                # Map the question and answer data to one single list with this function and return results to newQuestion
                newQuestion = mapAnswerstoQuestion(newQuestion, questionKey, singleFields, nestedFields)

                print("Before the return")
                return jsonify(newQuestion), 200

            # The except statement will call a function that handles errors and returns JSON
            except Exception as error:
                print("An error occured, see below for more details.")
                return handleErrors(error)


        # Else if the action is "sendStage" then get the JSON data info, check if the answer was correct, and store
        # The user's response in the database before returning the checked answer.
        elif action == 'sendStage':
            try: 
                # isCorrect will store a boolean value of either True or False, depending on whether the answer the user gave 
                # was correct or not. answerId only stores the integer of each question checked after the value is retrieved from the
                # database.
                isCorrect = []
                answerId = []

                # Store the user's answer data that was retrieved and get the current attemptNum from the database
                questionId = data['question_id']
                answerData = data['user_answer_text']
                attemptNum = data['attempt_id']
                questionTrack = data['past_id']
                scoreId = data['score_id']
                currentStageNum = data['current_stage_num']

                # ALL OF THE BELOW IS DEBUG TO CHECK THE VALUES
                print(data)
                print("ATTEMPT NUMBER!")
                print(attemptNum)
                print("RESULT ID!")
                print(scoreId)
                print("ANSWER DATA")
                print(answerData)

                # First, check for any questions that were not answered an assign them the value "not answered"
                answerData = checkNoAnswer(answerData)
                # Enter a function to get the correct answer info based on the question_id of the questions answered
                results = getCorrectAnswerInfo(cursor, answerData, questionId, answerId, currentStageNum)
                # Check which of the users answers were correct and store that information in isCorrect
                isCorrect = gradeAnswers(results, questionId)
                # Submit the answers to the database
                submitAnswers(isCorrect, answerData, scoreId, attemptNum, questionId, questionTrack, currentStageNum, cursor, mysql)

                return jsonify(isCorrect), 200
            
            # The except statement will call a function that handles errors and returns JSON
            except Exception as error:
                print("An error occured, see below for more details.")
                return handleErrors(error)


        # If the action is submitTest, check the user's answers, score the test, then finally update the record given the correct score_id
        elif action == 'submitTest':
            try:
                # Store the data retrieved from the JSON into separate variables
                scoreId = data['score_id']
                attemptNum = data['attempt_id']
                isCorrect = data['was_correct']
                stageDifficultyArray = data ['stage_difficulty_array']
                questionTrack = data['past_id']
                urlId = data['url_id']
                paramList = []
                # Fetch the submission date and time from the data and convert it into a string, since the format must be changed
                submitTime = data['date']

                # DEBUG CHECK THE VALUES IN ANSWERLIST
                print("ANSWER LIST")
                print(isCorrect)
                print("QUESTION TRACK")
                print(questionTrack)
                print(f"SCORE ID IS: {scoreId}!")
                print(f"ATTEMPT NUMBER IS: {attemptNum}!")
                print(f"THE CURRENT URLID: {urlId}")

                # First, check that the urlId is a unique value that is currently not in the database. If it is, reassign it
                checkUUID(urlId, cursor)
                
                # Now begin by getting the levels for all questions that were answered
                levelList = questionLevelQuery(scoreId, attemptNum, questionTrack, cursor)

                # Using the submitTime, a function called calculateScore will return the necessary paramList for updating the current score ID
                paramList = []
                print("PARAM LIST BEFORE THE CALL!!")
                print(paramList)

                # Check if the submission time was suspicious or not. If it was, flag it
                timeCheck(submitTime, scoreId, cursor, mysql)
                # Use the data retrieved from the database query, questions answered and their results to calculate the score. The total score 
                # and the percentage correct for each stage will be returned to the two variables.
                totalScore = calculateScore(levelList, questionTrack, isCorrect)
                # Unused for now, get the current user's info
                getUserInfo(scoreId, attemptNum, cursor)
                # Finally, use all the relevant info to submit the test
                submitTest(stageDifficultyArray, submitTime, totalScore, urlId, scoreId, cursor, mysql)

                return jsonify("Test submitted!"), 201
            
            # The except statement will call a function that handles errors and returns JSON
            except Exception as error:
                print("An error occured, see below for more details.")
                return handleErrors(error)
        

        # A default case just in case
        else:
            return jsonify("No proper action was specified in the results page!"), 400


####//// Route for the results ////####
@app.route('/api/results', methods=['GET', 'POST'])
def resultDisplay():
    # Get the data from the request and make the MySQL cursor and declare variables that will be used across all actions
    data = request.json
    if not data:
        dataError = "Backend error: No data provided for the results route!"
        return jsonify(dataError), 400
    
    mysql = getDB()
    # mysql = getDBLocal()

    action = data['action']

    with mysql.cursor() as cursor:
        # If the action is "retrieveResults", fetch the correct result record from the database based on the current user's url_id.
        if action == 'retrieveResults':
            try: 
                urlId = data['url_id']
                print(f"THE CURRENT URLID: {urlId}")
                paramList = [urlId]

                # Query the database for the proper test record using the provided urlId
                resultData = retrieveTestRecord(paramList, cursor, mysql)

                # DEBUG Check the final version with the updated date
                print("FINAL RESULTS DATA")
                print(resultData)

                print("Before the return")
                return jsonify(resultData), 200
            
            # The except statement will call a function that handles errors and returns JSON
            except Exception as error:
                print("An error occured, see below for more details.")
                return handleErrors(error)

        # Else if the action is "retrieveAnswers", fetch the correct question, answer, and user response info based on provided attempt_id and user_id
        elif action == 'retrieveAnswers':
            try:
                # First, get the proper result data by using the attempt_id in the data
                attemptId = data['attempt_id']
                scoreId = data['score_id']
                print("ATTEMPTID FOR CURRENT RETRIEVAL")
                print(attemptId)
                paramList = [scoreId]

                # Get the test answer data based on the provided scoreId in the paramList
                answerData = retrieveTestAnswers(paramList, cursor, mysql)

                # DEBUG PRINT THE RESULT OF FETCHING FROM THE DATABASE
                print("BEFORE THE FOR LOOP!")
                # print(answerData)

                # Create the necessary fields to be passed to the function so that the answers can be properly mapped to each question
                questionKey = 'question_id'
                singleFields = ['question_id', 'question_text', 'question_text_furigana', 'question_body', 'question_body_furigana', 'question_level', 'question_audio', 'user_answer_text', 'user_was_correct', 'response_order']
                nestedFields = ['answer_id', 'answer_text', 'answer_text_furigana', 'correct_answer']
                answerData = mapAnswerstoQuestion(answerData, questionKey, singleFields, nestedFields)

                # Return the retrieved answers
                print("Before the return")
                return jsonify(answerData), 200
            
            # The except statement will call a function that handles errors and returns JSON
            except Exception as error:
                print("An error occured, see below for more details.")
                return handleErrors(error)
        

        # A default case just in case
        else:
            return jsonify("No proper action was specified in the results page!"), 400
    

# Once the app is running, it will use the port 5000 and communicate to the localhost. It will also be in debug mode
# After the app is out of development, not needed in production
# if __name__ == '__main__':
#   app.run(debug=True, host="localhost", port=int("5000"))
