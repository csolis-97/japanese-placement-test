# This function will return a given test record's info based on the given params, specifically the url_id that was received.
def retrieveTestRecord(paramList, cursor, mysql):
    resultQuery = "SELECT S.score_id, U.attempt_id, S.total_score, S.entrance_level, S.end_time FROM scores S, user_answers U" \
    " WHERE S.score_id = U.score_id AND S.url_id = %s"

    #Execute the query with the parameters, store the first entry, close the cursor, and return
    cursor.execute(resultQuery, tuple(paramList))
    resultData = cursor.fetchone()
    cursor.close()
    mysql.close()

    # DEBUG Check the data retrieved from the database
    print("CURRENT RESULT RECORD DATA")
    print(resultData)

    # oldDate = str(resultData['end_time'])
    # DEBUG Check the format of old date
    # print("OLDDATE")
    # print(oldDate)

    # Use isoformat as it is the quickest way to format the date in the proper manner, add Z for UTC timezone
    finalDate = f"{resultData['end_time'].isoformat()}Z"
    # DEBUG Check the updated date
    # print("FINALDATE")
    # print(finalDate)
    # Set the new date in the resultData before sending
    resultData['end_time'] = finalDate
    return resultData


# This function will receive all the question and answer info that matches the value for the given score_id, in the order the user answered them.
def retrieveTestAnswers(paramList, cursor, mysql): 
    # This simple query will select all question and answer info only for the questions the user answered on their current attempt.
    # The DISTINCT keyword is used so that duplicate records are not obtained.
    answersQuery = "SELECT DISTINCT Q.question_id, Q.question_text, Q.question_text_furigana, Q.question_body, Q.question_body_furigana, " \
    "Q.question_level, Q.question_audio, A.answer_id, A.answer_text, A.answer_text_furigana, A.correct_answer, U.user_answer_text, " \
    "U.user_was_correct, U.response_order FROM questions Q, answers A, user_answers U, scores S WHERE Q.question_id = A.question_id AND " \
    "A.question_id = U.question_id AND U.score_id = S.score_id AND S.score_id = %s ORDER BY U.response_order"

    cursor.execute(answersQuery, paramList)
    answerData = cursor.fetchall()
    cursor.close()
    mysql.close()
    return answerData