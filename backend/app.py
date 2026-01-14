from flask import Flask, jsonify, request, session, redirect, url_for, render_template, make_response
from flask_mysql import MySQL
from dotenv import load_dotenv
from flaskbycrypt import Bcrypt
from flask_cors import CORS
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

### USE THE BELOW AS A TEMPLATE FOR NEW ROUTES ###


# Route for the test form
@app.route('/testform', methods=['POST'])
def testForm():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    data = request.json
    # Test print to see data
    print(data)
    # To track the user's answers
    answerList = []
    paramList = []

    # Extract the data from the request
    questionCategory = data['question_category']
    paramList.append(questionCategory)
    questionId = data['question_id']
    questionText = data['question_text']
    questionBody = data['question_body']
    answerOption = data['answer_id']
    answerText = data['answer_text']
    correctOption = data['correct_option']

    for i in range(len(answerList)) :
        print(answerList[i]) 

    # Determine which questions to query based on the question category, build the final query, and execute it.

    finalQuery = "SELECT * FROM questions Q, answers A WHERE Q.question_id = A.question_id AND Q.question_level = %s " \
    "ORDER BY Q.question_id" 

    cursor.execute(finalQuery, tuple(paramList))
    questions = cursor.fetchall()
    cursor.close()
    print("Before the return")
    return jsonify(questions)
    # Add return statuses if needed


# Route for forgot password
@app.route('/forgot-password', methods=['POST'])
def forgotPassword():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    data = request.json
    email = data['email']

    query = "SELECT * FROM users WHERE email = ?"
    cursor.execute(query, (email,))
    account = cursor.fetchone()

    if account == None :
        res = make_response({'status' : 'an account with that email does not exist'})
        res.status_code = 301
        cursor.close()
        return res
    else :
        # Write the logic for sending the actual emails
        ###
        #
        res = make_response({'status' : 'an email has been sent to the provided email address'})
        res.status_code = 201
        cursor.close()
        return res

if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=int("5000"))
