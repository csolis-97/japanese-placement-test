import datetime

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
    correctArray = [0, 0, 0, 0]

    print(f"ISCORRECT LOOKS LIKE THIS BEFORE ENUMERATION: {isCorrect}")
    # Iterate through the isCorrect dictionary values and increment correctNum for each True value contained within isCorrect
    for i, row in enumerate(levelList):
        # DEBUG FOR CHECKING THE CURRENT VALUE OF ISCORRECT
        print(f"CURRENT VALUE OF ISCORRECT AT ROW #{i} is {row['user_was_correct']}")
        print(row)
        print(f"CURRENT CORRECTNUM: {correctNum}")
        print(f"CURRENT QUESTION'S DIFFICULTY LEVEL IS THIS: {row['question_level']}")

        if i < 20 and i > 14:
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
    levelPercent = [0, 0, 0, 0]
    averageTotal = 0.0
    correctNum = sum(correctArray)

    # Calculate the percentage of correct answers for each stage and store it in the proper index of levelPercent
    for i in range(len(levelPercent)):
        levelPercent[i] = ((correctArray[i] / (questionLength / 4)) * 100)
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
    return totalScore, levelPercent


# This function will calculate the user's score based on how many questions they got correct, and decide their entrance level.
# After that is done, it will call finalizeSubmitParams
def calculateCorrect(questionTrack, levelPercent, correctArray, correctNum):
    # The index order for the list below is as follows: 0 = Stage 1, 1 = Stage 2, 
    # 2 = Stage 3, 3 = Stage 4, 4 = Stage 5
    # questionCount = [5, 5, 5, 5]
    questionLength = len(questionTrack)
    # Level percent will be used to store the correct percentage per stage
    levelPercent = [None, None, None, None]
    averageTotal = 0.0
    correctNum = 0

    # Calculate the percentage of correct answers for each stage and store it in the proper index of levelPercent
    for i in levelPercent:
        if i != 0:
            levelPercent[i] = ((correctArray[i] / (questionLength / 4)) * 100)
            print(f"THE CURRENT INDEX I IN LEVEL PERCENT IS THIS: {levelPercent[i]}")

    #for i, row in enumerate(questionCount):
    #    print(f"CURRENT VALUE OF I IN QUESTION COUNT IS {i}")
    #    print(f"CURRENT VALUE OF ROW IN QUESTION COUNT IS {row}")
    #    if row != 0:
    #        levelPercent[i] = ((correctArray[i]/questionCount[i]) * 100)
    #        print(f"THE CURRENT INDEX I IN LEVEL PERCENT IS THIS: {levelPercent[i]}")

    #for i, row in enumerate(levelPercent):
    #    print(f"CURRENT VALUE OF I IN LEVELPERCENT IS {i}")
    #    if row != None:
    #        # Since there are different amounts of correctly answered questions per category, use a weighted method.
    #        # The current percentage will be first divided by 100 to get a decimal value, then multipled by the 
    #        # current difficulty level's number of correctly answered questions and finally appeneded to correctNum. 
    #        correctNum = correctNum + ((row / 100) * correctArray[i])
    #        print(f"CURRENT CORRECTNUM: {correctNum}")
    #    else:
    #        print("No questions for this difficulty level were answered, so it is None.")

    # RIGHT NOW TOTALSCORE IS MERELY AN AVERAGE OF PERCENT CORRECT, IF I DECIDE TO USE AN ACCURATE PERCENTAGE I WILL NEED DIFFERENT POINT VALUES PER CATEGORY!
    # ALTERNATIVELY, JUST SHOW x / 20 QUESTIONS CORRECT ON THE RESULTS SCREEN!
    # Finally, calculate the actual average. Since all stages have a total of five questions, just use the first index of the array
    averageTotal = (correctNum/questionLength) * 100
    # DEBUG FOR CHECKING THE RESULTING PERCENTAGE
    print(f"HERE IS THE AVERAGE TOTAL: {averageTotal}")
    print(f"HERE IS THE PERCENTAGE OF QUESTIONS CORRECT IN TOTAL PER CATEGORY {levelPercent}")
    print(f"HERE IS THE TOTAL NUMBER OF QUESTIONS PER CATEGORY {questionLength}")
    print(f"HERE IS THE TOTAL NUMBER OF QUESTIONS CORRECT PER CATEGORY {correctArray}")

    totalScore = averageTotal
    return totalScore, levelPercent
    #return finalizeSubmitParams(submitTime, totalScore, entranceLevel)

# This will be used to place the user in the correct level based on how well they did on the exam using the values of stageArray and levelPercent
def decidePlacement(levelPercent, stageArray):
    # A list that contains the five difficulty levels as strings
    # Index 0 for Beginner I, 1 for Beginner II, 2 for Intermediate I, 3 for Intermediate II, 4 for Advanced
    diffList = ["Beginner I", "Beginner II", "Intermediate I", "Intermediate II", "Advanced"]

    if levelPercent[3] >= 80 and stageArray[3] != "Advanced":
        print("FIRST IF!")
        print("LAST STAGE GRADED AT OR ABOVE 80 AND WAS NOT ADVANCED!")
        for i, row in enumerate(diffList):
            print(f"CURRENT row IN DIFFLIST IS {row}")
            if row == stageArray[3]:
                print(f"ENTRANCE LEVEL TO BE USED IS {diffList[i+1]}")
                entranceLevel = diffList[i+1]
    elif levelPercent[3] >= 80 and stageArray[3] == "Advanced":
        print("SECOND IF!")
        print("LAST STAGE GRADED AT OR ABOVE 80 AND WAS ADVANCED!")
        print(f"ENTRANCE LEVEL TO BE USED IS {stageArray[3]}")
        entranceLevel = stageArray[3]
    elif levelPercent[3] >= 40 and levelPercent[3] < 80:
        print("THIRD IF!")
        print("LAST STAGE GRADED AT OR ABOVE 40 BUT LESS THAN 80!")
        print(f"ENTRANCE LEVEL TO BE USED IS {stageArray[3]}")
        entranceLevel = stageArray[3]
    elif levelPercent[3] >= 0 and levelPercent[3] < 40 and levelPercent[2] >= 40 and stageArray[3] != "Beginner I":
        print("FOURTH IF!")
        print("LAST STAGE GRADED AT OR ABOVE 0 BUT LESS THAN 40 AND WAS NOT BEGINNER I, THIRD STAGE GRADED AT OR ABOVE 40!")
        print(f"ENTRANCE LEVEL TO BE USED IS {stageArray[2]}")
        entranceLevel = stageArray[2]
    elif levelPercent[3] >= 0 and levelPercent[3] < 40 and levelPercent[2] >= 0 and levelPercent[2] < 40 and stageArray[3] != "Beginner I":
        print("FIFTH IF!")
        print("LAST STAGE GRADED AT OR ABOVE 0 BUT LESS THAN 40 AND WAS NOT BEGINNER I, THIRD STAGE GRADED AT OR ABOVE 0 BUT LESS THAN 40!")
        print(f"ENTRANCE LEVEL TO BE USED IS {stageArray[1]}")
        entranceLevel = stageArray[1]
    else:
        print ("ELSE IF!")
        print("LAST STAGE GRADED AT OR ABOVE 0 BUT LESS THAN 40 AND WAS BEGINNER I!")
        entranceLevel = "Beginner I"

    return entranceLevel


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