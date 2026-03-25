from datetime import datetime, timezone
import uuid

# This function will take all the graded answers and check each stage to count how many were correct. Once that is done, correct percentages will be
# assigned to the proper index of a list, representing each stage. The overall average percentage alongside the aformentioned list are returned.
def calculateScore(levelList, questionTrack, isCorrect):
    # DEBUG CHECK THE LEVEL LIST INFO. question_id is index 0, question_level is index 1, and user_was_correct is index 2
    print(f"LENGTH OF THE LEVEL LIST IS AS FOLLOWS: {len(levelList)}")
    print(f"HERE ARE THE VALUES IN LEVEL LIST {levelList}")
    # NOW CALCULATE THE RESULTS
    # These variables will be used for determining the total score and which level the user should enter based on their responses
    totalQ = len(questionTrack)
    correctNum = 0

    # The index order for the two lists below is as follows: 0 = Stage 1, 1 = Stage 2, 
    # 2 = Stage 3, 3 = Stage 4, 4 = Stage 5
    correctArray = [0, 0, 0, 0, 0]

    print(f"ISCORRECT LOOKS LIKE THIS BEFORE ENUMERATION: {isCorrect}")
    # Iterate through the isCorrect dictionary values and increment correctNum for each True value contained within isCorrect
    for i, row in enumerate(levelList):
        # DEBUG FOR CHECKING THE CURRENT VALUE OF ISCORRECT
        print(f"CURRENT VALUE OF ISCORRECT AT ROW #{i} is {row['user_was_correct']}")
        print(row)
        print(f"CURRENT CORRECTNUM: {correctNum}")
        print(f"CURRENT QUESTION'S DIFFICULTY LEVEL IS THIS: {row['question_level']}")

        if i < 25 and i > 19:
            if row['user_was_correct'] == True:
                print("GOT STAGE 5 QUESTION RIGHT!")
                correctArray[4] = correctArray[4]+1
        elif i < 20 and i > 14:
            if row['user_was_correct'] == True:
                print("GOT STAGE 4 QUESTION RIGHT!")
                correctArray[3] = correctArray[3]+1
        elif i < 15 and i > 9:
            if row['user_was_correct'] == True:
                print("GOT STAGE 3 QUESTION RIGHT!")
                correctArray[2] = correctArray[2]+1
        elif i < 10 and i > 4:
            if row['user_was_correct'] == True:
                print("GOT STAGE 2 QUESTION RIGHT!")
                correctArray[1] = correctArray[1]+1
        elif i < 5:
            if row['user_was_correct'] == True:
                print("GOT STAGE 1 QUESTION RIGHT!")
                correctArray[0] = correctArray[0]+1

    # DEBUG FOR CHECKING CURRENT VALUES OF CORRECTARRAY AND TOTALQ
    print("TOTAL CORRECT")
    print(correctArray)
    print("TOTAL QUESTION NUMBER")
    print(totalQ)

    questionLength = len(questionTrack)
    # Level percent will be used to store the correct percentage per stage
    levelPercent = [0, 0, 0, 0, 0]
    averageTotal = 0.0
    correctNum = sum(correctArray)

    # Calculate the percentage of correct answers for each stage and store it in the proper index of levelPercent
    for i in range(len(levelPercent)):
        levelPercent[i] = ((correctArray[i] / (questionLength / 5)) * 100)
        print(f"THE CURRENT INDEX I IN LEVEL PERCENT IS THIS: {levelPercent[i]}")

    # RIGHT NOW TOTALSCORE IS MERELY AN AVERAGE OF PERCENT CORRECT, IF I DECIDE TO USE AN ACCURATE PERCENTAGE I WILL NEED DIFFERENT POINT VALUES PER CATEGORY!
    # ALTERNATIVELY, JUST SHOW x / 20 QUESTIONS CORRECT ON THE RESULTS SCREEN!
    # Finally, calculate the actual average. Since all stages have a total of five questions, just use the first index of the array
    averageTotal = (correctNum/questionLength) * 100
    # DEBUG FOR CHECKING THE RESULTING PERCENTAGE
    print(f"HERE IS THE AVERAGE TOTAL: {averageTotal}")
    print(f"HERE IS THE PERCENTAGE OF QUESTIONS CORRECT IN TOTAL PER CATEGORY {levelPercent}")
    print(f"HERE IS THE TOTAL NUMBER OF QUESTIONS PER CATEGORY {questionLength}")
    print(f"HERE IS THE TOTAL NUMBER OF QUESTIONS CORRECT {correctNum}")
    print(f"HERE IS THE TOTAL NUMBER OF QUESTIONS CORRECT PER CATEGORY {correctArray}")

    totalScore = averageTotal
    return totalScore


# This function will convert the date to the proper MySQL format before returning all of the necessary parameters needed to store
# The results
def finalizeSubmitParams(submitTime, totalScore, entranceLevel, urlId, scoreId):
    # NOW FINALIZE THE PARAMLIST
    # Empty the paramList again for future use
    paramList = []
    # DEBUG CHECK SUBMIT TIME VALUE
    print("SUBMIT TIME")
    print(submitTime)
    # Here, the string will be stripped of the T for Time, Z for the UTC offset, using datetime and fromisoformat
    # tempTime = datetime.fromisoformat(submitTime)
    serverTime = datetime.now(timezone.utc)
    # finalTime = str(tempTime)
    finalTime = str(serverTime)
    # DEBUG CHECK FINAL TIME VALUE
    print("FINAL TIME")
    print(finalTime)

    print("TOTAL SCORE")
    print(totalScore)
    print("ENTRANCE LEVEL")
    print(entranceLevel)
    # Set the paramList's arguments to totalScore, entranceLevel, and finalTime
    paramList = [totalScore, entranceLevel, finalTime, urlId, scoreId]
    print(paramList)
    return paramList

# This function will be used to check any suspicions submission times. That is, test submissions with a time difference between 
# more than 61 minutes from the start time, or less than 0 minutes from the start time. If it does, flag the record.
def timeCheck(submitTime, scoreId, cursor, mysql):
    # These values are in minutes
    TEST_DURATION = 5.0
    SUBMISSION_GRACE_PERIOD = 1.0

    # Make a snapshot of the current time and make sure it is in UTC.
    endTimeConvert = datetime.now(timezone.utc)
    endTime = endTimeConvert.astimezone(timezone.utc)
    print(f"THIS IS THE TIME THAT THE TEST WAS SUBMITTED: {endTime}")

    # Fetch the start_time of the current record with the given score_id and store it
    timeQuery = "SELECT S.start_time FROM scores S WHERE S.score_id = %s"
    cursor.execute(timeQuery, scoreId)
    startTimeData = cursor.fetchone()

    # Convert the start_time to the proper format and make sure it is also in UTC.
    startTimeConvert = datetime.fromisoformat(str(startTimeData['start_time']))
    startTime = startTimeConvert.replace(tzinfo = timezone.utc)
    print(f"THIS IS THE TIME THAT THE TEST WAS STARTED: {startTime}")

    # Calculate the difference, and then calculate the time delta between the endTime and startTime in minutes
    timeDiff = endTime - startTime
    print(f"HERE IS THE DIFFERENCE BETWEEN WHEN THE TEST WAS STARTED AND SUBMITTED IN SECONDS!: {timeDiff}")
    timeDelta = timeDiff.total_seconds() / 60
    print(f"HERE IS THE TIME DELTA OF THE START TIME AND END TIME IN MINUTES!: {timeDelta}")

    # Check that the time delta is not within the acceptable limits, a.k.a. that it lands somewhere equal to or below 0 
    # and greater than 61 minutes. If it is outside of these limits, then mark the test record as potential cheating.
    if timeDelta > (TEST_DURATION + SUBMISSION_GRACE_PERIOD) or timeDelta <= 0.0:
        print(f"SUSPICIOUS SUBMISSION!")
        messageString = "Test was not actually submitted after the timer was finished. Marked under suspicion of potential cheating."
        paramList = [messageString, scoreId]

        markQuery = "UPDATE scores S SET S.is_suspicious = 1, S.suspicious_reason = %s WHERE S.score_id = %s"
        cursor.execute(markQuery, tuple(paramList))
        mysql.commit()
        print(f"SUBMISSION WAS MARKED AS SUSPICIOUS IN THE DATABASE, BUT CONTINUE")

    # For anyone who tried to manipulate their system clock to evade the timer, this one goes out to you
    # Take the client's end time, convert it, and make sure it is in UTC.
    clientEndTimeConvert = datetime.fromisoformat(str(submitTime))
    clientEndTime = clientEndTimeConvert.astimezone(timezone.utc)
    print(f"THIS IS THE TIME THAT THE TEST WAS SUBMITTED, ACCORDING TO THE CLIENT: {clientEndTime}")

    # Calculate the difference between the client's supposed end time and the server's end time. Then calculate the delta in minutes
    clientTimeDiff = endTime - clientEndTime
    print(f"HERE IS THE DIFFERENCE BETWEEN WHEN THE TEST WAS SUBMITTED ACCORDING TO THE CLIENT AND ACCORDING TO THE BACKEND!: {clientTimeDiff}")
    clientTimeDelta = clientTimeDiff.total_seconds() / 60
    print(f"HERE IS THE TIME DELTA OF THE CLIENT SUBMISSION TIME AND THE BACKEND SUBMISSION TIME IN MINUTES!: {clientTimeDelta}")

    # Check that the time delta is not within the acceptable limits, a.k.a. that it lands somewhere below 0 or
    # is greater than a minute. If it is outside of these limits, mark the test record as cheating.
    if clientTimeDelta > (SUBMISSION_GRACE_PERIOD) or clientTimeDelta < 0.0:
        print(f"SUSPICIOUS SUBMISSION!")
        messageString = "User attempted to tamper with their local system's clock to fool the test timer. Marked for cheating."
        paramList = [messageString, scoreId]

        markQuery = "UPDATE scores S SET S.is_suspicious = 1, S.suspicious_reason = %s WHERE S.score_id = %s"
        cursor.execute(markQuery, tuple(paramList))
        mysql.commit()
        print(f"SUBMISSION WAS MARKED AS SUSPICIOUS IN THE DATABASE, BUT CONTINUE")

# This function is merely to check if the UUID is unique or not. If not, reassign a new one until it is unique.
def checkUUID(urlId, cursor):
    # Set the paramList, the query, and the flag for the while loop
    paramList = [urlId]
    duplicateQuery = "SELECT url_id FROM scores WHERE url_id = %s"
    notUnique = True

    # This will continue to loop until a unique UUID is found and the flag is set to false
    while (notUnique):
        cursor.execute(duplicateQuery, tuple(paramList))
        duplicateCheck = cursor.fetchone()
        if (duplicateCheck is not None):
            print("THE CURRENT UUID ALREADY EXISTS IN THE DATABASE, GENERATE A NEW ONE!")
            urlId = str(uuid.uuid4())
            print(f"NEW UUID: {urlId}")
            paramList = [urlId]
        # Unique UUID was found, exit the while loop
        else:
            print("THE CURRENT UUID DOES NOT EXIST IN THE DATABASE, ALL GOOD TO GO!")
            notUnique = False




