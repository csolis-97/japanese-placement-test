import datetime

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

        '''Here, append the current answeredQuestion value to the list of questionId.
        The SQL query will expect a value for answer_text and then question_id in that order, so the list is set accordingly.'''
        paramList = [answerList, int(questionId)]
        checkQuestions(paramList, cursor, answerId, results)
    else: 
        for answeredQuestion in answerList :
            # DEBUG CHECK THE CURRENT QUESTION_ID VALUE
            print("HERE IS EACH QUESTION_ID")
            print(answeredQuestion)

            '''Here, append the current answeredQuestion value to the list of questionId.
            The SQL query will expect a value for answer_text and then question_id in that order, so the list is set accordingly.'''
            questionId.append(int(answeredQuestion))
            paramList = [answerList[answeredQuestion], int(answeredQuestion)]
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

# This function will determine the new difficultly level, depending on how well the user did on the previous question
def difficultyLevel(data, wasCorrect, questionCategory):
    # Make a temporary string in case the difficulty level changes
    newCategory = ""

    # Make sure that wasCorrect is actually a bool and if not, set it
    if type(wasCorrect) != bool:
        wasCorrect = data['was_correct'][0]
    # Increase difficulty if the answer was right, or stay at current difficulty
    if wasCorrect:
        print("ANSWER WAS RIGHT!")
        match questionCategory:
            case "Intermediate II":
                newCategory = "Advanced"
            case "Intermediate I":
                newCategory = "Intermediate II"
            case "Beginner II":
                newCategory = "Intermediate I"
            case "Beginner I":
                newCategory = "Beginner II"
            # Default case
            case _:
                print(f"Difficulty will stay at {questionCategory}!")
    # Else decrease difficulty if the answer was wrong, or stay at current difficulty
    else:
        print("ANSWER WAS WRONG!")
        match questionCategory:
            case "Advanced":
                newCategory = "Intermediate II"
            case "Intermediate II":
                newCategory = "Intermediate I"
            case "Intermediate I":
                newCategory = "Beginner II"
            case "Beginner II":
                newCategory = "Beginner I"
            # Default case
            case _:
                print(f"Difficulty will stay at {questionCategory}!")
    # If there was a change in the difficulty level, set it here
    if newCategory:
        questionCategory = newCategory
    # FOR DEBUG
    print(f"NEW CATEGORY TO BE USED IS: {questionCategory}")
    return questionCategory

# This function will be used to fetch a new question, avoiding all previously used question_id
def fetchNewQuestion(cursor, questionId, questionCategory, questionTrack):
    # Initialize paramList as empty and validId with a value of False
    paramList = []
    validId = False
    # Build part of the query, depending on whether there was a previous question_id or not
    if questionId > 0:
        print("IF ID IS NOT 0")
        idQuery = "AND Q.question_id != %s"
        paramList.append(questionCategory)
        paramList.append(questionId)
    else:
        print("ELSE ID IS 0")
        idQuery = ""
        paramList.append(questionCategory)

    print("CHECK PARAMLIST HERE!")

    # Append the paramList before moving onto the query and execution
    
    # Here a while loop will be used to query the database for a new question until it finds one that has not been used already
    while validId == False:
        # Determine which questions to query based on the question category and current question_id, build it, and execute.
        questionQuery = "SELECT Q.question_id FROM questions Q WHERE Q.question_level = %s" \
        f" {idQuery} ORDER BY RAND() LIMIT 1"
        cursor.execute(questionQuery, tuple(paramList))
        newId = cursor.fetchone()
        newId = int(newId['question_id'])

        # If the current question_id is not in the list of previously used questions, build a final query to get all the info
        # for the question_id, store it, and exit the while loop
        if newId not in questionTrack:
            print("NEW QUESTION_ID")
            print(newId)
            newQuery = "SELECT A.question_id, A.answer_id, A.answer_text, Q.question_text, Q.question_body, " \
            "Q.question_level FROM questions Q, answers A WHERE Q.question_id = A.question_id AND " \
            "Q.question_id = %s ORDER BY A.answer_id"
            cursor.execute(newQuery, newId)
            newQuestion = cursor.fetchall()
            validId = True
    return newQuestion

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
    print(groupedQuestions)
    # Set questions to groupedQuestions before returning. The keys are not needed, so just convert it to a list using the values.
    newQuestion = list(groupedQuestions.values())
    # DEBUG, PRINT THE FINAL VERSION OF THE DATA TO BE SENT TO THE FRONT END
    print("NEW DATA!")
    print(newQuestion)
    return newQuestion

# This function will calculate the user's score based on how many questions they got correct, and decide their entrance level.
# After that is done, it will call finalizeSubmitParams
def calculateScore(isCorrect, questionTrack, levelList, submitTime):
    # DEBUG CHECK THE LEVEL LIST INFO. question_id is index 0, question_level is index 1, and user_was_correct is index 2
    print(f"LENGTH OF THE LEVEL LIST IS AS FOLLOWS: {len(levelList)}")
    print(f"HERE ARE THE VALUES IN LEVEL LIST {levelList}")
    # NOW CALCULATE THE RESULTS
    # These variables will be used for determining the total score and which level the user should enter based on their responses
    totalQ = len(questionTrack)
    entranceLevel = ""
    totalScore = 0.0
    correctNum = 0

    # The index order for the two lists below is as follows: 0 = Beginner I, 1 = Beginner II, 2 = Intermediate I,
    # 3 = Intermediate II, 4 = Advanced
    correctArray = [0, 0, 0, 0, 0]
    questionCount = [0, 0, 0, 0, 0]
    print(f"ISCORRECT LOOKS LIKE THIS BEFORE ENUMERATION: {isCorrect}")
    # Iterate through the isCorrect dictionary values and increment correctNum for each True value contained within isCorrect
    for i, row in enumerate(levelList):
        # DEBUG FOR CHECKING THE CURRENT VALUE OF ISCORRECT
        print(f"CURRENT VALUE OF ISCORRECT AT ROW #{i} is {row['user_was_correct']}")
        print(row)
        print(f"CURRENT CORRECTNUM: {correctNum}")
        print(f"CURRENT QUESTION'S DIFFICULTY LEVEL IS THIS: {row['question_level']}")

        match row['question_level']: 
            case "Beginner I":
                questionCount[0] = questionCount[0]+1
                if row['user_was_correct'] == True:
                    print("GOT BEGINNER I QUESTION RIGHT!")
                    correctArray[0] = correctArray[0]+1
            case "Beginner II":
                questionCount[1] = questionCount[1]+1
                if row['user_was_correct'] == True:
                    print("GOT BEGINNER II QUESTION RIGHT!")
                    correctArray[1] = correctArray[1]+1
            case "Intermediate I":
                questionCount[2] = questionCount[2]+1
                if row['user_was_correct'] == True:
                    print("GOT INTERMEDIATE I QUESTION RIGHT!")
                    correctArray[2] = correctArray[2]+1
            case "Intermediate II":
                questionCount[3] = questionCount[3]+1
                if row['user_was_correct'] == True:
                    print("GOT INTERMEDIATE II QUESTION RIGHT!")
                    correctArray[3] = correctArray[3]+1
            case "Advanced":
                questionCount[4] = questionCount[4]+1
                if row['user_was_correct'] == True:
                    print("GOT ADVANCED QUESTION RIGHT!")
                    correctArray[4] = correctArray[4]+1

    # DEBUG FOR CHECKING CURRENT VALUES OF CORRECTNUM AND TOTALQ
    #print("TOTAL CORRECT")
    #print(correctNum)
    print("TOTAL QUESTION NUMBER")
    print(totalQ)
    levelPercent = [None, None, None, None, None]
    correctNum = 0
    questionNum = 0
    averageTotal = 0.0

    for i, row in enumerate(questionCount):
        print(f"CURRENT VALUE OF I IN QUESTION COUNT IS {i}")
        print(f"CURRENT VALUE OF ROW IN QUESTION COUNT IS {row}")
        if row != 0:
            levelPercent[i] = ((correctArray[i]/questionCount[i]) * 100)
            print(f"THE CURRENT INDEX I IN LEVEL PERCENT IS THIS: {levelPercent[i]}")

    for i, row in enumerate(levelPercent):
        print(f"CURRENT VALUE OF I IN LEVELPERCENT IS {i}")
        if row != None:
            # Since there are different amounts of correctly answered questions per category, use a weighted method.
            # The current percentage will be first divided by 100 to get a decimal value, then multipled by the 
            # current difficulty level's number of correctly answered questions and finally appeneded to correctNum. 
            correctNum = correctNum + ((row / 100) * correctArray[i])
            questionNum = questionNum + questionCount[i]
            print(f"CURRENT CORRECTNUM: {correctNum}")
            print(f"CURRENT QUESTIONUM: {questionNum}")
        else:
            print("No questions for this difficulty level were answered, so it is None.")

    # Finally, calculate the actual average.
    averageTotal = (correctNum/questionNum) * 100
    # DEBUG FOR CHECKING THE RESULTING PERCENTAGE
    print(f"HERE IS THE AVERAGE TOTAL: {averageTotal}")
    print(f"HERE IS THE PERCENTAGE OF QUESTIONS CORRECT IN TOTAL PER CATEGORY {levelPercent}")
    print(f"HERE IS THE TOTAL NUMBER OF QUESTIONS PER CATEGORY {questionCount}")
    print(f"HERE IS THE TOTAL NUMBER OF QUESTIONS CORRECT PER CATEGORY {correctArray}")



    # Here the totalScore is calculated, resulting in a percentage.
    # RIGHT NOW TOTALSCORE IS MERELY AN AVERAGE OF PERCENT CORRECT, IF I DECIDE TO USE AN ACCURATE PERCENTAGE I WILL NEED DIFFERENT POINT VALUES PER CATEGORY!
    # ALTERNATIVELY, JUST SHOW x / 20 QUESTIONS CORRECT ON THE RESULTS SCREEN!

    if levelPercent[4] != None and correctArray[4] >= (questionCount[4] / 2) and levelPercent[4] >= 50 and (levelPercent[3] > 75 or (correctArray[4] / 2) >= correctArray[3]):
        entranceLevel = "Advanced"
    elif levelPercent[3] != None and correctArray[3] >= (questionCount[3] / 2) and levelPercent[3] >= 50 and (levelPercent[2] > 75 or (correctArray[3] / 2) >= correctArray[2]):
        entranceLevel = "Intermediate II"
    elif levelPercent[2] != None and correctArray[2] >= (questionCount[2] / 2) and levelPercent[2] >= 50 and (levelPercent[1] == None or levelPercent[1] > 75 or (correctArray[2] / 2) >= correctArray[1]):
        entranceLevel = "Intermediate I"
    elif levelPercent[1] != None and correctArray[1] >= (questionCount[1] / 2) and levelPercent[1] >= 50 and (levelPercent[0] == None or levelPercent[0] > 75 or (correctArray[1] / 2) >= correctArray[0]):
        entranceLevel = "Beginner II"
    else:
        entranceLevel = "Beginner I" 

    totalScore = averageTotal
    return finalizeSubmitParams(submitTime, totalScore, entranceLevel)


# This function will convert the date to the proper MySQL format before returning all of the necessary parameters needed to store
# The results
def finalizeSubmitParams(submitTime, totalScore, entranceLevel):
    # NOW FINALIZE THE PARAMLIST
    # Empty the paramList again for future use
    paramList = []
    # DEBUG CHECK SUBMIT TIME VALUE
    print("SUBMIT TIME")
    print(submitTime)
    # Here, the string will be stripped of the T for Time, Z for the UTC offset, using datetime and fromisoformat
    tempTime = datetime.datetime.fromisoformat(submitTime)
    finalTime = str(tempTime)
    # DEBUG CHECK FINAL TIME VALUE
    print("FINAL TIME")
    print(finalTime)

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
    valueString = "(%s, %s, %s, %s, %s, %s),"
    valueQuery = []

    '''Enter a loop to properly build valueQuery. In order to insert the correct amount of values into the database, the for loop
    iterates until it reaches the length of answerLength and appends one of two strings to valueQuery. If the current index is 
    greater than or equal to answerLength-1, this is the last item in the answerList, so append the given string to properly
    close the INSERT() VALUES() statement that will be used in a momement. Otherwise, append anotherValueString. 
    '''
    for i in range(answerLength):
        if i >= answerLength-1:
            valueQuery.append("(%s, %s, %s, %s, %s, %s);")
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

def buildAnswerData(answerData, scoreId, attemptNum, questionId, isCorrect, questionTrack):
    # Initiate paramList
    paramList = []
    # Enter a for loop with enumeration in order to append the proper values that will be used as parameters for the query 
    # in paramList.
    if str(answerData):
        paramList.append(scoreId)
        paramList.append(attemptNum)
        # OLD DATA FORMAT paramList.append(questionId+1)
        paramList.append(questionId)
        paramList.append(len(questionTrack))
        paramList.append(answerData)
        paramList.append(isCorrect)
    else:
        for i, row in enumerate(answerData):
            paramList.append(scoreId)
            paramList.append(attemptNum)
            # OLD DATA FORMAT paramList.append(questionId+1)
            paramList.append(questionId)
            paramList.append(questionTrack[i])
            paramList.append(answerData[i])
            paramList.append(isCorrect)

    # DEBUG FOR THE PARAMLIST
    print("HERE IS THE FINAL PARAMLIST")
    print(paramList)
    return paramList