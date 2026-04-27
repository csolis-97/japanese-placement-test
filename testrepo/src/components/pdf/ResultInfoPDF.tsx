import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatResultsDate } from "../../utils/utilFunctions";
import { TestResult } from "@/types/sharedInterface";

// This const lists all of the styles used for the PDF. It tries to mimic all of the styling used in the actual components as closely as possible
const styles = StyleSheet.create({
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

interface ResultInfoPDFProps {
    ResultInfoProps: TestResult;
    questionLength: number;
};

export default function ResultInfoPDF({ ResultInfoProps, questionLength } : ResultInfoPDFProps) {

    // Format the date first
    const formattedDate = formatResultsDate(ResultInfoProps.end_time);

    // Calculate the totalQuestions and totalScore
    const totalQuestions = questionLength;
    const totalScore = Math.round((ResultInfoProps.total_score / 100) * totalQuestions);

    return (
        <View style = {styles.resultInfoPadding}>
            <View style = {styles.resultInfoSection}>
                <Text style = {styles.resultInfoH2}>Test Attempt #{ResultInfoProps.attempt_id} Results</Text>
                <Text style = {styles.resultInfoPara}>Test Date: {formattedDate}</Text>
                <Text style = {styles.resultInfoPara}>Total Score: {totalScore} / {totalQuestions}</Text>
                <Text style = {styles.resultInfoPara}>Your Suggested Entrance Level: {ResultInfoProps.entrance_level}</Text>
            </View>
        </View>
    );     
}