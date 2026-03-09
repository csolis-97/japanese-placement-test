import pymysql
from flask import jsonify

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

def handleErrors(error):
    # Errors related to the input data being invalid
    if isinstance(error, pymysql.err.DatabaseError):
        print(f"An error occured while attempting to communicate with the database using the provided invalid values: {error}")
        return jsonify(error), 400
    # Errors related to conflicts with the data integrity of the database, i.e. duplicate keys
    if isinstance(error, pymysql.err.IntegrityError):
        print(f"An error occured with the integrity of the database while attempting to communicate with the database: {error}")
        return jsonify(error), 409
    # Errors related to incorrect programming, mySQL syntax, etc.
    if isinstance(error, pymysql.err.ProgrammingError):
        print(f"A programming error occured while attempting to communicate with the database: {error}")
        return jsonify(error), 500
    # Errors related to the database connection
    if isinstance(error, pymysql.err.OperationalError):
        print(f"An error occured while attempting to establish a connection to the database: {error}")
        return jsonify(error), 503
    # All other general errors related to pymysql and the database go here
    if isinstance(error, pymysql.err.MySQLError):
        print(f"An error occured with the database.")
        return jsonify(error), 500
    # All other general errors go here
    print(f"An error occured while the backend tried to communicate with the database: {error}")
    return jsonify(error), 500