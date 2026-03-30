import { 
    Text, 
    View, 
    StyleSheet
} from "@react-pdf/renderer";
import { ResultQuestion } from "@/app/types/sharedInterface";

// This const lists all of the styles used for the PDF. It tries to mimic all of the styling used in the actual components as closely as possible
const styles = StyleSheet.create({
    QuestionDisplayPadding: {
        gap: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    QuestionDisplayCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        width: 512,
        minHeight: 512
    },
    QuestionSection: {
        color: '#4B5563',
        fontWeight: 700
    },

    QuestionNumberH1: {
        fontSize: 20,
        padding: 16
    },
    QuestionLevelH1: {
        fontSize: 14,
        paddingLeft: 16,
        paddingRight: 16
    },
    QuestionTextH2: {
        fontSize: 12,
        paddingLeft: 16,
        paddingRight: 16
    },
    QuestionBodyPara: {
        fontSize: 16,
        padding: 16,
        borderBottomWidth: 2,
        borderStyle: 'solid',
        borderColor: '#9CA3AF'
    },

    AnswerSection: {
        padding: 16,
        paddingTop: 40
    },
    AnswerOptionDiv: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 6,
        fontSize: 16,
        alignItems: 'stretch',
        rounded: 4,
        borderRadius: 8,
        padding: 4,
        minwidth: 420,
        minHeight: 64,
    },
    AnswerOptionPara: {
        fontWeight: 700,
        marginLeft: 16,
        alignSelf: 'center'                   
    },
    AnswerOptionLabel: {
        display: 'flex',
        flex: 1,
        padding: 8,
        marginLeft: 16,
        justifyContent: 'center',
        rounded: 4,
        borderRadius: 4,
        backgroundColor: '#ffffff'
    },

    RegularRadio: {
        backgroundColor: '#E5E7EB'
    },
    CorrectRadio: {
        backgroundColor: '#059669'
    },
    WrongRadio: {
        backgroundColor: '#DC2626'
    },
    RegularText: {
        marginLeft: 8,
        color: '#4B5563'
    },
    CorrectText: {
        marginLeft: 8,
        color: '#059669'
    },
    WrongText: {
        marginLeft: 8,
        color: '#DC2626'
    },
    RegularNumberLabel: {
        color: '#4B5563'
    },
    ColoredNumberLabel: {
        color: '#ffffff'
    },

    QuestionUnansweredPadding: {
        paddingBottom: 24
    },
    QuestionUnansweredSection: {
        display: 'flex',
        padding: 16,
        marginTop: 24,
        marginLeft: 16,
        backgroundColor: '#DC2626',
        borderRadius: 4,
        justifyContent: 'center',
        fontWeight: 700,
        alignItems: 'stretch',
        width: 480,
        height: 72
    },
    QuestionUnansweredH1: {
        display: 'flex',
        flex: 1,
        padding: 8,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        textAlign: 'center',
        color: '#DC2626',
        fontSize: 16,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

interface QuestionDisplayPDFProps {
    QuestionDisplayProps: ResultQuestion[];
};

export default function QuestionDisplayPDF({ QuestionDisplayProps } : QuestionDisplayPDFProps ) {
    return (
        <View style = {styles.QuestionDisplayPadding}>
            {
                QuestionDisplayProps.map((question, index) =>
                    <View style = {styles.QuestionDisplayCard} key = {index} wrap = {false}>
                        <View style = {styles.QuestionSection}>
                            <Text style = {styles.QuestionNumberH1}>Question #{question.response_order}</Text>
                            <Text style = {styles.QuestionLevelH1}>Level: {question.question_level}</Text>
                            <Text style = {styles.QuestionTextH2}>{question.question_text}</Text>
                            <Text style = {styles.QuestionBodyPara}>{question.question_body}</Text>
                        </View>
                        <View style = {styles.AnswerSection}>
                            {
                                QuestionDisplayProps[index].answer_text.map((answer, answerIndex) => {
                                    // Determine the boolean values for whether the answer is correct or incorrect, for styling purposes.
                                    const userChoseThisAnswer = question.user_answer_text === answer;
                                    const isAnswerCorrect = Number(question.correct_answer?.[answerIndex]) === 1;
                                    const userInCorrect = userChoseThisAnswer && Number(question.user_was_correct) === 0;
                                    return (
                                        <View 
                                            key = {answerIndex} 
                                            style = {
                                                userChoseThisAnswer && isAnswerCorrect || 
                                                isAnswerCorrect ? ([styles.AnswerOptionDiv, styles.CorrectRadio]) : userInCorrect ? 
                                                ([styles.AnswerOptionDiv, styles.WrongRadio]) : ([styles.AnswerOptionDiv, styles.RegularRadio])
                                            }
                                        >
                                            <Text style = {
                                                isAnswerCorrect || userInCorrect ? ([styles.AnswerOptionPara, styles.ColoredNumberLabel]) : 
                                                ([styles.AnswerOptionPara, styles.RegularNumberLabel])
                                            }>
                                                {answerIndex + 1}
                                            </Text>
                                            <View style = {styles.AnswerOptionLabel}>
                                                <Text style = { isAnswerCorrect ? (styles.CorrectText) : userInCorrect ? 
                                                    (styles.WrongText) : (styles.RegularText)
                                                }>
                                                    {answer}
                                                </Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        { // Only display if the user did not answer the question, else display nothing
                            question.user_answer_text === "not answered" ? (
                                <View style = {styles.QuestionUnansweredPadding}>
                                    <View style = {styles.QuestionUnansweredSection}>
                                        <Text style = {styles.QuestionUnansweredH1}>X Question was not answered.</Text>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <Text></Text>
                                </View>
                            )
                        }
                    </View>
                )
            }
        </View>
    );     
}