# A function for getting the user's current attempt number, taking the JSON data and the MYSQL cursor as its arguments.    
def getAttemptNum(cursor, attemptNum):
    print("VALUE OF ATTEMPT NUM RIGHT NOW")
    print(attemptNum)
    if attemptNum == 0:
        #### FOR NOW USE user_id = 1 AS A PLACEHOLDER!!!!!!!!!!!!!!!
        #Execute the query to find the current attempt number using score_id
        attemptQuery = "SELECT DISTINCT U.attempt_id FROM user_answers U, scores S WHERE S.user_id = 1 AND S.score_id = U.score_id"
        cursor.execute(attemptQuery)
        attemptCheck = cursor.fetchall()
        print("HERE ARE THE RESULTS OF ATTEMPTCHECK:")
        print(attemptCheck)
        # Make a list to store attempt_id's that can no longer be used, then append all of the row data in attemptCheck to said list.
        invalidId = []
        if attemptCheck:
            attemptNum = 1
            for row in attemptCheck:
                invalidId.append(row['attempt_id'])
                print(f"HERE ARE THE LIST OF INVALID ATTEMPT ID'S {invalidId}")
            # Make sure that an attempt_id that has not already been used is assigned before exiting.
            while attemptNum in invalidId:
                print("INVALID ID SELECTED, TRY AGAIN!")
                attemptNum = attemptNum + invalidId[0]+1
                print(f"TRYING WITH ATTEMPT NUMBER: {attemptNum}")
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