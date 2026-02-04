from flask import Flask, jsonify, request, session, redirect, url_for, render_template, make_response
#from flask_mysql import MySQL
from flaskext.mysql import MySQL
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb.cursors
import os

# Import all the functions defined elsewhere in the backend
from test_data_functions import *
from question_retrieval_fuctions import *
from answer_storage_functions import *
from test_submission_functions import *

app = Flask(__name__)

# Enables CORS for the app so that it can accept requests from the frontend running on localhost:3000
CORS(app, resources={r"/*" : {"origins" : "http://localhost:3000"}})

# Load the environment variables from the .env file, which will then be used to configure the database connection
load_dotenv()
app.secret_key = 'your_secret_key'

# The syntax when using flaskext.mysql is slightly different
app.config['MYSQL_DATABASE_HOST'] = os.getenv('DB_HOST')
app.config['MYSQL_DATABASE_USER'] = os.getenv('DB_USER')
app.config['MYSQL_DATABASE_PASSWORD'] = os.getenv('DB_PASSWORD')
app.config['MYSQL_DATABASE_DB'] = os.getenv('DB_NAME')

"""Use this if importing from flask_mysql
app.config['MYSQL_HOST'] = os.getenv('DB_HOST')
app.config['MYSQL_USER'] = os.getenv('DB_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('DB_NAME')
"""

# Initialize MySQL for database access and Bcrypt for password hashing
mysql = MySQL(app)
bcrypt = Bcrypt(app)

####//// Route for the test form ////####
@app.route('/testform', methods=['GET', 'POST'])
def testForm():
    data = request.json
    cursor = mysql.get_db().cursor(MySQLdb.cursors.DictCursor)
    # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
    # cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    # Test print to see data
    print("HERE IS WHAT IS IN THE DATA!")
    print(data)

    # Parameters to be used regardless of action type
    action = data['action']

    # This will be used to track the parameters passed to the SQL query, if any are needed
    paramList = []

    ### SECTION FOR RETRIEVING TEST QUESTION DATA ###

    # If the action is getAttemptNumber, get the user's current attempt number and return it
    if action == 'getAttemptNumber' :
        initialNum = data['user_attempt']
        attemptNum = getAttemptNum(cursor, initialNum)
        print("Before the return")
        return jsonify(attemptNum)


    # If the action is getResultNumber, get the ID for the current score data
    elif action == 'getResultNumber' :
        print("RETRIEVING THE RESULT ID!")
        initialId = data['score_id']
        # Now, create a score record in the database if scoreId was equal or less than 0, so that the answers can be inserted here in 
        # the future.
        print("ENTER THE IF STATEMENT")
        if initialId == 0:
            ##### FOR NOW USE USER_ID OF 1, I JUST PUT A RANDOM PLACEHOLDER FOR THE TIMEBEING
            recordQuery = "INSERT INTO scores(user_id, total_score, entrance_level, test_date) VALUES (1, 0, 'Beginner I', '2000-01-01 12:00:00');"
            cursor.execute(recordQuery)
            print("EXECUTED!")
            # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
            # mysql.connection.commit()
            # Commit the change so that it appears in the database
            print("COMMITED!")
            commitChange = mysql.get_db()
            commitChange.commit()
            # This will be used when inserting values into the user_answer table. It takes the id value inserted for the auto_incremented
            # score_id column and returns it
            scoreId = cursor.lastrowid
            print("SUCCESSFULLY CREATE THE SCORE RECORD!")
        else:
            scoreId = data['score_id']
        print(f"The record ID to be used is {scoreId}!")
        print("Before the return")
        return jsonify(scoreId)


    # If the action is retrieveStage, retrieve a new question and all of its info based on specific conditions
    elif action == 'retrieveStage' :
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
        newQuestion = fetchNewQuestion(cursor, questionCategory, questionTrack)

        # Once a suitable question has been found, close the cursor
        cursor.close()
        # DEBUG PRINT THE RESULT OF FETCHING FROM THE DATABASE
        print("BEFORE THE FOR LOOP!")
        print(newQuestion)

        # Create the key and fields that will be used to map the data into a dictionary and then convert that to one list
        questionKey = 'question_id'
        singleFields = ['question_id', 'question_text', 'question_body', 'question_level']
        nestedFields = ['answer_id', 'answer_text']

        # Map the question and answer data to one single list with this function and return results to newQuestion
        newQuestion = mapAnswerstoQuestion(newQuestion, questionKey, singleFields, nestedFields)

        print("Before the return")
        return jsonify(newQuestion)
        # Add return statuses if needed


    ### SECTION FOR RECEIVING USER ANSWERS, CHECKING THEM, AND STORING THEM ###
    # Else if the action is "sendStage" then get the JSON data info, check if the answer was correct, and store
    # The user's response in the database before returning the checked answer.
    elif action == 'sendStage':
        # isCorrect will store a boolean value of either True or False, depending on whether the answer the user gave 
        # was correct or not. answerId only stores the integer of each question checked after the value is retrieved from the
        # database.
        isCorrect = []
        answerId = []

        # Store the user's answer data that was retrieved and get the current attemptNum from the database
        questionId = data['question_id']
        answerData = data['user_answer_text']
        attemptNum = data['user_attempt']
        questionTrack = data['past_id']
        scoreId = data['score_id']

        # ALL OF THE BELOW IS DEBUG TO CHECK THE VALUES
        print(data)
        print("ATTEMPT NUMBER!")
        print(attemptNum)
        print("RESULT ID!")
        print(scoreId)
        print("ANSWER DATA")
        print(answerData)

        # Enter a function to get the correct answer info based on the question_id of the questions answered
        results = getCorrectAnswerInfo(cursor, answerData, questionId, answerId)

        # Check which of the users answers were correct and store that information in isCorrect
        isCorrect = gradeAnswers(results, questionId)

        # Check if the user actually had any answers. If not, skip to the else statement without interacting with the database.
        if len(isCorrect) > 0:
            # Assign valueQuery to the returned array
            valueQuery = buildValueQuery(answerData)
            # Then assign paramList to the array that was built in the function
            paramList = buildAnswerData(answerData, scoreId, attemptNum, questionId, isCorrect, questionTrack)

            # Build the query using valueQuery, with paramList as its values
            storeQuery = f"INSERT INTO user_answers(score_id, attempt_id, question_id, response_order, user_answer_text, user_was_correct) VALUES {" ".join(valueQuery)}"

            cursor.execute(storeQuery, tuple(paramList))
            # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
            # mysql.connection.commit()
            # Commit the change so that it appears in the database
            commitChange = mysql.get_db()
            commitChange.commit()
            print("SUCCESSFULLY STORED THE ANSWERS!")
        else:
            print("USER SUBMITTED NO ANSWERS, SO THERE IS NOTHING TO STORE.")

        # Finally, close the cursor and return the data
        cursor.close()
        return jsonify(isCorrect)


    # If the action is submitTest, check the user's answers, score the test, then finally update the record given the correct score_id
    elif action == 'submitTest':
        # Store the data retrieved from the JSON into separate variables
        scoreId = data['score_id']
        attemptNum = data['user_attempt']
        isCorrect = data['was_correct']
        stageArray = data ['stage_array']
        questionTrack = data['past_id']
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
        
        paramList = [scoreId, attemptNum]

        # Make a query to get all the question levels for each question the user answered based on the questionTrack and the score_id
        # Small note because I didn't know about using the map function here until I looked it up. In order to join a list with non integer
        # values, you can merely do a join. However, if there are integers you must map them to a string first.
        levelQuery = "SELECT DISTINCT Q.question_id, Q.question_level, U.user_was_correct, U.response_order FROM questions Q, scores S, " \
        "user_answers U WHERE S.score_id = U.score_id AND Q.question_id = U.question_id AND S.score_id = %s AND U.attempt_id = %s " \
        f"AND Q.question_id IN ({", ".join(map(str, questionTrack))}) ORDER BY U.response_order"
        cursor.execute(levelQuery, tuple(paramList))
        levelList = cursor.fetchall()

        # Using the submitTime, a function called calculateScore will return the necessary paramList for updating the current score ID
        paramList = []
        print("PARAM LIST BEFORE THE CALL!!")
        print(paramList)

        # Use the data retrieved from the database query, questions answered and their results to calculate the score. The total score 
        # and the percentage correct for each stage will be returned to the two variables.
        totalScore, levelPercent = calculateScore(levelList, questionTrack, isCorrect)

        # Using the percentage correct for each stage alongside the level of difficulty for each stage, decide placement
        entranceLevel = decidePlacement(levelPercent, stageArray)

        # Use the submission time, the total score, and the entrance level to finalize the params
        paramList = finalizeSubmitParams(submitTime, totalScore, entranceLevel)
        paramList.append(scoreId)
        
        # Now, the correct record will be updated with the results in the database
        ##### FOR NOW USE USER_ID OF 1, I JUST PUT A RANDOM PLACEHOLDER FOR THE TIMEBEING

        scoreQuery = "UPDATE scores SET total_score = %s, entrance_level = %s, test_date = %s WHERE user_id = 1 AND score_id = %s"

        cursor.execute(scoreQuery, tuple(paramList))
        # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
        # mysql.connection.commit()
        # Commit the change so that it appears in the database
        commitChange = mysql.get_db()
        commitChange.commit()
        print("SUCCESSFULLY STORED THE SCORES!")
        # Finally, close the cursor
        cursor.close()
        return jsonify("Test submitted!")
    

    # A default case just in case
    else:
        return jsonify("No proper action was specified in the results page!")


####//// Route for the results ////####
@app.route('/results', methods=['GET', 'POST'])
def resultDisplay():
    # Get the data from the request and make the MySQL cursor and declare variables that will be used across all actions
    data = request.json
    cursor = mysql.get_db().cursor(MySQLdb.cursors.DictCursor)
    action = data['action']

    # First, get the proper result data by using the attempt_id in the data
    attemptId = data['attempt_id']
    print("ATTEMPTID FOR CURRENT RETRIEVAL")
    print(attemptId)

    # If the action is "retrieveResults", fetch the correct result record from the database based on the current user's user_id and attempt_id.
    if action == 'retrieveResults':
        # SINCE THERE CURRENTLY ISN'T ANY USER FUNCTIONALITY, SET user_id TO 1
        resultQuery = "SELECT S.score_id, S.total_score, S.entrance_level, S.test_date FROM scores S, user_answers U WHERE " \
        "S.user_id = 1 AND S.score_id = U.score_id AND U.attempt_id = %s"

        #Execute the query with the parameters, store the first entry, close the cursor, and return
        cursor.execute(resultQuery, attemptId)
        resultData = cursor.fetchone()
        cursor.close()

        # DEBUG Check the data retrieved from the database
        print("CURRENT RESULT RECORD DATA")
        print(resultData)

        oldDate = str(resultData['test_date'])
        # DEBUG Check the format of old date
        print("OLDDATE")
        print(oldDate)
        # Use isoformat as it is the quickest way to format the date in the proper manner, add Z for UTC timezone
        finalDate = f"{resultData['test_date'].isoformat()}Z"
        # DEBUG Check the updated date
        print("FINALDATE")
        print(finalDate)
        # Set the new date in the resultData before sending
        resultData['test_date'] = finalDate

        # DEBUG Check the final version with the updated date
        print("FINAL RESULTS DATA")
        # print(resultData)

        print("Before the return")
        return jsonify(resultData)

    # Else if the action is "retrieveAnswers", fetch the correct question, answer, and user response info based on provided attempt_id and user_id
    elif action == 'retrieveAnswers':
        #### REPLACE USER_ID=1 WHEN THE USER FUNCTIONALITY IS IMPLEMENTED
        # This simple query will select all question and answer info only for the questions the user answered on their current attempt.
        # The DISTINCT keyword is used so that duplicate records are not obtained.
        answersQuery = "SELECT DISTINCT Q.question_id, Q.question_text, Q.question_body, Q.question_level, A.answer_id, A.answer_text, " \
        "A.correct_answer, U.user_answer_text, U.user_was_correct, U.response_order FROM questions Q, answers A, user_answers U, scores S " \
        "WHERE Q.question_id = A.question_id AND A.question_id = U.question_id AND U.score_id = S.score_id AND U.attempt_id = %s AND " \
        "S.user_id = 1 ORDER BY U.response_order"

        cursor.execute(answersQuery, attemptId)
        answerData = cursor.fetchall()
        cursor.close()

        # DEBUG PRINT THE RESULT OF FETCHING FROM THE DATABASE
        print("BEFORE THE FOR LOOP!")
        #print(answerData)

        # Create the necessary fields to be passed to the function so that the answers can be properly mapped to each question
        questionKey = 'question_id'
        singleFields = ['question_id', 'question_text', 'question_body', 'question_level', 'user_answer_text', 'user_was_correct', 'response_order']
        nestedFields = ['answer_id', 'answer_text', 'correct_answer']
        answerData = mapAnswerstoQuestion(answerData, questionKey, singleFields, nestedFields)

        # Return the retrieved answers
        print("Before the return")
        return jsonify(answerData)
    

    # A default case just in case
    else:
        return jsonify("No proper action was specified in the results page!")
    

if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=int("5000"))
