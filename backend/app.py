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
# from questions.n1 questions import *

app = Flask(__name__)

# Enables CORS for the app so that it can accept requests from the frontend running on localhost:3000
CORS(app, resources={r"/*" : {"origins" : "http://localhost:3000"}})

# Load the environment variables from the .env file, which will then be used to configure the database connection
load_dotenv()

app.secret_key = 'your_secret_key'

app.config['MYSQL_HOST'] = os.getenv('HOST')
app.config['MYSQL_USER'] = os.getenv('USER')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('SQL_DB')

# Initialize MySQL for database access and Bcrypt for password hashing
mysql = MySQL(app)
bcrypt = Bcrypt(app)

# Route for the test form
@app.route('/testform', methods=['GET'])
def testForm():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    data = request.json
    # Test print to see data
    print(data)

    # To track the user's answers
    answerList = []
    paramList = []

    # Parameters to be used in both GET and POST requests
    questionId = data['question_id']
    answerId = data['answer_id']
    correctOption = data['correct_option']

    # If the request is GET, fetch the question data based on the question category
    if request.method == 'GET' :

        # Extract the data from the request
        questionCategory = data['question_category']
        paramList.append(questionCategory)
        questionText = data['question_text']
        questionBody = data['question_body']
        answerText = data['answer_text']

        for i in range(len(answerList)) :
            print(answerList[i]) 

        # Determine which questions to query based on the question category, build the final query, and execute it.

        finalQuery = "SELECT * FROM questions Q, answers A WHERE Q.question_id = A.question_id AND Q.question_level = %s " \
        "ORDER BY Q.question_id" 

        # Execute the query, fetch all the results, store them in questions, and close the cursor
        cursor.execute(finalQuery, tuple(paramList))
        questions = cursor.fetchall()
        cursor.close()

        print("Before the return")
        return jsonify(questions)
        # Add return statuses if needed

    # If the request is POST, check if the answer is correct
    else :
        # Create the parameter list for the query, and build the query
        paramList.append(questionId, answerId)
        finalQuery = "SELECT A.correct_answer FROM questions Q, answers A WHERE Q.question_id = A.question_id AND A.question_id = %s" \
        " AND A.answer_id = %s"

        # Execute the query, fetch the first result, store it in results, and close the cursor
        cursor.execute(finalQuery, tuple(paramList))
        results = cursor.fetchone()
        cursor.close()

        # Check if the answer is correct or not, then return the result
        if results[0] == 1 :
            isCorrect = True
        else :
            isCorrect = False
        return jsonify(isCorrect)

if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=int("5000"))
