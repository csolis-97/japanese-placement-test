# A function for checking if a user with the given email already exists. If yes, return their id. If not, then create a new user record and return the id
def checkEmail(cursor, mysql, email, name, finalTime):
    # Make a query to fetch one record's email and id that matches the current email
    userQuery = "SELECT U.email, U.id FROM users U WHERE U.email = %s"
    cursor.execute(userQuery, email)
    emailExists = cursor.fetchone()
    if emailExists is None:
        print("THIS IS A NEW USER, INSERT THEM INTO THE DATABASE!")
        # Set the paramList needed to insert a new user
        paramList = [email, name, finalTime]
        newUserQuery = "INSERT INTO users(email, fullname, created_at) VALUES (%s, %s, %s)"
        cursor.execute(newUserQuery, tuple(paramList))

        print("EXECUTED!")
        mysql.commit()
        print("COMMITED!")
        # Set userId to the last row that was inserted after committing
        userId = cursor.lastrowid
    # If emailExists did not return None, then use this instead
    else:
        userId = emailExists['id']
    return userId


# A function for creating a new score record so that the test results can be stored once the user finishes the test.
def createScoreRecord(cursor, mysql, initialScoreId, userId, finalTime):
    print("ENTER THE IF STATEMENT")
    if initialScoreId == 0:
        # Set the paramList for a new query
        paramList = [userId, finalTime]
        recordQuery = "INSERT INTO scores(user_id, total_score, entrance_level, test_status, test_date) VALUES (%s, 0, 'Beginner I', 'IN_PROGRESS', %s);"
        cursor.execute(recordQuery, tuple(paramList))
        print("EXECUTED!")
        mysql.commit()
        print("COMMITED!")
        # This will be used when inserting values into the user_answer table. It takes the id value inserted for the auto_incremented
        # score_id column and returns it
        scoreId = cursor.lastrowid
        print("SUCCESSFULLY CREATE THE SCORE RECORD!")
    else:
        scoreId = initialScoreId
    print(f"The record ID to be used is {scoreId}!")
    return scoreId


# A function for getting the user's current attempt number, taking the JSON data and the MYSQL cursor as its arguments.    
def getAttemptNum(cursor, attemptNum, userId):
    print("VALUE OF ATTEMPT NUM RIGHT NOW")
    print(attemptNum)
    if attemptNum == 0:
        #Execute the query to find the current attempt number using score_id
        attemptQuery = "SELECT MAX(U.attempt_id) AS max_attempt FROM user_answers U, scores S WHERE S.user_id = %s AND S.score_id = U.score_id"
        cursor.execute(attemptQuery, userId)
        attemptCheck = cursor.fetchone()
        print("HERE ARE THE RESULTS OF THE MAXIMUM VALUE FROM ATTEMPTCHECK:")
        print(attemptCheck)
        # Check the last attempt_id value that was used, and set attemptNum to that number + 1. Else set it to 1.
        if attemptCheck['max_attempt'] != None:
            lastId = attemptCheck['max_attempt']
            attemptNum = lastId + 1
        else:
            attemptNum = 1
    print("FINAL VALUE OF ATTEMPT NUM")
    print(attemptNum)
    return attemptNum