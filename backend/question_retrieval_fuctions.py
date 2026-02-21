# This function will determine the new difficultly level, depending on how well the user did on the previous stage
def difficultyLevel(wasCorrect, questionCategory):
    # Make a temporary string in case the difficulty level changes
    newCategory = ""

    # Increase difficulty if the answer was right, or stay at current difficulty
    if len(wasCorrect) == 1:
        print("START WITH BEGINNER I")
        newCategory = "Beginner I"
    elif sum(wasCorrect) >= 4:
        print("ANSWERS WERE RIGHT!")
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
    elif sum(wasCorrect) >= 2 and sum(wasCorrect) < 4:
        print("ANSWERS WERE PARTIALLY RIGHT!")
        print(f"Difficulty will stay at {questionCategory}!")
    # Else decrease difficulty if the answer was wrong, or stay at current difficulty
    else:
        print("ANSWERS WERE MOSTLY WRONG!")
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


# This function will be used to fetch four new questions, avoiding all previously used question_id
def fetchNewQuestion(cursor, questionCategory, questionTrack):
    # Use exclusionQuery to store previously used question_id and based on the length of questionTrack, and append the
    # previously used ids
    exclusionQuery = []
    if len(questionTrack) > 0:
        print("IF ID IS NOT USED")
        exclusionQuery = questionTrack
    else:
        print("ELSE ID IS 0")
        exclusionQuery = [0]

    print("CHECK PARAMLIST HERE!")

    # Move onto the query and select five distinct, new questions that exclude all previously id values and store the results
    questionQuery = f"SELECT DISTINCT Q.question_id FROM questions Q WHERE Q.question_level = %s AND Q.question_id NOT IN({", ".join(map(str, exclusionQuery))})" \
    "ORDER BY RAND() LIMIT 5"
    cursor.execute(questionQuery, questionCategory)
    queryId = cursor.fetchall()

    # Convert the format to one continous list of question_ids
    newId = [row['question_id'] for row in queryId]
    print(f"newId values: {newId}")

    # DEBUG FOR CHECKING NEWID
    print("NEW QUESTION_ID")
    print(newId)
    
    # Make a final query that will get all question and answer info for the five question_id that were previously retrieved, and return it
    newQuery = "SELECT A.question_id, A.answer_id, A.answer_text, Q.question_text, Q.question_body, " \
    "Q.question_level FROM questions Q, answers A WHERE Q.question_id = A.question_id AND " \
    f"Q.question_id IN ({", ".join(map(str, newId))}) ORDER BY A.answer_id"
    cursor.execute(newQuery)
    newQuestion = cursor.fetchall()

    return newQuestion