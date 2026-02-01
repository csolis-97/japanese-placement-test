-- database creation section

-- DROP DATABASE if it exists
DROP DATABASE IF EXISTS test_database;

-- CREATE test_database
CREATE DATABASE test_database;
USE test_database;

-- reserved_names table section

-- Drop the reserved_names table if it exists
DROP TABLE IF EXISTS reserved_names;

-- Create the reserved_names table

CREATE TABLE reserved_names (
    name_id INT AUTO_INCREMENT PRIMARY KEY,
    reserved_name VARCHAR(255) NOT NULL UNIQUE,
    reserved_desc VARCHAR(255) NOT NULL
);

-- users table section

-- Drop the users table if it exists
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    verified_status BOOLEAN,
    created_at DATETIME NOT NULL
);

-- unverified_users table section
DROP TABLE IF EXISTS unverified_users;

-- Create the unverified_users table
CREATE TABLE unverified_users (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL
);

-- questions table section

-- Drop the questions table if it exists
DROP TABLE IF EXISTS questions;

-- Create the questions table
CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(255) NOT NULL,
    question_body VARCHAR(255) NOT NULL,
    question_level ENUM ('Beginner I', 'Beginner II', 'Intermediate I', 'Intermediate II', 'Advanced') NOT NULL
);

-- answers table section

-- Drop the answers table if it exists
DROP TABLE IF EXISTS answers;

-- Create the answers table
CREATE TABLE answers (
    question_id INT NOT NULL,
    answer_id INT NOT NULL,
    answer_text VARCHAR(255) NOT NULL,
    correct_answer BOOLEAN NOT NULL,
    PRIMARY KEY (question_id, answer_id),
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- scores table section

-- Drop the scores table if it exists
DROP TABLE IF EXISTS scores;

CREATE TABLE scores (
    score_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_score FLOAT NOT NULL,
    entrance_level ENUM ('Beginner I', 'Beginner II', 'Intermediate I', 'Intermediate II', 'Advanced') NOT NULL,
    test_date DATETIME NOT NULL,
    PRIMARY KEY (score_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- user_answers table section

-- Drop the user_answers table if it exists
DROP TABLE IF EXISTS user_answers;

-- Create the user_answers table
CREATE TABLE user_answers (
    score_id INT NOT NULL,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    response_order INT NOT NULL,
    user_answer_text VARCHAR(255) NOT NULL,
    user_was_correct BOOLEAN NOT NULL,
    PRIMARY KEY (score_id, attempt_id, question_id),
    FOREIGN KEY (score_id) REFERENCES scores(score_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- messages table section
DROP TABLE IF EXISTS messages;

-- Create the messages table
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    message_topic VARCHAR(255) NOT NULL,
    message_body VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- message recipients table section
DROP TABLE IF EXISTS message_recipients;

-- Create the message_recipients table
CREATE TABLE message_recipients (
    message_id INT NOT NULL,
    recipient_id INT NOT NULL,
    PRIMARY KEY (message_id, recipient_id),
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Database user creation section, not entirely sure if needed but just in case

-- Create the user and grant privileges
GRANT SELECT, INSERT, DELETE, UPDATE
ON test_database.*
TO root@localhost;
IDENTIFIED BY 'password';

-- Flush privilieges to ensure they are applied
FLUSH PRIVILEGES;

-- In case you need to alter the password, use this
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'password';
-- FLUSH PRIVILEGES;