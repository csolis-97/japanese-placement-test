import { 
    Page, 
    Document, 
    StyleSheet,
    Font
} from "@react-pdf/renderer";
import ResultInfoPDF from "./ResultInfoPDF";
import QuestionDisplayPDF from "./QuestionDisplayPDF";
import { ResultQuestion, TestResult } from "@/app/types/sharedInterface";

// Default font does not support Japanese, so register one for PDF use
Font.register({ 
    family: 'Noto_Sans_JP', 
    fonts: [
        { src: '/fonts/NotoSansJP-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/NotoSansJP-Bold.ttf', fontWeight: 700 },
    ] 
});

// LIST OF JAPANESE CHARACTERS THAT ARE NOT ALLOWED TO START A NEW LINE AFTER
const LINE_BREAK_NOT_ALLOWED = ['、', '。', '」', '』', '）', '！', '？', 'ー', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ'];

// Regex for checking if the character is a Japanese character. Used to determine when not to apply a line break
const JAPANESE_CHAR_REGEX = /[\u3040-\u30FF\u4E00-\u9FFF\uFF66-\uFF9D]/;

/* 
    This callback function will be used to determine where the line breaks occur for the Japanese text in the PDF.
    It helps to ensure that the formatting of the PDF looks a little better. word represents a string of text considered for a line break,
    so the function should return an array of strings representing how the text should be formatted. In this case, if the next character is not
    allowed to have a line break after it, then it will not be added. Otherwise, add a blank character to indicate that a line break is possible
*/
Font.registerHyphenationCallback((word) => {
    const charArray = Array.from(word);
    const outputArray = [];

    // If it is English, break the line using the entire word
    if (!JAPANESE_CHAR_REGEX.test(word)) {
        return [word];
    }
    // Otherwise, go into the for loop and determine where to break the line based on if the next character is allowed to break the line
    for (let i = 0; i < charArray.length; i++) {
        outputArray.push(charArray[i]);
        if (LINE_BREAK_NOT_ALLOWED.includes(charArray[i + 1])) {
            continue;
        }
        else {
            outputArray.push("");  
        }
    }
    return outputArray;
});

// This const lists all of the styles used for the PDF. It tries to mimic all of the styling used in the actual components as closely as possible
const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Noto_Sans_JP'
    }
});

interface PDFProps {
    TestResultProps: TestResult;
    ResultQuestionProps: ResultQuestion[];
};

export default function CreateResultsPDF({ TestResultProps, ResultQuestionProps } : PDFProps ) {
    return (
        <Document>
            <Page style = {styles.page}>
                <ResultInfoPDF ResultInfoProps = {TestResultProps} questionLength = {ResultQuestionProps.length}></ResultInfoPDF>
                <QuestionDisplayPDF QuestionDisplayProps = {ResultQuestionProps}></QuestionDisplayPDF>
            </Page>
        </Document>
    );     
}