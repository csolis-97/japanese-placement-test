# This function will fetch all of the question info, alongside its respective answer info, given the user's answer and question_id
def getCorrectAnswerInfo(cursor, answerList, questionId, answerId, currentStageNum):
    # The results list will store the answer information stored in the database in order to check it with the user's answers.
    results = []
    print(answerList)
    # Enter a for loop to retrieve the proper answer information from the database based on each index's 'answer_text'
    # and 'question_id' values
    print("ANSWERLIST LENGTH")
    print(len(answerList))
    if isinstance(answerList, str) and isinstance(questionId, int):
        # DEBUG CHECK THE CURRENT QUESTION_ID VALUE
        print("HERE IS THE CURRENT QUESTION_ID")
        print(questionId)

        '''Here, append the current answeredQuestion value to the list of questionId.
        The SQL query will expect a value for answer_text and then question_id in that order, so the list is set accordingly.'''
        paramList = [answerList, int(questionId)]
        checkQuestions(paramList, cursor, answerId, results)
    else: 
        for i, answeredQuestion in enumerate(answerList):
            # DEBUG CHECK EACH QUESTION_ID VALUE
            print("HERE IS EACH QUESTION_ID")
            print(answeredQuestion)

            '''Here, append the current answeredQuestion value to the list of questionId.
            The SQL query will expect a value for answer_text and then question_id in that order, so the list is set accordingly.'''
            paramList = [answeredQuestion, int(questionId[i])]
            checkQuestions(paramList, cursor, answerId, results, currentStageNum)

    # DEBUG CHECK THE LIST OF RESULTS HERE
    print("LIST OF RESULTS")
    print(results)
    return results

# A function used to append one question's answer information from the database to the results
def checkQuestions(paramList, cursor, answerId, results, currentStageNum): 
    # PRINT THE CURRENT PARAMLIST FOR DEBUG
    print("HERE IS THE CURRENT PARAMLIST")
    print(paramList)
    # Create the parameter list for the query, and build the query. All answer information is fetched for future use.
    checkQuery = "SELECT A.correct_answer, A.question_id, A.answer_id, A.answer_text, Q.question_level FROM questions Q, " \
    "answers A WHERE Q.question_id = A.question_id AND A.answer_text = %s AND A.question_id = %s ORDER BY A.question_id"
    # Execute the query with the paramList, fetch the first result, store it in row, then append row to results 
    cursor.execute(checkQuery, tuple(paramList))
    row = (cursor.fetchone())
    # If a result was found in the database, append its answer_id to answerId and the info to results
    if (row):
        answerId.append(row['answer_id'])
        results.append(row)
    # If no result was found in the database (meaning that the user didn't provide an answer), enter the else statement
    else:
        # Since an answer_id is required, put 0 as that is not an actual ID
        answerId.append(0)
        # Manually make a record to append to results here
        results.append({
            'correct_answer': 0,
            'question_id': paramList[1],
            'answer_id': 0,
            'answer_text': paramList[0],
            'question_level': currentStageNum
        })
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
    if (isinstance(questionId, int)):
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

# This function will build the appropriate length for an insertion into the database based on the length of answerList
def buildValueQuery(answerList):
    # First, get the length of answerList and assign it to answerLength. Alongside it, valueString and valueQuery are created to
    # properly build the query. valueString represents the five parameters that will be passed when inserting the user's answers
    # to the user_answers table. Since the amount of submitted answers may vary, valueQuery will need to be built accordingly.
    print(f"ANSWERLIST IS {answerList}")
    print(f"LENGTH OF ANSWERLIST IS {len(answerList)}")
    if str(answerList) and len(answerList) <= 1:
        answerLength = 1
    else:
        answerLength = len(answerList)
    valueString = "(%s, %s, %s, %s, %s, %s, %s),"
    valueQuery = []

    '''Enter a loop to properly build valueQuery. In order to insert the correct amount of values into the database, the for loop
    iterates until it reaches the length of answerLength and appends one of two strings to valueQuery. If the current index is 
    greater than or equal to answerLength-1, this is the last item in the answerList, so append the given string to properly
    close the INSERT() VALUES() statement that will be used in a momement. Otherwise, append anotherValueString. 
    '''
    for i in range(answerLength):
        if i >= answerLength - 1:
            valueQuery.append("(%s, %s, %s, %s, %s, %s, %s);")
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

# This function is used to build the parameters that will be inserted into the valueQuery from the previous method
def buildAnswerData(answerData, scoreId, attemptNum, questionId, isCorrect, questionTrack, currentStageNum):
    # Initiate paramList
    paramList = []
    # Enter a for loop with enumeration in order to append the proper values that will be used as parameters for the query 
    # in paramList.
    if str(answerData) and len(answerData) <= 1:
        paramList.append(scoreId)
        paramList.append(attemptNum)
        paramList.append(questionId)
        paramList.append(len(questionTrack))
        paramList.append(currentStageNum + 1)
        paramList.append(answerData)
        paramList.append(isCorrect)
    else:
        # For each row in answerData, append the scoreId and attemptNum, alongside the corresponding questionId, the proper
        # response_order value, and the corresponding user answer alongside whether it was correct or not. 
        for i, row in enumerate(answerData):
            paramList.append(scoreId)
            paramList.append(attemptNum)
            paramList.append(questionId[i])
            # To maintain proper response order in the tables, use floor division to round to the nearest full number
            if len(questionTrack) <= 5:
                paramList.append(i + 1)
            else:
                paramList.append((i + 1) + (len(questionTrack) - 5))
            paramList.append(currentStageNum + 1)
            paramList.append(answerData[i])
            paramList.append(isCorrect[i])

    # DEBUG FOR THE PARAMLIST
    print("HERE IS THE FINAL PARAMLIST")
    print(paramList)
    return paramList

# This function is used to check the current answer list for empty values. If it finds one, it replaces it with the given string
def checkNoAnswer(answerList):
    for i, answeredQuestion in enumerate(answerList):
        print(f"CURRENT ANSWEREDQUESTION HAS THIS VALUE: {answeredQuestion}")
        if (answeredQuestion == ""):
            print("REPLACING CURRENT EMPTY QUESTION!")
            answerList[i] = "not answered"
    return answerList

# This function will handle the answer submission. First it will build the query values, then the answer info, and then the answer data will be stored
def submitAnswers(isCorrect, answerData, scoreId, attemptNum, questionId, questionTrack, currentStageNum, cursor, mysql):
    # Check if the user actually had any answers. If not, skip to the else statement without interacting with the database.
    if len(isCorrect) > 0:
        # Assign valueQuery to the returned array
        valueQuery = buildValueQuery(answerData)
        # Then assign paramList to the array that was built in the function
        paramList = buildAnswerData(answerData, scoreId, attemptNum, questionId, isCorrect, questionTrack, currentStageNum)
        # Build the query using valueQuery, with paramList as its values
        storeQuery = f"INSERT INTO user_answers(score_id, attempt_id, question_id, response_order, stage_answered, user_answer_text, user_was_correct) VALUES {" ".join(valueQuery)}"

        cursor.execute(storeQuery, tuple(paramList))
        mysql.commit()
        print("SUCCESSFULLY STORED THE ANSWERS!")
    else:
        print("USER SUBMITTED NO ANSWERS, SO THERE IS NOTHING TO STORE.")

    # Finally, close the cursor and return the data
    cursor.close()
    mysql.close()
