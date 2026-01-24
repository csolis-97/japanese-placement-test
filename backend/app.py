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

# Here is a sample of importing functions from other files in the backend
from test_data_functions import *

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
        #### FOR NOW USE user_id 1 AS A PLACEHOLDER, SINCE THERE ARE NO USERS CURRENTLY
        attemptNum = data['user_attempt']
        print("VALUE OF ATTEMPT NUM RIGHT NOW")
        print(attemptNum)
        attemptQuery = "SELECT U.attempt_id FROM user_answers U, scores S WHERE S.user_id = 1 AND S.score_id = U.score_id"

        cursor.execute(attemptQuery,)
        attemptCheck = cursor.fetchall()

        # If the length of the results is bigger than 0, set attemptNum to the length + 1 for a new attempt. Otherwise set it to 1.
        if len(attemptCheck) > 0:
            attemptNum = len(attemptCheck)+1
        else:
            attemptNum = 1
        print("FINAL VALUE OF ATTEMPT NUM")
        print(attemptNum)
        print("Before the return")
        return jsonify(attemptNum)
    
    # If the action is retrieveQuestions (default in the front end), select all the question info and return it
    elif action == 'retrieveQuestions' :

        # EDIT THIS BACK IN ONCE THE QUESTION LEVEL FUNCTIONALITY IS ACHIEVED

        # questionCategory = data['question_category']
        # paramList.append(questionCategory)
        # questionText = data['question_text']
        # questionBody = data['question_body']
        # answerText = data['answer_text']

        # for i in range(len(answerList)) :
        #     print(answerList[i]) 

        # Determine which questions to query based on the question category, build the final query, and execute it.
        ### I MAY JUST DO THIS WITHIN THIS FILE OR IN THE FRONT END, I'LL DECIDE WHEN I GET THERE
        finalQuery = "SELECT A.question_id, A.answer_id, A.answer_text, Q.question_text, Q.question_body, " \
        "Q.question_level FROM questions Q, answers A WHERE Q.question_id = A.question_id ORDER BY Q.question_id" 

        # EDIT THIS BACK IN ONCE THE QUESTION LEVEL FUNCTIONALITY IS ACHIEVED
        # finalQuery = "SELECT * FROM questions Q, answers A WHERE Q.question_id = A.question_id AND Q.question_level = %s " \
        # "ORDER BY Q.question_id" 
        # cursor.execute(finalQuery, tuple(paramList))

        # Execute the query, fetch all the results, store them in questions, and close the cursor
        cursor.execute(finalQuery)
        questions = cursor.fetchall()
        cursor.close()

        # DEBUG PRINT THE RESULT OF FETCHING FROM THE DATABASE
        print("BEFORE THE FOR LOOP!")
        print(questions)

        '''Make a temporary dictionary to correctly assign each answer_id and answer_text to the correct question_id.
        For each row in questions, the current value of question_id will be used to check if it is currently in the dictionary.
        If it is not, add the current question_id, question_text, question_body, question_level, and two empty arrays for
        answer_id and answer_text.
        '''
        groupedQuestions = {}
        for row in questions :
            questionKey = row['question_id']

            if questionKey not in groupedQuestions: 
                groupedQuestions[questionKey] = {
                "question_id" : row['question_id'],
                "question_text" : row['question_text'],
                "question_body" : row['question_body'],
                "question_level" : row['question_level'],
                "answer_id" : [],
                "answer_text" : []
            }
            
            # Append the current answer_id and answer_text to the current row within the dictionary, regardless if questionKey was
            # already in the dictionary or not.
            groupedQuestions[questionKey]["answer_id"].append(row['answer_id'])
            groupedQuestions[questionKey]["answer_text"].append(row['answer_text'])

        # DEBUG, ONCE THE GROUPING IS FINISHED PRINT THE RESULTS
        print("GROUPED!")
        print(groupedQuestions)
        # Set questions to groupedQuestions before returning. The keys are not needed, so just convert it to a list using the values.
        questions = list(groupedQuestions.values())
        # DEBUG, PRINT THE FINAL VERSION OF THE DATA TO BE SENT TO THE FRONT END
        print("NEW DATA!")
        print(questions)

        print("Before the return")
        return jsonify(questions)
        # Add return statuses if needed


    ### SECTION FOR RECEIVING USER ANSWERS, CHECKING THEM, AND STORING THEM ###


    # If the action is sendAnswers, check the user's answers, then store them in the database
    elif action == 'sendAnswers':

        '''A few lists are declared here. The results list will store the answer information stored in the database in order to check it 
        with the user's answers. The questionId list will store the proper ID of each question the user answered, so that the proper
        answers can be checked. isCorrect will store a boolean value of either True or False, depending on whether the answer the user
        gave was correct or not. answerId only stores the integer of each question checked after the value is retrieved from the
        database. paramList merely stores the parameters for the SQL query.
        '''
        results = []
        questionId = []
        isCorrect = []
        answerId = []
        paramList = []
        # Store the user's answers that were retrieved in answerList and the attempt number in attemptNum
        answerList = data['answer_text']
        attemptNum = data['user_attempt']
        
        print("VALUE OF ATTEMPT NUM RIGHT NOW")
        print(attemptNum)
        attemptQuery = "SELECT U.attempt_id FROM user_answers U, scores S WHERE S.user_id = 1 AND S.score_id = U.score_id"

        cursor.execute(attemptQuery,)
        attemptCheck = cursor.fetchall()

        # If the length of the results is bigger than 0, set attemptNum to the length + 1 for a new attempt. Otherwise set it to 1.
        if len(attemptCheck) > 0:
            attemptNum = len(attemptCheck)+1
        else:
            attemptNum = 1
        print("FINAL VALUE OF ATTEMPT NUM")
        print(attemptNum)

        # DEBUG CHECK THE VALUES IN ANSWERLIST
        print("ANSWER LIST")
        print(answerList)

        # Enter a for loop to retrieve the proper answer information from the database based on each index's 'answer_text'
        # 'question_id' values
        for answeredQuestion in answerList :
            # DEBUG CHECK THE CURRENT QUESTION_ID VALUE
            print("HERE IS EACH QUESTION_ID")
            print(answeredQuestion)
            '''Here, append the current answeredQuestion value to the list of questionId, though make sure to increment +1 as index
            values in SQL databases start from 1, not 0. It took me a while to realize that mistake. Ditto for the parameter list.
            The SQL query will expect a value for answer_text and then question_id in that order, so the list is set accordingly.'''
            questionId.append(int(answeredQuestion)+1)
            paramList = [answerList[answeredQuestion], int(answeredQuestion)+1]

            # PRINT THE CURRENT PARAMLIST FOR DEBUG
            print("HERE IS THE CURRENT PARAMLIST")
            print(paramList)
            # Create the parameter list for the query, and build the query. All answer information is fetched for future use.
            checkQuery = "SELECT A.correct_answer, A.question_id, A.answer_id, A.answer_text, Q.question_level FROM questions Q, " \
            "answers A WHERE Q.question_id = A.question_id AND A.answer_text = %s AND A.question_id = %s ORDER BY A.question_id"

            # Execute the query with the paramList, fetch the first result, store it in row, then append row to results 
            cursor.execute(checkQuery, tuple(paramList))
            row = (cursor.fetchone())
            answerId.append(row['answer_id'])
            results.append(row)
            # Reset paramList for the next iteration
            paramList = []

        # DEBUG CHECK THE LIST OF RESULTS HERE
        print("LIST OF RESULTS")
        print(results)
        # Enumerate works differently from regular iteration in that you can access both the current index value alongside the index.
        # Useful for cases like the one below, where you need the current index to check the value at the same index in another list.
        '''Now, enter a for loop using enumeration on results to check each answer the user gave. The outer if statement will check if
        the value stored at the current index of questionId is the same as the current row's value of 'question_id'. If not, append
        False to isCorrect. This check is done to make sure that the answers are properly graded by ensuring that the question_id is the
        same, since multiple questions can potentially have the same answers. Otherwise, move to the inner if statement and check if the 
        current row's value of 'correct_answer' is True. If it is, append True to isCorrect, otherwise append False. 
        '''
        for i, row in enumerate(results) :
            if questionId[i] == row['question_id']:
                if row['correct_answer'] == True :
                    isCorrect.append(True)
                else:
                    isCorrect.append(False)
            else :
                isCorrect.append(False)

        # A BUNCH OF DEBUG STUFF FOR CHECKING THAT THE ANSWERS ARE INDEED BEING GRADED PROPERLY
        print("ISCORRECT ARRAY!")
        print(isCorrect)
        print("QUESTIONID ARRAY!")
        print(questionId)
        print("ANSWERLIST")
        print(answerList)

        # Finally, store the user's answers in the database.
        print("CAN YOU SEE THIS?")

        # NOW CALCULATE AND STORE THE RESULTS

        # Empty the paramList again for future use
        paramList = []
        # Here a simple query will be done to fetch all the question_id entries, and store the length of the results in totalQ
        totalQuestionQuery = "SELECT Q.question_id FROM questions Q"
        cursor.execute(totalQuestionQuery,)
        totalQ = len(cursor.fetchall())

        # These variables will be used for determining the total score and which level the user should enter based on their responses
        entranceLevel = ''
        totalScore = 0.0
        correctNum = 0
        # Iterate through the isCorrect list, increment correctNum for each True value contained within isCorrect
        for i, row in enumerate(isCorrect):
            # DEBUG FOR CHECKING THE CURRENT VALUE OF ISCORRECT
            print(isCorrect[row])
            print(row)
            print(i)
            if row == True:
                correctNum = correctNum + 1

        # DEBUG FOR CHECKING CURRENT VALUES OF CORRECTNUM AND TOTALQ
        print("TOTAL CORRECT")
        print(correctNum)
        print("TOTAL QUESTION NUMBER")
        print(totalQ)

        # Here the totalScore is calculated, resulting in a percentage.
        totalScore = (correctNum/totalQ) * 100
        #DEBUG FOR CHECKING TOTALSCORE'S VALUE
        print(totalScore)

        # A simple if statement to determine the user's placement based on their score. 76 to 100 = N3, 51 to 75 = N4, otherise N5.
        if totalScore > 75 and totalScore <= 100:
            entranceLevel = 'N3'
        elif totalScore > 50 and totalScore <= 75:
            entranceLevel = 'N4'
        else:
            entranceLevel = 'N5'

        # Fetch the submission date and time from the data and convert it into a string, since the format must be changed
        submitTime = str(data['date'])
        #DEBUG CHECK SUBMIT TIME VALUE
        print("SUBMIT TIME")
        print(submitTime)
        # Here, the string will be stripped of the T for Time, Z for the UTC offset, and the miliseconds, 
        # and put back together using an f-string with a space inbetween.
        finalTime = f"{submitTime[0:10]} {submitTime[11:19]}"
        #DEBUG CHECK FINAL TIME VALUE AND A DATETIME SAMPLE VALUE FOR SQL
        print("FINAL TIME")
        print(finalTime)
        print('2014-08-04 12:56:23')

        # Set the paramList's arguments to totalScore, entranceLevel, and finalTime
        paramList = [totalScore, entranceLevel, finalTime]
        
        ##### FOR NOW USE USER_ID OF 1, I JUST PUT A RANDOM PLACEHOLDER FOR THE TIMEBEING

        ##### FOR SOME REASON, BOTH THE CORRECT SCORE AND ENTRANCE LEVEL ALONGSIDE ONE WITH A SCORE OF 0 AND N5 LEVEL ARE BOTH
        ##### BEING INSERTED AT THE SAME TIME INTO THE TABLE. FIND OUT WHY!
        ##### FIRST THE WRONG ONE IS BEING STORED, BUT THE CORRECT ONE HAS THE SAME SUBMISSION ID AS THE TABLE IN SCORES YET DOESN'T
        ##### HAVE THIS DUPLICATION ERROR!

        scoreQuery = "INSERT INTO scores(user_id, total_score, entrance_level, test_date) VALUES" \
        "(1, %s, %s, %s)"

        cursor.execute(scoreQuery, tuple(paramList))
        # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
        # mysql.connection.commit()
        # Commit the change so that it appears in the database
        commitChange = mysql.get_db()
        commitChange.commit()
        # This will be used when inserting values into the user_answer table. It takes the id value inserted for the auto_incremented
        # score_id column and returns it
        scoreId = cursor.lastrowid
        print("SUCCESSFULLY STORED THE SCORES!")

        # NOW ENTER THE SECTION FOR STORING THE USER'S ANSWERS

        # Empty paramList once again
        paramList = []
        # Check if the user actually had any answers. If not, skip to the else statement without interacting with the database.
        if len(isCorrect) > 0:
            # First, get the length of answerList and assign it to answerLength. Alongside it, valueString and valueQuery are created to
            # properly build the query. valueString represents the five parameters that will be passed when inserting the user's answers
            # to the user_answers table. Since the amount of submitted answers may vary, valueQuery will need to be built accordingly.
            answerLength = len(answerList)
            valueString = "(%s, %s, %s, %s, %s),"
            valueQuery = []

            '''Enter a loop to properly build valueQuery. In order to insert the correct amount of values into the database, the for loop
            iterates until it reaches the length of answerLength and appends one of two strings to valueQuery. If the current index is 
            greater than or equal to answerLength-1, this is the last item in the answerList, so append the given string to properly
            close the INSERT() VALUES() statement that will be used in a momement. Otherwise, append anotherValueString. 
            '''
            for i in range(answerLength):
                if i >= answerLength-1:
                    valueQuery.append("(%s, %s, %s, %s, %s);")
                    print(i)
                    print("FILLING IN THE VALUEQUERY WITH FINAL!")
                else:
                    valueQuery.append(valueString)
                    print(i)
                    print("FILLING IN THE VALUEQUERY WITH NEW LINE!")

            #DEBUG FOR CHECKING THE FINAL STATE OF VALUEQUERY
            print("THIS IS WHAT VALUE QUERY LOOKS LIKE")
            print(valueQuery)

            print("THIS IS THE CHECK FOR ANSWER LIST AGAIN")
            print(answerList)

            # Enter a for loop with enumeration in order to append the proper values that will be used as parameters for the query 
            # in paramList.
            for i, row in enumerate(answerList):
                paramList.append(scoreId)
                paramList.append(attemptNum)
                paramList.append(questionId[i])
                paramList.append((answerList[row]))
                paramList.append(isCorrect[i])

            # DEBUG FOR THE PARAMLIST
            print("HERE IS THE FINAL PARAMLIST")
            print(paramList)
            storeQuery = f"INSERT INTO user_answers(score_id, attempt_id, question_id, user_answer_text, user_was_correct) VALUES {" ".join(valueQuery)}"

            cursor.execute(storeQuery, tuple(paramList))
            # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
            # mysql.connection.commit()
            # Commit the change so that it appears in the database
            commitChange = mysql.get_db()
            commitChange.commit()
            print("SUCCESSFULLY STORED THE ANSWERS!")
        else:
            print("USER SUBMITTED NO ANSWERS, SO THERE IS NOTHING TO STORE.")

        # Finally, close the cursor
        cursor.close()
        return jsonify(isCorrect)
    
####//// Route for the results ////####
@app.route('/results', methods=['GET', 'POST'])
def resultDisplay():
    print("HELLO")

    data = request.json
    cursor = mysql.get_db().cursor(MySQLdb.cursors.DictCursor)

    #First declare variables and other stuff that will be used across both types of actions
    action = data['action']
    paramList = []

    # First, get the proper result data by using the attempt_id in the data
    attemptId = data['attempt_id']
    print("ATTEMPTID FOR CURRENT RETRIEVAL")
    print(attemptId)

    if action == 'retrieveResults':
        # SINCE THERE CURRENTLY ISN'T ANY USER FUNCTIONALITY, SET user_id TO 1
        resultQuery = "SELECT S.score_id, S.total_score, S.entrance_level, S.test_date FROM scores S, user_answers U WHERE " \
        "S.user_id = 1 AND S.score_id = U.score_id AND U.attempt_id = %s"

        #Execute the query with the parameters, store the first entry, close the cursor, and return
        cursor.execute(resultQuery, attemptId)
        resultData = cursor.fetchone()
        cursor.close()

        print("CURRENT RESULT RECORD DATA")
        print(resultData)

        ### THERE MOST LIKELY WILL BE AN ERROR IF THE DATE IS NOT CONVERTED BACK TO THE FORMAT USED IN TYPESCRIPT.
        ### IF IT DOES WORK, FIX IT HERE REGARDLESS
        print("EXAMPLE OF DATETIME FORMAT IN SQL")
        print('2014-08-04 12:56:23')
        print("EXAMPLE OF TYPESCRIPT DATE FORMAT IN TYPESCRIPT. SINCE THE MILISECONDS WERE NOT SAVED, IGNORE THOSE")
        print('2014-08-04T12:56:23:123Z')

        # Add T for the Time and Z for UTC timezone
        oldDate = str(resultData['test_date'])
        print("OLDDATE")
        print(oldDate)
        # Use isoformat as it is the quickest way to format the date in the proper manner
        finalDate = f"{resultData['test_date'].isoformat()}Z"
        print("FINALDATE")
        print(finalDate)
        # Set the new date in the resultData before sending
        resultData['test_date'] = finalDate

        print("FINAL RESULTS DATA")
        print(resultData)

        print("Before the return")
        return jsonify(resultData)


    elif action == 'retrieveAnswers':

        #### REPLACE USER_ID=1 WHEN THE USER FUNCTIONALITY IS IMPLEMENTED
        # DISTINCT keyword is used so that duplicate records are not obtained
        answersQuery = "SELECT DISTINCT Q.question_id, Q.question_text, Q.question_body, Q.question_level, A.answer_id, A.answer_text, " \
        "A.correct_answer, U.user_answer_text, U.user_was_correct FROM questions Q " \
        "JOIN answers A ON Q.question_id = A.question_id " \
        "JOIN user_answers U ON A.question_id = U.question_id " \
        "JOIN scores S ON U.score_id AND S.score_id WHERE U.attempt_id = %s AND S.user_id = 1 ORDER BY Q.question_id"

        cursor.execute(answersQuery, attemptId)
        answerData = cursor.fetchall()
        cursor.close()

        # DEBUG PRINT THE RESULT OF FETCHING FROM THE DATABASE
        print("BEFORE THE FOR LOOP!")
        print(answerData)

        '''Make a temporary dictionary to correctly assign each answer_id, answer_text, and correct_answer to the correct question_id.
        For each row in questions, the current value of question_id will be used to check if it is currently in the dictionary.
        If it is not, add the current question_id, question_text, question_body, question_level, user_answer_text, user_was_correct,
        and three empty arrays for answer_id, answer_text, and correct_answer.
        '''
        groupedAnswers = {}
        for row in answerData :
            questionKey = row['question_id']

            if questionKey not in groupedAnswers: 
                groupedAnswers[questionKey] = {
                "question_id" : row['question_id'],
                "question_text" : row['question_text'],
                "question_body" : row['question_body'],
                "question_level" : row['question_level'],
                "answer_id" : [],
                "answer_text" : [],
                "correct_answer" : [],
                "user_answer_text" : row['user_answer_text'],
                "user_was_correct" : row['user_was_correct']
            }
            
            # Append the current answer_id, answer_text, and correct_answer to the current row within the dictionary, regardless if 
            # questionKey was already in the dictionary or not.
            groupedAnswers[questionKey]["answer_id"].append(row['answer_id'])
            groupedAnswers[questionKey]["answer_text"].append(row['answer_text'])
            groupedAnswers[questionKey]["correct_answer"].append(row['correct_answer'])

        # DEBUG, ONCE THE GROUPING IS FINISHED PRINT THE RESULTS
        print("GROUPED!")
        print(groupedAnswers)
        # Set answerData to groupedAnswers before returning. The keys are not needed, so just convert it to a list using the values.
        answerData = list(groupedAnswers.values())
        # DEBUG, PRINT THE FINAL VERSION OF THE DATA TO BE SENT TO THE FRONT END
        print("NEW DATA!")
        print(answerData)

        print("Before the return")
        return jsonify(answerData)
    

if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=int("5000"))
