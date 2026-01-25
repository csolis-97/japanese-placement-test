# A function for getting the user's current attempt number, taking the JSON data and the MYSQL cursor as its arguments.    
def getAttemptNum(attemptNum, cursor):
    
    print("VALUE OF ATTEMPT NUM RIGHT NOW")
    print(attemptNum)
    if attemptNum == 0:
        #### FOR NOW USE user_id = 1 AS A PLACEHOLDER!!!!!!!!!!!!!!!
        attemptQuery = "SELECT DISTINCT U.attempt_id FROM user_answers U, scores S WHERE S.user_id = 1 AND S.score_id = U.score_id"

        cursor.execute(attemptQuery,)
        attemptCheck = cursor.fetchall()
        # If the length of the results is bigger than 0, set attemptNum to the length + 1 for a new attempt. Otherwise set it to 1.
        if len(attemptCheck) > 0:
            attemptNum = len(attemptCheck)+1
        else:
            attemptNum = 1
    print("FINAL VALUE OF ATTEMPT NUM")
    print(attemptNum)
    return attemptNum


# This function will fetch all of the question info, alongside its respective answer info, given the user's answer and question_id
def getCorrectAnswerInfo(cursor, answerList, questionId, answerId):
    # The results list will store the answer information stored in the database in order to check it with the user's answers.
    results = []
    print(answerList)
    # Enter a for loop to retrieve the proper answer information from the database based on each index's 'answer_text'
    # and 'question_id' values
    print("ANSWERLIST LENGTH")
    print(len(answerList))
    if type(answerList) == str and type(questionId) == int:
        # DEBUG CHECK THE CURRENT QUESTION_ID VALUE
        print("HERE IS THE CURRENT QUESTION_ID")
        print(questionId)

        '''Here, append the current answeredQuestion value to the list of questionId, though make sure to increment +1 as index
        values in SQL databases start from 1, not 0. It took me a while to realize that mistake. Ditto for the parameter list.
        The SQL query will expect a value for answer_text and then question_id in that order, so the list is set accordingly.'''
        paramList = [answerList, int(questionId)+1]
        checkQuestions(paramList, cursor, answerId, results)
    else: 
        for answeredQuestion in answerList :
            # DEBUG CHECK THE CURRENT QUESTION_ID VALUE
            print("HERE IS EACH QUESTION_ID")
            print(answeredQuestion)

            '''Here, append the current answeredQuestion value to the list of questionId, though make sure to increment +1 as index
            values in SQL databases start from 1, not 0. It took me a while to realize that mistake. Ditto for the parameter list.
            The SQL query will expect a value for answer_text and then question_id in that order, so the list is set accordingly.'''
            questionId.append(int(answeredQuestion)+1)
            paramList = [answerList[answeredQuestion], int(answeredQuestion)+1]
            checkQuestions(paramList, cursor, answerId, results)

    # DEBUG CHECK THE LIST OF RESULTS HERE
    print("LIST OF RESULTS")
    print(results)
    return results

# A function used to append one question's answer information from the database to the results
def checkQuestions(paramList, cursor, answerId, results): 
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

# This function will check the correct answer against the user's answer, outputing a list of boolean values
def gradeAnswers(results, questionId):
    # isCorrect will store a boolean value of either True or False, depending on whether the answer the user gave was correct or not.
    isCorrect = []
    # Enumerate works differently from regular iteration in that you can access both the current index value alongside the index.
    '''Now, enter a for loop using enumeration on results to check each answer the user gave. The outer if statement will check if
    the value stored at the current index of questionId is the same as the current row's value of 'question_id'. If not, append
    False to isCorrect. This check is done to make sure that the answers are properly graded by ensuring that the question_id is the
    same, since multiple questions can potentially have the same answers. Otherwise, move to the inner if statement and check if the 
    current row's value of 'correct_answer' is True. If it is, append True to isCorrect, otherwise append False. 
    '''
    if (type(questionId) == int):
        print("RESULTS FOR SINGLE QUESTION_ID!")
        print(results)
        for i, row in enumerate(results) :
            print("ROW!!!!")
            print(row)
            if row['correct_answer'] == True :
                isCorrect.append(True)
            else:
                isCorrect.append(False)
    else:
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
    return isCorrect


# This function will calculate the user's score based on how many questions they got correct, and decide their entrance level.
# After that is done, it will call finalizeSubmitParams
def calculateScore(cursor, isCorrect, submitTime):
    # NOW CALCULATE THE RESULTS
    # Here a simple query will be done to fetch all the question_id entries, and store the length of the results in totalQ
    totalQuestionQuery = "SELECT Q.question_id FROM questions Q"
    cursor.execute(totalQuestionQuery,)
    totalQ = len(cursor.fetchall())

    # These variables will be used for determining the total score and which level the user should enter based on their responses
    entranceLevel = ""
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
        entranceLevel = "N3"
    elif totalScore > 50 and totalScore <= 75:
        entranceLevel = "N4"
    else:
        entranceLevel = "N5"
    return finalizeSubmitParams(submitTime, totalScore, entranceLevel)


# This function will convert the date to the proper MySQL format before returning all of the necessary parameters needed to store
# The results
def finalizeSubmitParams(submitTime, totalScore, entranceLevel):
    # NOW FINALIZE THE PARAMLIST
    # Empty the paramList again for future use
    paramList = []
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

    print("TOTAL SCORE")
    print(totalScore)
    print("ENTRANCE LEVEL")
    print(entranceLevel)
    # Set the paramList's arguments to totalScore, entranceLevel, and finalTime
    paramList = [totalScore, entranceLevel, finalTime]
    print(paramList)
    return paramList


# This function will build the appropriate length for an insertion into the database based on the length of answerList
def buildValueQuery(answerList):
    # First, get the length of answerList and assign it to answerLength. Alongside it, valueString and valueQuery are created to
    # properly build the query. valueString represents the five parameters that will be passed when inserting the user's answers
    # to the user_answers table. Since the amount of submitted answers may vary, valueQuery will need to be built accordingly.
    if str(answerList):
        answerLength = 1
    else:
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
    return valueQuery