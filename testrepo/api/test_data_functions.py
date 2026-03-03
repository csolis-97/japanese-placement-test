# A function for checking if a user with the given email already exists. If yes, return their id. If not, then create a new user record and return the id
def checkEmail(cursor, mysql, email, name, finalTime):
    # Make a query to fetch one record's email and id that matches the current email
    userQuery = "SELECT U.email, U.id FROM users U WHERE U.email = %s"
    cursor.execute(userQuery, email)
    emailExists = cursor.fetchone()
    if emailExists == None:
        print("THIS IS A NEW USER, INSERT THEM INTO THE DATABASE!")
        # Set the paramList needed to insert a new user
        paramList = [email, name, finalTime]
        newUserQuery = "INSERT INTO users(email, fullname, created_at) VALUES (%s, %s, %s)"
        cursor.execute(newUserQuery, tuple(paramList))

        print("EXECUTED!")
        # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
        # mysql.connection.commit()
        # Commit the change so that it appears in the database
        #commitChange = mysql.get_db()
        #commitChange.commit()
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
        # This is the version used with flask_mysql, but the wheel fails to build so I used the flaskext.mysql version above
        # mysql.connection.commit()
        # Commit the change so that it appears in the database
        #commitChange = mysql.get_db()
        #commitChange.commit()
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
        # attemptQuery = "SELECT DISTINCT U.attempt_id FROM user_answers U, scores S WHERE S.user_id = %s AND S.score_id = U.score_id "
        attemptQuery = "SELECT MAX(U.attempt_id) AS max_attempt FROM user_answers U, scores S WHERE S.user_id = %s AND S.score_id = U.score_id"
        cursor.execute(attemptQuery, userId)
        attemptCheck = cursor.fetchone()
        print("HERE ARE THE RESULTS OF THE MAXIMUM VALUE FROM ATTEMPTCHECK:")
        print(attemptCheck)
        # Check the last attempt_id value that was used, and set attemptNum to that number + 1. Else set it to 1.
        if attemptCheck:
            #lastId = attemptCheck[len(attemptCheck) - 1]['attempt_id']
            lastId = attemptCheck['max_attempt']
            #attemptNum = lastId + 1
            attemptNum = lastId + 1
        else:
            attemptNum = 1
    print("FINAL VALUE OF ATTEMPT NUM")
    print(attemptNum)
    return attemptNum


# This function takes data from a database, and maps each four different entries for the same question info (single) but different answer info
# (nested) to the same entry by mapping into a dictionary, then converting the result into a list of values before returning.
def mapAnswerstoQuestion(newQuestion, questionKey, singleFields, nestedFields):
    print(f"QUESTION KEY! {questionKey}")
    print(f"SINGLE FIELDS! {singleFields}")
    print(f"NESTED FIELDS! {nestedFields}")
    groupedQuestions = {}
    for row in newQuestion :
        # Get the actual key for the current row
        rowKey = row[questionKey]
        if rowKey not in groupedQuestions: 
            groupedQuestions[rowKey] = {
                # I've never seen this syntax before, so allow me to explain. This will create an object in the dictionary with the current key, and it will be
                # repeated for every field in singleFields
                field : row[field] for field in singleFields
            }
            for nested in nestedFields:
                groupedQuestions[rowKey][nested] = []
        # Append the current nestedFields to the current row within the dictionary, regardless if questionKey was
        # already in the dictionary or not.
        for nested in nestedFields:
                groupedQuestions[rowKey][nested].append(row[nested])

    # DEBUG, ONCE THE GROUPING IS FINISHED PRINT THE RESULTS
    print("GROUPED!")
    # print(groupedQuestions)
    # Set questions to groupedQuestions before returning. The keys are not needed, so just convert it to a list using the values.
    newQuestion = list(groupedQuestions.values())
    # DEBUG, PRINT THE FINAL VERSION OF THE DATA TO BE SENT TO THE FRONT END
    print("NEW DATA!")
    # print(newQuestion)
    return newQuestion