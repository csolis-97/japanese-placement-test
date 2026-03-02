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

-- Create the users table, for now passwords and usernames are unncessary so they are not marked as NOT NULL
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    username VARCHAR(255) UNIQUE,
    fullname VARCHAR(255) NOT NULL,
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
    test_status ENUM ('IN_PROGRESS', 'COMPLETED') NOT NULL,
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
    stage_answered INT NOT NULL,
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



-- ============================================================================
-- BEGINNER I: LESSONS 1-5 (25 questions total)
-- ============================================================================

INSERT INTO questions (question_text, question_body, question_level) VALUES
('Lesson 1: Translation', 'What does "わたしはマイクです" mean?', 'Beginner I'),
('Lesson 1: Particle usage', 'Which particle marks the topic (main idea) of a sentence?', 'Beginner I'),
('Lesson 1: Vocabulary', 'In which of the following situations is it incorrect to use ~さん after the name of a person?', 'Beginner I'),
('Lesson 2: Vocabulary', 'What does "ここ" mean?', 'Beginner I'),
('Lesson 4: Vocabulary', 'How do you say "now" in Japanese?', 'Beginner I'),
('Lesson 4: Vocabulary', 'What does "おきます" mean?', 'Beginner I'),
('Lesson 2: Translation', 'How would you say, "This book is my book."?', 'Beginner I'),
('Lesson 5: Particle usage', 'Which particle indicates the means or method by which you do something?', 'Beginner I'),
('Lesson 1: Translation', 'What does "はじめまして" mean?', 'Beginner I'),
('Lesson 3: Particle usage', 'Which particle is used to connect two or more nouns in a list?', 'Beginner I'),
('Lesson 5: Translation', 'How do you say, "I will go to Tokyo with my family." in Japanese?', 'Beginner I'),
('Lesson 2: Vocabulary', 'What does "トイレはあそこです。" mean?', 'Beginner I'),
('Lesson 1: Vocabulary', 'In formal speech, what is the most proper way of negating a noun?', 'Beginner I'),
('Lesson 1: Particle usage', 'Which of the following sentences uses も properly?', 'Beginner I'),
('Lesson 3: Vocabulary', 'How do you say "over there" in Japanese?', 'Beginner I'),
('Lesson 4: Vocabulary', 'What does "あさ" mean?', 'Beginner I'),
('Lesson 1: Particle usage', 'How is the particle "か" used?', 'Beginner I'),
('Lesson 5: Vocabulary', 'What does "かえります" mean?', 'Beginner I'),
('Lesson 4: Translation', 'Which does the sentence, "じゅうじからごじまでたべません。" mean?', 'Beginner I'),
('Lesson 1: Translation', 'What does "ありがとうございます" mean?', 'Beginner I'),
('Lesson 2: Particle usage', 'Which particle is used to describe one noun with another noun?', 'Beginner I'),
('Lesson 3: Vocabulary', 'Which noun is used when asking which country someone is from?', 'Beginner I'),
('Lesson 4: Vocabulary', 'What does "きのう" mean?', 'Beginner I'),
('Lesson 2: Vocabulary', 'When responding to a question in the affirmative, which of the following is used?', 'Beginner I'),
('Lesson 4: Particle usage', 'Which particle is used with time?', 'Beginner I');

INSERT INTO answers (question_id, answer_id, answer_text, correct_answer) VALUES
(1, 1, 'I am Mike.', TRUE),
(1, 2, 'I know Mike.', FALSE),
(1, 3, 'He is Mike.', FALSE),
(1, 4, 'This is Mike.', FALSE),

(2, 1, 'を', FALSE),
(2, 2, 'は', TRUE),
(2, 3, 'が', FALSE),
(2, 4, 'に', FALSE),

(3, 1, 'When talking to your parents', FALSE),
(3, 2, 'When talking about your co-workers', FALSE),
(3, 3, 'When talking about yourself', TRUE),
(3, 4, 'When talking to your neighbor', FALSE),

(4, 1, 'here', TRUE),
(4, 2, 'there', FALSE),
(4, 3, 'over there', FALSE),
(4, 4, 'where', FALSE),

(5, 1, 'きょう', FALSE),
(5, 2, 'いま', TRUE),
(5, 3, 'あした', FALSE),
(5, 4, 'きのう', FALSE),

(6, 1, 'to wake up', TRUE),
(6, 2, 'to sleep', FALSE),
(6, 3, 'to eat', FALSE),
(6, 4, 'to drink', FALSE),

(7, 1, 'ほんはこのわたしです。', FALSE),
(7, 2, 'ほんはこれのわたしです。', FALSE),
(7, 3, 'このほんはわたしのほんです。', TRUE),
(7, 4, 'これほんはわたしのほんです。', FALSE),

(8, 1, 'は', FALSE),
(8, 2, 'を', FALSE),
(8, 3, 'が', FALSE),
(8, 4, 'で', TRUE),

(9, 1, 'Good morning', FALSE),
(9, 2, 'Nice to meet you', TRUE),
(9, 3, 'Thank you', FALSE),
(9, 4, 'Goodbye', FALSE),

(10, 1, 'で', FALSE),
(10, 2, 'は', FALSE),
(10, 3, 'と', TRUE),
(10, 4, 'ね', FALSE),

(11, 1, 'かぞくととうきょうへいきます。', TRUE),
(11, 2, 'かぞくはとうきょうにいきました。', FALSE),
(11, 3, 'かぞくでとうきょうへいきます。', FALSE),
(11, 4, 'かぞくがとうきょうにいきませんでした。', FALSE),

(12, 1, 'The toilet is over here.', FALSE),
(12, 2, 'The toilet is way over there.', TRUE),
(12, 3, 'The toilet is that way.', FALSE),
(12, 4, 'This is not a toilet.', FALSE),

(13, 1, 'じゃない', FALSE),
(13, 2, 'ではない', FALSE),
(13, 3, 'じゃありません', FALSE),
(13, 4, 'ではありません', TRUE),

(14, 1, 'わたしもがくせいです。ミラーさんもきょうしです。', FALSE),
(14, 2, 'わたしもいしゃです。ミラーさんはいしゃです。', FALSE),
(14, 3, 'わたしはけんきゅうしゃです。ミラーさんもけんきゅうしゃです。', TRUE),
(14, 4, 'わたしはぎんこういんです。わたしもかいしゃいんです。', FALSE),

(15, 1, 'ここ', FALSE),
(15, 2, 'あそこ', FALSE),
(15, 3, 'どこ', FALSE),
(15, 4, 'そこ', TRUE),

(16, 1, 'morning', TRUE),
(16, 2, 'afternoon', FALSE),
(16, 3, 'evening', FALSE),
(16, 4, 'night', FALSE),

(17, 1, 'For answering questions', FALSE),
(17, 2, 'To explain what something means', FALSE),
(17, 3, 'For emphasis', FALSE),
(17, 4, 'To ask a question', TRUE),

(18, 1, 'to go', FALSE),
(18, 2, 'to go home', TRUE),
(18, 3, 'to come', FALSE),
(18, 4, 'to leave', FALSE),

(19, 1, 'I eat from 10 to 5.', FALSE),
(19, 2, 'I sleep from 10 to 5.', FALSE),
(19, 3, 'I do not eat from 10 to 5.', TRUE),
(19, 4, 'I do not rest from 10 to 5.', FALSE),

(20, 1, 'Excuse me', FALSE),
(20, 2, 'You are welcome', FALSE),
(20, 3, 'I am sorry', FALSE),
(20, 4, 'Thank you', TRUE),

(21, 1, 'は', FALSE),
(21, 2, 'を', FALSE),
(21, 3, 'の', TRUE),
(21, 4, 'が', FALSE),

(22, 1, 'なん', FALSE),
(22, 2, 'だれ', FALSE),
(22, 3, 'どこ', TRUE),
(22, 4, 'いつ', FALSE),

(23, 1, 'today', FALSE),
(23, 2, 'yesterday', TRUE),
(23, 3, 'tomorrow', FALSE),
(23, 4, 'now', FALSE),

(24, 1, 'いいえ、そうです。', FALSE),
(24, 2, 'はい、こうです。', FALSE),
(24, 3, 'いいえ、こうではありません。', FALSE),
(24, 4, 'はい、そうです。', TRUE),

(25, 1, 'を', FALSE),
(25, 2, 'で', FALSE),
(25, 3, 'へ', FALSE),
(25, 4, 'に', TRUE);

-- ============================================================================
-- BEGINNER II: LESSONS 6-10 (25 questions total)
-- ============================================================================

INSERT INTO questions (question_text, question_body, question_level) VALUES
('Lesson 10: Particle identification', 'When using あります・います to describe that something exists, which particle is used to denote where said person/thing exists?', 'Beginner II'),
('Lesson 7: Grammar usage', 'Which of the following is the correct way to say that your father gave Tanaka a book?', 'Beginner II'),
('Lesson 6: Particle identification', 'Which particle marks the direct object in the following sentence: あしたは山田先生がきょうしつでえいごをおしえます。?', 'Beginner II'),
('Lesson 8: Adjective conjugation', 'How do you conjugate "たかいです" into the negative form?', 'Beginner II'),
('Lesson 6: Translation', ' How would you say, "Would you like eat lunch together the day after tomorrow?" in Japanese?', 'Beginner II'),
('Lesson 9: Grammar usage', 'If you wanted to ask Kawada why she dislikes baseball, how would you ask that in Japanese?', 'Beginner II'),
('Lesson 10: Translation', 'What does "つくえのうえ" mean?', 'Beginner II'),
('Lesson 8: Vocabulary', 'If you wanted to ask someone what kind of books they like, which question word would you use?', 'Beginner II'),
('Lesson 6: Grammar usage', 'Which noun cannot be used as the direct object of the verb する when saying that you do something?', 'Beginner II'),
('Lesson 10: Vocabulary', 'Which location word would you use to say that something is in the middle of two things?', 'Beginner II'),
('Lesson 8: Vocabulary', 'Which of the following expressions is used to express agreement or sympathy?', 'Beginner II'),
('Lesson 7: Translation', 'What does きむらくん、もう中国ごのしゅくだいをしましたか? mean in English?', 'Beginner II'),
('Lesson 8: Adjective conjugation', 'How do you make you say the following in Japanese? Miller is a nice person.', 'Beginner II'),
('Lesson 8: Grammar usage', 'If you want to show contrast between two statements, which particle would you use?', 'Beginner II'),
('Lesson 9: Translation', 'What does すみません、日本ごがよくわかりませんからかんじをかきません。mean in English?', 'Beginner II'),
('Lesson 9: Grammar usage', 'How would you say, "I do not like cooking very much because I am not good at it" in Japanese?', 'Beginner II'),
('Lesson 10: Particle usage', 'If you wanted to give a non-exhaustive list of examples of things in a list, which particle would you use?', 'Beginner II'),
('Lesson 7: Particle usage', 'Which particle would be used in the following sentence: 「ありがとうございます」はえいご＿何ですか。', 'Beginner II'),
('Lesson 7: Vocabulary', 'Which verb is used when you receive something from someone?', 'Beginner II'),
('Lesson 8: Adjectives', 'Which type of adjective is "きれい"?', 'Beginner II'),
('Lesson 9: Vocabulary', 'Which adverb would you use to say that you often do something?', 'Beginner II'),
('Lesson 10: Vocabulary', 'What is the difference between あります and います?', 'Beginner II'),
('Lesson 6: Translation', 'What does the following sentence mean in English? にはでおさけをのみましょう', 'Beginner II'),
('Lesson 7: Grammar pattern', 'What particle comes after the person receiving something when using the verb "あげます"?', 'Beginner II'),
('Lesson 10: Translation', 'What does 本はベッドのしたにありますか mean in English?', 'Beginner II');

INSERT INTO answers (question_id, answer_id, answer_text, correct_answer) VALUES
(26, 1, 'は', FALSE),
(26, 2, 'を', FALSE),
(26, 3, 'に', TRUE),
(26, 4, 'で', FALSE),

(27, 1, '田中さんがちちに本をくれました', FALSE),
(27, 2, 'ちちは田中さんに本をあげました。', TRUE),
(27, 3, '田中さんはちちに本をあげました。', FALSE),
(27, 4, 'ちちは田中さんに本をもらいました。', FALSE),

(28, 1, 'を', TRUE),
(28, 2, 'が', FALSE),
(28, 3, 'で', FALSE),
(28, 4, 'は', FALSE),

(29, 1, 'たかくではありません', FALSE),
(29, 2, 'たかくないです', TRUE),
(29, 3, 'たかいじゃないです', FALSE),
(29, 4, 'たかないです', FALSE),

(30, 1, 'いっしょに昼ごはんにあさってをたべますか。', FALSE),
(30, 2, 'たべますはあさっての昼ごはんにいっしょですか。', FALSE),
(30, 3, 'あさってはいっしょに昼ごはんがたべませんか。', FALSE),
(30, 4, 'あさっていっしょに昼ごはんをたべませんか。', TRUE),

(31, 1, '山田さん、どうしてやきゅうがきらいですか。', FALSE),
(31, 2, '川田さん、どうしてやさいがきらいですか。', FALSE),
(31, 3, '川田さん、どうしてやきゅうがきらいですか。', TRUE),
(31, 4, 'どうして、山田さんはやきゅうがきらいですか。', FALSE),

(32, 1, 'beneath the desk', FALSE),
(32, 2, 'next to the desk', FALSE),
(32, 3, 'on top of the desk', TRUE),
(32, 4, 'inside the desk', FALSE),

(33, 1, '何', FALSE),
(33, 2, 'どちら', FALSE),
(33, 3, 'どれ', FALSE),
(33, 4, 'どんな', TRUE),

(34, 1, 'ドライブ', FALSE),
(34, 2, 'ビール', TRUE),
(34, 3, '何', FALSE),
(34, 4, 'しゅくだい', FALSE),

(35, 1, 'となり', FALSE),
(35, 2, 'あいだ', TRUE),
(35, 3, 'そと', FALSE),
(35, 4, 'ちかく', FALSE),

(36, 1, 'そうですかね', FALSE),
(36, 2, 'そうですね', TRUE),
(36, 3, 'どうですね', FALSE),
(36, 4, 'そうですか', FALSE),

(37, 1, 'Kimura, did you already lose your homework?', FALSE),
(37, 2, 'Has Kimura started doing his homework already?', FALSE),
(37, 3, 'Kimura, have you done your homework yet?', TRUE),
(37, 4, 'My friend Kimura has already finished his homework.', FALSE),

(38, 1, 'ミラーさんはしんせつ人です', FALSE),
(38, 2, 'ミラーさんはしんせつな人ですか。', FALSE),
(38, 3, 'ミラーさんはしんせつな人です。', TRUE),
(38, 4, 'ミラーさんをしんせつな人です。', FALSE),

(39, 1, 'は', FALSE),
(39, 2, 'で', FALSE),
(39, 3, 'へ', FALSE),
(39, 4, 'が', TRUE),

(40, 1, 'Sorry, I do not speak Japanese because I do not understand Japanese very well.', FALSE),
(40, 2, 'Sorry, I do not write kanji because I do not understand Japanese very much.', TRUE),
(40, 3, 'Sorry, I  write kanji because I do not understand Japanese very well.', FALSE),
(40, 4, 'Sorry, I do not understand Japanese that well because I do not write kanji.', FALSE),

(41, 1, 'りょうりがあまりすきではありませんから、りょうりがへたです。', FALSE),
(41, 2, 'りょうりがわかりませんから、りょうりがあまりすきじゃないです。', FALSE),
(41, 3, 'りょうりがへたです。りょうりがあまりすきじゃありませんから。', FALSE),
(41, 4, 'りょうりがへたですから、りょうりがあまりすきではありません。', TRUE),

(42, 1, 'は', FALSE),
(42, 2, 'や', TRUE),
(42, 3, 'と', FALSE),
(42, 4, 'で', FALSE),

(43, 1, 'を', FALSE),
(43, 2, 'へ', FALSE),
(43, 3, 'で', TRUE),
(43, 4, 'や', FALSE),

(44, 1, 'おくります', FALSE),
(44, 2, 'くれます', FALSE),
(44, 3, 'あげます', FALSE),
(44, 4, 'もらいます', TRUE),

(45, 1, 'い-adjective', FALSE),
(45, 2, 'な-adjective', TRUE),
(45, 3, 'adverb', FALSE),
(45, 4, 'noun', FALSE),

(46, 1, 'とても', FALSE),
(46, 2, 'よく', TRUE),
(46, 3, 'たくさん', FALSE),
(46, 4, 'だいたい', FALSE),

(47, 1, 'あります is used for living things except plants, います is used for inanimate objects and plants.', FALSE),
(47, 2, 'あります is used for inanimate objects and plants, います is used for living things except plants.', TRUE),
(47, 3, 'あります is used for inanimate objects, います is used for living things.', FALSE),
(47, 4, 'They are interchangeable.', FALSE),

(48, 1, 'Will you drink in the garden?', FALSE),
(48, 2, 'Shall we drink in the living room?', FALSE),
(48, 3, 'I drink in the living room.', FALSE),
(48, 4, 'Shall we drink in the garden?', TRUE),

(49, 1, 'を', FALSE),
(49, 2, 'が', FALSE),
(49, 3, 'に', TRUE),
(49, 4, 'で', FALSE),

(50, 1, 'Is the pet under the book?', FALSE),
(50, 2, 'Is the textbook under the bed?', FALSE),
(50, 3, 'Is the book under the bed?', TRUE),
(50, 4, 'Is the pet under the bed?', FALSE);

-- PART 2: INTERMEDIATE I (27 questions total)
-- ============================================================================
-- INTERMEDIATE I: LESSONS 11-18
-- ============================================================================

INSERT INTO questions (question_text, question_body, question_level) VALUES
('Lesson 11: Translation', 'What is the meaning of the meaning of the following in English? ６か月に４かいぐらいきっさてんに行きます。', 'Intermediate I'),
('Lesson 12: Conjugation', 'What is the proper way of saying "The sukiyaki was very tasty." in Japanese?', 'Intermediate I'),
('Lesson 13: Grammar usage', 'How would you change the following sentence using the たい form to express what you want to do with いきます? どこか食べに行きますからつよいお酒を飲みません。', 'Intermediate I'),
('Lesson 14: Grammar usage', 'What does ～てください mean?', 'Intermediate I'),
('Lesson 14: Conjugation', 'What is the て-form of the verb 行きます?', 'Intermediate I'),
('Lesson 15: Particles', 'Which of the following particles is used to indicate the change in location of a person/thing resulting from an action?', 'Intermediate I'),
('Lesson 14: Translation', 'How would you say the following in Japanese? Excuse me, I am going to sleep so could you please turn off the light?', 'Intermediate I'),
('Lesson 15: Translation', 'How do you express "I do not know that person so do not tell him our address." in Japanese?', 'Intermediate I'),
('Lesson 18: Translation', 'What is the correct way to translate the following into English? 高いホテルではへやをよやくしたいですが午後９時前によやくすることがなかなかできません。', 'Intermediate I'),
('Lesson 12: Grammar usage', 'What is the following sentences means "Spanish is easier than Japanese." ?', 'Intermediate I'),
('Lesson 14: Grammar usage', 'Which of the following sentences uses ～ています to correctly describe an ongoing action?', 'Intermediate I'),
('Lesson 16: Grammar usage', 'Which of the following sentences is the proper way of saying you will do something after using ～てから?', 'Intermediate I'),
('Lesson 11: Counters', 'Which of the following sentences showcases the proper use of quantifiers (numbers with counter suffixes)?', 'Intermediate I'),
('Lesson 12: Grammar usage', 'Which of the following comparison sentences properly asks which of the two items is more ~ (adjective quality) than the other?', 'Intermediate I'),
('Lesson 12: Conjugation', 'What is the correct way of saying 今日はあめではありませんからうみにいきます in the past tense?', 'Intermediate I'),
('Lesson 14: Grammar usage', 'Which of the following particles should be used in the following sentence that describes a phenomenon through the five senses? 外ではあめ＿ふっていますからかさをかしましょうか', 'Intermediate I'),
('Lesson 15: Grammar usage', 'Which of the following verbs does not express a state or a habitual action when used in the form ～ています?', 'Intermediate I'),
('Lesson 16: Particles', 'Which particle is used when describing the starting point of actions like でます and おります? ', 'Intermediate I'),
('Lesson 17: Grammar usage', 'Which of the following sentences can be translated as "You must pay by Friday next week, so please do not forget." ?', 'Intermediate I'),
('Lesson 18: Grammar usage', 'When talking about what your hobby is using a verb, what would you attach after the verb in the dictionary form?', 'Intermediate I'),
('Lesson 11: Translation', 'How would you say the following in Japanese? "There are only three people who are busy in this room."', 'Intermediate I'),
('Lesson 12: Translation', 'How would you ask somebody the following question in Japanese: "Who is the tallest person in your family?" ?', 'Intermediate I'),
('Lesson 13: Grammar usage', 'Which of the following sentences showcases the proper way to use ほしい?', 'Intermediate I'),
('Lesson 16: Translation', 'What is the proper way of saying the following sentence in Japanese? Kitagawa is young, has big eyes and long hair. Nishikawa is also young and has big eyes, but she has short hair.', 'Intermediate I'),
('Lesson 15: Grammar usage', 'What is the speaker saying in the following sentence? しつれいですが、しやくしょの中では写真をとってもいいですか。', 'Intermediate I'),
('Lesson 16: Translation', 'How would you ask somebody how to make a phone call to your friend in Japanese?', 'Intermediate I'),
('Lesson 17: Translation', 'What does the following sentence mean in English? げつようびは来なくてもいいですがすいようびは来なければなりません。', 'Intermediate I');

INSERT INTO answers (question_id, answer_id, answer_text, correct_answer) VALUES
(51, 1, 'I go to the mountains about six times every four months.', FALSE),
(51, 2, 'I visit the shrine approximately four times every six months.', FALSE),
(51, 3, 'I go to the cafe around four times every six months.', TRUE),
(51, 4, 'I visit the ocean at least six times every four months.', FALSE),

(52, 1, 'すきやきはとてもおいしかったでした。', FALSE),
(52, 2, 'すきやきはとてもおいしかったです。', TRUE),
(52, 3, 'すきやきはとてもおいしいでした。', FALSE),
(52, 4, 'すきやきはとてもおしくでした。', FALSE),

(53, 1, 'どこか食べに行きたくないですからつよいお酒を飲みません。', FALSE),
(53, 2, 'どこか食べに行きたくないですからつよいお酒を飲みます。', FALSE),
(53, 3, 'どこか食べに行きたいですからつよいお酒を飲みません。', TRUE),
(53, 4, 'どこか食べに行きたいですからつよいお酒を飲みます。', FALSE),

(54, 1, 'Must not do ~', FALSE),
(54, 2, 'Have to do ~', FALSE),
(54, 3, 'Can I do ~', FALSE),
(54, 4, 'Please do ~', TRUE),

(55, 1, '行いて', FALSE),
(55, 2, '行って', TRUE),
(55, 3, '行きて', FALSE),
(55, 4, '行くて', FALSE),

(56, 1, 'を', FALSE),
(56, 2, 'に', TRUE),
(56, 3, 'へ', FALSE),
(56, 4, 'は', FALSE),

(57, 1, 'でんきをけしてください。すみませんが、いまからねますから。', FALSE),
(57, 2, 'すみませんが、でんきをけしてくださいからいまからねます。', FALSE),
(57, 3, 'すみませんが、いまからねますからでんきをけしてください。', TRUE),
(57, 4, 'でんきをけしてください。いまからねますからすみません。', FALSE),

(58, 1, 'その人をしってもいいですからじゅうしょをおしえてはいけません。', FALSE),
(58, 2, 'その人をしりませんからじゅうしょをおしえてもいいです。', FALSE),
(58, 3, 'その人をしりませんからじゅうしょをおしえてはいけません。', TRUE),
(58, 4, 'その人をしっていませんからじゅうしょをおしえてはいけません。', FALSE),

(59, 1, 'I want to book a room at an expensive hotel, but it is quite hard to do so after 9 a.m.', FALSE),
(59, 2, 'I want to book a room at a tall hotel, but it is quite hard to do so after 9 p.m.', FALSE),
(59, 3, 'I want to book a room at an expensive hotel, but it is quite hard to do so before 9 p.m.', TRUE),
(59, 4, 'I want to book a room at a tall hotel, but it is quite hard to do so before 9 a.m.', FALSE),

(60, 1, '日本語はスペイン語よりかんたんです。', FALSE),
(60, 2, '日本語はスペイン語よりむずかしいです。', FALSE),
(60, 3, 'スペイン語は日本語よりかんたんです。', TRUE),
(60, 4, 'スペイン語は日本語よりむずかしいです。', FALSE),

(61, 1, 'おとうとはきのう日本の本をあけています。', FALSE),
(61, 2, '母は今そこのカフェで食べています。', TRUE),
(61, 3, 'いもうとはしごとであしたいそいでいました。', FALSE),
(61, 4, '父は毎日いえの外に車をとめていませんでした。', FALSE),

(62, 1, 'バスをおりて大学にはいってからテーブルにパソコンをおいてはいけません。', FALSE),
(62, 2, '昼ごはんをつくって先生をよんでからけんきゅうしにいきます。', TRUE),
(62, 3, 'お金を下ろします。ボタンをおしてカードをいれてからです。', FALSE),
(62, 4, 'シャワーをあびてからドアをしめてからでんしゃにのります。', FALSE),

(63, 1, '本はページのさんまいを読みました。', FALSE),
(63, 2, '一人は子どもがあります。', FALSE),
(63, 3, '車をいちだい買いました。', TRUE),
(63, 4, 'よんこみかんを食べました。', FALSE),

(64, 1, 'ふゆとはるとどちらがすずしいですか。', TRUE),
(64, 2, 'おきなわときょうとの中でどこがあついですか。', FALSE),
(64, 3, '川田さんとミラーさんとどちらもおそいですか。', FALSE),
(64, 4, '車のほうがはやいですか。', FALSE),

(65, 1, 'きのうはあめではありませんでしたからうみに行きました。', FALSE),
(65, 2, '今日はあめではありませんでしたからうみに行きました。', TRUE),
(65, 3, 'きのうはあめではありませんからうみに行きました。', FALSE),
(65, 4, 'きょうはあめではありませんでしたからうみに行きます。', FALSE),

(66, 1, 'は', FALSE),
(66, 2, 'が', TRUE),
(66, 3, 'を', FALSE),
(66, 4, 'へ', FALSE),

(67, 1, 'すんでいます', FALSE),
(67, 2, 'うっています', FALSE),
(67, 3, 'はいっています', FALSE),
(67, 4, 'つかっています', TRUE),

(68, 1, 'に', FALSE),
(68, 2, 'を', TRUE),
(68, 3, 'へ', FALSE),
(68, 4, 'で', FALSE),

(69, 1, '来週のきんようびからにはらわなければなりませんから、わすれないでください。', FALSE),
(69, 2, '来週のきんようびまではらわなければなりませんから、わすれないでください。', FALSE),
(69, 3, '来週のきんようびまでにはらわなければなりませんから、わすれなくてもいいです。', FALSE),
(69, 4, '来週のきんようびまでにはらわなければなりませんから、わすれないでください。', TRUE),

(70, 1, 'から', FALSE),
(70, 2, 'こと', TRUE),
(70, 3, 'もの', FALSE),
(70, 4, 'まで', FALSE),

(71, 1, 'このへやにはいそがしくない人が三人だけいます。', FALSE),
(71, 2, 'このへやにはいそがしい人が三人だけいます。', TRUE),
(71, 3, 'このへやはいそがしい人が三人だけいます。', FALSE),
(71, 4, 'このへやにはいそがしい人が三人だけいません。', FALSE),

(72, 1, 'かぞくの中でだれがいちばんせが高いですか。', TRUE),
(72, 2, 'かぞくの中はだれがいちばんせが高いですか。', FALSE),
(72, 3, 'かぞくの中でだれがせが高いですか。', FALSE),
(72, 4, 'かぞくの中でだれがいちばんせが高くないですか。', FALSE),

(73, 1, '今の車は古くないですから新しいのがほしいです。', FALSE),
(73, 2, '今の車は古いですから新しいのがほしいです。', TRUE),
(73, 3, '新しい車がほしいですから今のは古いです。', FALSE),
(73, 4, '新しい車がほしくないですから今のは古いです。', FALSE),

(74, 1, 'にしかわさんはわかくてめが大きくてかみがながいです。きたがわさんもわかくてめが大きいですがかみがみじかいです。', FALSE),
(74, 2, 'きたがわさんはわかくてめが大きくてかみがみじかいです。にしかわさんもわかくてめが大きいですがかみがながいです。', FALSE),
(74, 3, 'にしかわさんはわかくてめが大きくてかみがみじかいです。きたがわさんもわかくてめが大きいですがかみがながいです。', FALSE),
(74, 4, 'きたがわさんはわかくてめが大きくてかみがながいです。にしかわさんもわかくてめが大きいですがかみがみじかいです。', TRUE),

(75, 1, 'I am sorry, must we not take photos inside of the city hall?', FALSE),
(75, 2, 'Excuse me, do we have to take photos inside of the municipal office?', FALSE),
(75, 3, 'My apologies, is it alright to take photos inside of the city hall?', TRUE),
(75, 4, 'Excuse me, could you please take photos inside of the municipal office?', FALSE),

(76, 1, 'なんで友達に電話してもいいですか。', FALSE),
(76, 2, 'どうやって友達に電話しますか。', TRUE),
(76, 3, 'どうやって友達に電話してもいいですか。', FALSE),
(76, 4, 'なんで友達に電話しますか。', FALSE),

(77, 1, 'I do not need to come on Wednesday, but I have to come on Monday.', FALSE),
(77, 2, 'I do not need to come on Monday, but I have to come on Wednesday.', TRUE),
(77, 3, 'I do not need to come on Thursday, but I have to come on Tuesday.', FALSE),
(77, 4, 'I do not need to come on Tuesday, but I have to come on Thursday.', FALSE);

-- PART 3: INTERMEDIATE II (25 questions total)
-- ============================================================================
-- INTERMEDIATE II: LESSONS 19-25
-- ============================================================================

INSERT INTO questions (question_text, question_body, question_level) VALUES
('Lesson 19: Translation', 'Which of the following is the correct way to translate this sentence into English? しゅうまつはすもうを見たりギータをひいたりカラオケでうたったりします。', 'Intermediate II'),
('Lesson 21: Grammar usage', 'Which of the following sentences showcases the correct way to use ～とおもいます?', 'Intermediate II'),
('Lesson 19: Grammar usage', 'Which of the following sentences showcases the correct way of using ～たことがあります?', 'Intermediate II'),
('Lesson 22: Grammar usage', 'How do verbs modify nouns?', 'Intermediate II'),
('Lesson 23: Grammar pattern meaning', 'What does "～時" mean?', 'Intermediate II'),
('Lesson 24: Grammar pattern meaning', 'What does "～てあげます" mean?', 'Intermediate II'),
('Lesson 25: Grammar pattern meaning', 'What does "～たら" express?', 'Intermediate II'),
('Lesson 20: Casual speech', 'Which of the following statements regarding casual conversation in Japanese is true?', 'Intermediate II'),
('Lesson 20: Particles', 'Which of the following particles cannot be omitted in casual conversation?', 'Intermediate II'),
('Lesson 23: Particle identification', 'Which particle indicates direction of movement?', 'Intermediate II'),
('Lesson 19: Conjugation', 'When using the adjective あぶない with the verb なります, how should it be conjugated?', 'Intermediate II'),
('Lesson 21: Translation', 'How would you translate, "Nishikawa said there is a festival in town tomorrow, so he is going to go buy sashimi." into Japanese?', 'Intermediate II'),
('Lesson 23: Grammar pattern meaning', 'What does "～たり～たりします" express?', 'Intermediate II'),
('Lesson 22: Verb conjugation', 'How do you modify a noun with "買います" in present tense?', 'Intermediate II'),
('Lesson 20: Casual speech', 'How would you convert the following sentence written in the casual form to the polite form? このあと、しごとでかいぎあるからしらべに行く前にでんしゃおりてなにか食べたい。', 'Intermediate II'),
('Lesson 24: Grammar pattern meaning', 'What does "～てもらいます" mean?', 'Intermediate II'),
('Lesson 25: Grammar pattern meaning', 'What does "～ても" express?', 'Intermediate II'),
('Lesson 24: Verb conjugation', 'What is the plain past negative of "行きます"?', 'Intermediate II'),
('Lesson 20: Casual speech', 'In which of the following situations would you never use polite speech?', 'Intermediate II'),
('Lesson 21: Grammar usage', 'What is the construction ～ないと equivalent in meaning to?', 'Intermediate II'),
('Lesson 22: Grammar usage', 'How do you modify a noun with a past verb?', 'Intermediate II'),
('Lesson 23: Grammar usage', 'What tense is used before "時"?', 'Intermediate II'),
('Lesson 24: Grammar pattern meaning', 'What does "～てくれます" mean?', 'Intermediate II'),
('Lesson 25: Grammar pattern meaning', 'What does "～なら" express?', 'Intermediate II'),
('Lesson 19: Form identification', 'What is the plain form of "います"?', 'Intermediate II');

INSERT INTO answers (question_id, answer_id, answer_text, correct_answer) VALUES
(78, 1, 'On the weekends I watch sumo wrestling, play the guitar, and sing karaoke.', FALSE),
(78, 2, 'On the weekends I do things like watch sumo wrestling, play the guitar, and sing karaoke.', TRUE),
(78, 3, 'Over the weekend I watched sumo wrestling, played the guitar, and sang karaoke.', FALSE),
(78, 4, 'Over the weekend I did things like watch sumo wrestling, play the guitar, and sing karaoke.', FALSE),

(79, 1, 'きむらさんは最近しごとをやめたりむだなことをしたりするだとおもいます。', FALSE),
(79, 2, 'あのやきゅうのチームはしあいでぜんぜんまけません。時田さんはチームのことに気をつけているとおもいますから。', FALSE),
(79, 3, '彼女はいつもやくに立って天才ですから夢は留学するこどですとおもいます。', FALSE),
(79, 4, '彼氏は今とうきょうに行っているからかえる前におみやげでも買ってくるとおもいます。', TRUE),

(80, 1, '川田さんはよくねむくなってサッカーのれんしゅうをわすれることがあります。', FALSE),
(80, 2, '北川さんは強くてふじさんにのぼったことがごかいあります。', TRUE),
(80, 3, '田中さんはへやをそうじすることがすくないです。せんたくをすることがありますから。', FALSE),
(80, 4, 'ミラーさんはからだがよわくてスポーツがあまりすきではありませんが、ゴルフをやらないことがあります。', FALSE),

(81, 1, 'Verbs must be in ます-form', FALSE),
(81, 2, 'Verbs cannot directly modify nouns', FALSE),
(81, 3, 'Verbs must be in plain form', TRUE),
(81, 4, 'Verbs must be in て-form', FALSE),

(82, 1, 'If/When (conditional)', FALSE),
(82, 2, 'Before', FALSE),
(82, 3, 'When/While/At the time', TRUE),
(82, 4, 'After', FALSE),

(83, 1, 'Receive something from someone', FALSE),
(83, 2, 'Do something for someone else', TRUE),
(83, 3, 'Do something for yourself', FALSE),
(83, 4, 'Have someone do something', FALSE),

(84, 1, 'While', FALSE),
(84, 2, 'If/When (conditional)', TRUE),
(84, 3, 'Before', FALSE),
(84, 4, 'Because', FALSE),

(85, 1, 'です is replaced by だ in casual conversation.', FALSE),
(85, 2, 'The い in ～ている is often dropped when speaking.', TRUE),
(85, 3, 'けど can always replace が when speaking casually.', FALSE),
(85, 4, 'The は particle can always be omitted, regardless of the context.', FALSE),

(86, 1, 'を', FALSE),
(86, 2, 'へ', FALSE),
(86, 3, 'と', TRUE),
(86, 4, 'は', FALSE),

(87, 1, 'を', FALSE),
(87, 2, 'で', FALSE),
(87, 3, 'へ', FALSE),
(87, 4, 'に', TRUE),

(88, 1, 'あぶないに', FALSE),
(88, 2, 'あぶなく', TRUE),
(88, 3, 'あぶなくなく', FALSE),
(88, 4, 'あぶないく', FALSE),

(89, 1, '西川さんはあしたまちでまつりがあるからさしみを買いに行くといいました。', TRUE),
(89, 2, '西川さんはあしたまちにまつりがあるからさしみを買いに行くといいました。', FALSE),
(89, 3, '西川さんはあしたまちでまつりがあるからさしみを買いに行くだといいました。', FALSE),
(89, 4, '西川さんはあしたまちにまつりがあるからさしみを買いに行くといいませんでした。', FALSE),

(90, 1, 'Doing things things such as', TRUE),
(90, 2, 'Doing things in sequence', FALSE),
(90, 3, 'Doing things simultaneously', FALSE),
(90, 4, 'Having done', FALSE),

(91, 1, '買わなかった + noun', FALSE),
(91, 2, '買います + noun', FALSE),
(91, 3, '買った + noun', FALSE),
(91, 4, '買う + noun', TRUE),

(92, 1, 'このあと、しごとでかいぎがありますからしらべに行く前にでんしゃおりてなにか食べたいです。', FALSE),
(92, 2, 'このあと、しごとでかいぎがありますからしらべに行く前にでんしゃをおりてなにか食べたいです。', TRUE),
(92, 3, 'こちらのあと、しごとでかいぎがありますからしらべに行く前にでんしゃをおりましてなにか食べたいでしょう。', FALSE),
(92, 4, 'こちらのあと、しごとでかいぎがあるからしらべに行く前にでんしゃをおりてなにかたべましょうか。', FALSE),

(93, 1, 'Someone does for me', FALSE),
(93, 2, 'I have someone do for me', TRUE),
(93, 3, 'I do for someone', FALSE),
(93, 4, 'Someone does', FALSE),

(94, 1, 'Because', FALSE),
(94, 2, 'If', FALSE),
(94, 3, 'Even if/Even though', TRUE),
(94, 4, 'When', FALSE),

(95, 1, '行かない', FALSE),
(95, 2, '行かなかった', TRUE),
(95, 3, '行きませんでした', FALSE),
(95, 4, '行きません', FALSE),

(96, 1, 'When calling a hotel to make a reservation.', FALSE),
(96, 2, 'When speaking to the president of the company you work at.', FALSE),
(96, 3, 'When talking with your best friend from high school.', TRUE),
(96, 4, 'When giving a speech for a political campaign.', FALSE),

(97, 1, '～なくてはいけません', FALSE),
(97, 2, '～なければなりません', TRUE),
(97, 3, '～なくても', FALSE),
(97, 4, '～ないでください', FALSE),

(98, 1, 'Using ます-form + noun', FALSE),
(98, 2, 'Using plain past (た) + noun', TRUE),
(98, 3, 'Using て-form + noun', FALSE),
(98, 4, 'Using dictionary form + noun', FALSE),

(99, 1, 'Only past tense', FALSE),
(99, 2, 'Only present tense', FALSE),
(99, 3, 'Both present and past can be used', TRUE),
(99, 4, 'Only future tense', FALSE),

(100, 1, 'I do for them', FALSE),
(100, 2, 'Someone does for me', TRUE),
(100, 3, 'I receive', FALSE),
(100, 4, 'They give me something', FALSE),

(101, 1, 'When', FALSE),
(101, 2, 'If that is the case', TRUE),
(101, 3, 'Because', FALSE),
(101, 4, 'Even if', FALSE),

(102, 1, 'です', FALSE),
(102, 2, 'いる', TRUE),
(102, 3, 'ある', FALSE),
(102, 4, 'おる', FALSE);

-- PART 4: ADVANCED (27 questions total) + Summary
-- ============================================================================
-- ADVANCED: LESSONS 26-32
-- ============================================================================

INSERT INTO questions (question_text, question_body, question_level) VALUES
('Lesson 26: Grammar pattern meaning', 'What does "～ながら" express?', 'Advanced'),
('Lesson 27: Grammar pattern meaning', 'What does "～ておきます" mean?', 'Advanced'),
('Lesson 28: Grammar pattern meaning', 'What does "～そうです" (after verb stem) indicate?', 'Advanced'),
('Lesson 28: Grammar pattern meaning', 'What does "verb stem + やすい" mean?', 'Advanced'),
('Lesson 29: Form creation', 'How do you form the passive of Group 1 verbs?', 'Advanced'),
('Lesson 30: Form pattern', 'What is the honorific form pattern?', 'Advanced'),
('Lesson 31: Grammar pattern meaning', 'What does "～よう" (plain volitional) express?', 'Advanced'),
('Lesson 32: Grammar pattern meaning', 'What does "～んです" express?', 'Advanced'),
('Lesson 26: Grammar pattern meaning', 'What does "～ても" mean?', 'Advanced'),
('Lesson 29: Form meaning', 'What does the causative form express?', 'Advanced'),
('Lesson 30: How to say', 'How do you form humble expressions?', 'Advanced'),
('Lesson 32: Grammar pattern meaning', 'What does "～ようです" mean?', 'Advanced'),
('Lesson 26: Grammar pattern meaning', 'What does "～てしまいます" express?', 'Advanced'),
('Lesson 27: Grammar pattern meaning', 'What does "～てあります" indicate?', 'Advanced'),
('Lesson 28: Grammar pattern meaning', 'What does "verb stem + にくい" mean?', 'Advanced'),
('Lesson 29: Form creation', 'How do you form the causative of "食べます"?', 'Advanced'),
('Lesson 30: Vocabulary', 'What is the honorific form of "食べます"?', 'Advanced'),
('Lesson 31: Grammar pattern meaning', 'What does "～つもりです" express?', 'Advanced'),
('Lesson 32: Grammar pattern meaning', 'What does "～わけです" mean?', 'Advanced'),
('Lesson 26: Grammar usage', 'Can "～ながら" be used with all verbs?', 'Advanced'),
('Lesson 27: Grammar pattern meaning', 'What does "～てみます" mean?', 'Advanced'),
('Lesson 28: Grammar pattern meaning', 'What does "～そうです" (after plain form) indicate?', 'Advanced'),
('Lesson 29: Form creation', 'How do you form the passive of "見ます"?', 'Advanced'),
('Lesson 30: Vocabulary', 'What is the humble form of "行きます"?', 'Advanced'),
('Lesson 31: Grammar pattern meaning', 'What does "～予定です" express?', 'Advanced'),
('Lesson 32: Grammar pattern meaning', 'What does "～はずです" mean?', 'Advanced'),
('Lesson 29: Form meaning', 'What does the causative-passive form express?', 'Advanced');

INSERT INTO answers (question_id, answer_id, answer_text, correct_answer) VALUES
(103, 1, 'Before doing', FALSE),
(103, 2, 'While doing (simultaneous actions)', TRUE),
(103, 3, 'After doing', FALSE),
(103, 4, 'Without doing', FALSE),

(104, 1, 'Continue doing', FALSE),
(104, 2, 'Do in advance/preparation', TRUE),
(104, 3, 'Try doing', FALSE),
(104, 4, 'Finish doing', FALSE),

(105, 1, 'I heard that', FALSE),
(105, 2, 'It looks like/seems (appearance)', TRUE),
(105, 3, 'I think that', FALSE),
(105, 4, 'I want to', FALSE),

(106, 1, 'Want to do', FALSE),
(106, 2, 'Easy to do', TRUE),
(106, 3, 'Can do', FALSE),
(106, 4, 'Must do', FALSE),

(107, 1, 'Add られる to stem', FALSE),
(107, 2, 'Change う to あれる', TRUE),
(107, 3, 'Change う to える', FALSE),
(107, 4, 'Add せる to stem', FALSE),

(108, 1, 'ご + verb stem + します', FALSE),
(108, 2, 'お + verb stem + になります', TRUE),
(108, 3, 'お + dictionary form + になります', FALSE),
(108, 4, 'verb stem + れます', FALSE),

(109, 1, 'Want to do', FALSE),
(109, 2, 'Let\'s do/I think I\'ll do (intention)', TRUE),
(109, 3, 'Can do', FALSE),
(109, 4, 'Must do', FALSE),

(110, 1, 'Possibility', FALSE),
(110, 2, 'Explanation/Emphasis (asking/explaining why)', TRUE),
(110, 3, 'Permission', FALSE),
(110, 4, 'Obligation', FALSE),

(111, 1, 'While', FALSE),
(111, 2, 'Even if/Even though', TRUE),
(111, 3, 'When', FALSE),
(111, 4, 'Because', FALSE),

(112, 1, 'To receive an action', FALSE),
(112, 2, 'To make/let someone do something', TRUE),
(112, 3, 'To be able to do', FALSE),
(112, 4, 'To have done', FALSE),

(113, 1, 'Using passive form', FALSE),
(113, 2, 'Using special humble verbs or お + stem + する', TRUE),
(113, 3, 'Using potential form', FALSE),
(113, 4, 'Using causative form', FALSE),

(114, 1, 'I think', FALSE),
(114, 2, 'It seems/appears (based on information)', TRUE),
(114, 3, 'I heard', FALSE),
(114, 4, 'I want', FALSE),

(115, 1, 'Complete doing/regrettably', TRUE),
(115, 2, 'Try doing', FALSE),
(115, 3, 'Keep doing', FALSE),
(115, 4, 'Start doing', FALSE),

(116, 1, 'Someone did something (result remains)', TRUE),
(116, 2, 'Someone is doing', FALSE),
(116, 3, 'Someone did', FALSE),
(116, 4, 'Something exists', FALSE),

(117, 1, 'Easy to do', FALSE),
(117, 2, 'Want to do', FALSE),
(117, 3, 'Difficult to do', TRUE),
(117, 4, 'Must do', FALSE),

(118, 1, '食べさせる', TRUE),
(118, 2, '食べられる', FALSE),
(118, 3, '食べよう', FALSE),
(118, 4, '食べれる', FALSE),

(119, 1, '食べになります', FALSE),
(119, 2, 'めしあがります', TRUE),
(119, 3, 'いただきます', FALSE),
(119, 4, 'お食べします', FALSE),

(120, 1, 'Expectation', FALSE),
(120, 2, 'Intention/Plan', TRUE),
(120, 3, 'Ability', FALSE),
(120, 4, 'Permission', FALSE),

(121, 1, 'That is to say', TRUE),
(121, 2, 'I think', FALSE),
(121, 3, 'Probably', FALSE),
(121, 4, 'Maybe', FALSE),

(122, 1, 'Yes, with all verbs', FALSE),
(122, 2, 'No, mainly with continuous actions', TRUE),
(122, 3, 'Only with する verbs', FALSE),
(122, 4, 'Only with motion verbs', FALSE),

(123, 1, 'Keep doing', FALSE),
(123, 2, 'Try doing', TRUE),
(123, 3, 'Finish doing', FALSE),
(123, 4, 'Do in advance', FALSE),

(124, 1, 'It looks like (appearance)', FALSE),
(124, 2, 'I heard that (hearsay)', TRUE),
(124, 3, 'I think that', FALSE),
(124, 4, 'It seems (guess)', FALSE),

(125, 1, '見せる', FALSE),
(125, 2, '見られる', TRUE),
(125, 3, '見させる', FALSE),
(125, 4, '見える', FALSE),

(126, 1, 'おいきになります', FALSE),
(126, 2, 'まいります', TRUE),
(126, 3, 'おいきします', FALSE),
(126, 4, 'いらっしゃいます', FALSE),

(127, 1, 'Hope/Wish', FALSE),
(127, 2, 'Schedule/Plan', TRUE),
(127, 3, 'Possibility', FALSE),
(127, 4, 'Obligation', FALSE),

(128, 1, 'It seems', FALSE),
(128, 2, 'Probably', FALSE),
(128, 3, 'Should be/Expected to', TRUE),
(128, 4, 'Maybe', FALSE),

(129, 1, 'To be able to do', FALSE),
(129, 2, 'To be made to do', TRUE),
(129, 3, 'To make someone do', FALSE),
(129, 4, 'To let someone do', FALSE);