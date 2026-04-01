import { TestQuestion } from "@/types/sharedInterface";
import { StageData, UserAnswerType } from "@/types/sharedType";

// This little function will calculate the correct answers for the stage, using the current value of the gradedAnswers useRef
export function handleCorrectCount(gradedAnswers: boolean[], STAGE_SIZE: number) {
    const correctCount = gradedAnswers.slice(-STAGE_SIZE).filter(Boolean).length;
    console.log("HERE IS CORRECT COUNT!");
    console.log(correctCount);
    return correctCount;
}

///////////////// THERE IS A BUG WHERE THE VALUE STILL STAYS AT FALSE INSTEAD OF BEING CHANGED TO TRUE

// This function will take the current data passed and map each answer to an index. If the index matches currentQuestion, set alreadyAnswered
// to true, and update the questionId using the value from the current stage and keep other attributes as is. Otherwise, just copy the answer
export function updateCurrentAnswer(prevData: UserAnswerType[], currentQuestion: number, newQuestionid: number) {
    prevData.map((answer, index) =>
        index === currentQuestion ? {
        ...answer, 
        questionId: newQuestionid, 
        alreadyAnswered: true
        } : answer
    );
    return prevData;
}

// This function will update the stageInfo for the next stage, using the current stage's info alongside the fetched questions
export function handleStageInfoUpdate(stageInfo:StageData, fetchedQuestion: TestQuestion[]) {
    console.log("INCREMENT THE CURRENT STAGE NUMBER AND RESET THE STAGE QUESTION COUNTER BACK TO 0!");
    const updateInfo = {
        stageNum: stageInfo.stageNum + 1,
        stageQuestion: 0,
        stageDifficulty: [
            ...stageInfo.stageDifficulty,
            fetchedQuestion[0].question_level // This line may be incorrect, come here if there are any errors
        ],
        stageQuestionId: fetchedQuestion.map((question: TestQuestion) => question.question_id)
    };
    console.log("SET THE CURRENT STAGE USING THE CURRENT STAGE NUM");
    console.log("SET THE CURRENT STAGE QUESTION IDS");
    return updateInfo;
}

// This function will expand the length of answerArray to match the amount of questions fetched, using the question_id from each one.
// If it is the first stage, return newArray. Otherwise combine the prevData with the newArray and return
export function expandAnswerArray(prevData: UserAnswerType[], fetchedQuestion: TestQuestion[], stageNum: number) {
    const newArray = fetchedQuestion.map((question: TestQuestion) => ({
        'questionId' : question.question_id,
        'userText' : '',
        'alreadyAnswered' : false,
    }));
    return [...prevData, ...newArray];
}