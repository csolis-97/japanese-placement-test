import { 
    Page, 
    Text, 
    View, 
    Document, 
    StyleSheet 
} from "@react-pdf/renderer";
import { formatResultsDate } from "../utils/utilFunctions";

const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        alignItems: 'center'
    },

    resultInfoPadding: {
        padding: 48
    },
    resultInfoSection: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 24,
        width: 416,
        height: 160,
        justifyContent: 'center'
    },
    resultInfoH2: {
        color: '#1F2937',
        fontWeight: 700
    },
    resultInfoPara: {
        color: '#4B5563'
    }
});

//Interface below will be used for when each question itself is displayed. Fields should be the exact same as the ones in
//the database in order to be properly displayed.
interface ResultQuestion {
  question_id: number;
  question_text: string;
  question_body: string;
  question_level: string;
  answer_id: number[];
  answer_text: string[];
  already_answered?: boolean;
  correct_answer?: boolean[];
  user_answer_text: string;
  user_was_correct?: boolean;
  response_order: number;
};

//Interface below will be used for displaying the user's results.
interface TestResult {
  attempt_id: number;
  total_score: number;
  totalQuestions: number;
  entrance_level: string;
  end_time: Date;
};

interface PDFProps {
    TestResultProps: TestResult;
    ResultQuestionProps: ResultQuestion[];

};

export default function CreateResultsPDF({ TestResultProps, ResultQuestionProps } : PDFProps ) {

    // Format the date first
    const formattedDate = formatResultsDate(TestResultProps.end_time);

    // Calculate the totalQuestions and totalScore
    const totalQuestions = ResultQuestionProps.length;
    const totalScore = Math.round((TestResultProps.total_score / 100) * totalQuestions);

    return(
        <Document>
            <Page style = {styles.page}>
                <View style = {styles.resultInfoPadding}>
                    <View style = {styles.resultInfoSection}>
                        <Text style = {styles.resultInfoH2}>Test Attempt #{TestResultProps.attempt_id} Results</Text>
                        <Text style = {styles.resultInfoPara}>Test Date: {formattedDate}</Text>
                        <Text style = {styles.resultInfoPara}>Total Score: {totalScore} / {totalQuestions}</Text>
                        <Text style = {styles.resultInfoPara}>Your Suggested Entrance Level: {TestResultProps.entrance_level}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );     
}