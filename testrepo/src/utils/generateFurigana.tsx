"use client";

import { Fragment } from "react/jsx-runtime";

// This function is mostly functional, though I have yet to test if the furigana is actually omitted for each level, since I have to edit the data first.
export function generateFurigana(questionField: string, furigana: string | undefined, questionLevel: string) {

    if (!furigana || furigana === undefined) {
        // If there is no furigana provided, just return the string as is
        // The format might look weird, but rp tags are used in case the user's browser doesn't support rt. 
        // Also mb-1.5 so that it is properly aligned with the rest of the text
        console.log(`NO FURIGANA WAS PROVIDED!`);
        return (
            <Fragment key = {String(questionField)}>
                {questionField}
            </Fragment>
        );
    }
    // Regex for checking if the character is kanji. Used to determine where to apply furigana.
    // Hiragana range: [\u3041-\u3096]
    // Full width katakana range: [\u30A0-\u30FF]
    // Kanji range: [\u3400-\u4DB5\u4E00-\u9FCB\uF900-\uFA6A]
    // Kanji radicals range: [\u2E80-\u2FD5]
    // Half width katakana and punctuation range: [\uFF5F-\uFF9F]
    // Japanese symbols and punctuation range: [\u3000-\u303F]
    const JAPANESE_CHAR_REGEX = /[\u3041-\u3096\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCB\uF900-\uFA6A\u2E80-\u2FD5\uFF5F-\uFF9F\u3000-\u303F]/;
    const KANJI_REGEX = /[\u3400-\u4DB5\u4E00-\u9FCB\uF900-\uFA6A]/;
    const BEGINNER_TWO_KANJI = [
        '日','月','火','木','金','土','山','川','田',
        '一','二','三','四','五','六','七','八','九','十','百','千','万','円',
        '学','生','先','会','社','員','医','者','本','中','国','人',
        '今','朝','昼','晩','時','分','半','午','前','後','休','毎','何',
        '行','来','校','週','去','年','駅','電','車','自','転'
    ];
    const INTERMEDIATE_ONE_KANJI = [
        '高','安','大','小','新','古','青','白','赤','黒',
        '上','下','父','母','子','手','好','主','肉','魚','食','飲','物',
        '近','間','右','左','外','男','女','犬',
        '書','聞','読','見','話','買','起','帰','友','達',
        '茶','酒','写','真','紙','映','画','店','英','語'
    ];
    const INTERMEDIATE_TWO_KANJI = [
        '送','切','貸','借','旅','教','習','勉','強','花',
        '歩','待','立','止','雨','入','出','売','使','作',
        '明','暗','広','多','少','長','短','悪','重','軽','早',
        '便','利','元','気','親','有','名','地','鉄','仕','事',
        '東','西','南','北','京','夜','料','理','口','目','足','曜'
    ];
    const ADVANCED_KANJI = [
        '降','思','寝','終','言','知','動','同','漢','字','方',
        '図','館','銀','町','住','度','服','着','音','楽','持',
        '春','夏','秋','冬','道','堂','建','病','院','体','運','乗',
        '家','内','族','兄','弟','奥','姉','妹','海','計',
        '部','屋','室','窓','開','閉','歌','意','味','天','考'
    ];
    const IRREGULAR_READINGS = ['今朝','朝日', '昨日', '今日', '明日', '明後日', '大人', '土産',];
    const furiganaList = furigana.split("　");

    const segmenterJp = new Intl.Segmenter("ja-JP", { granularity: "word" });
    const textSegments = segmenterJp.segment(questionField);
    console.table(Array.from(textSegments));

    const givenText = Array.from(textSegments).map((textPiece) => textPiece.segment)
    .join(" ")
    .replace(/(\p{sc=Han})(?=\p{sc=Hiragana}|\p{sc=Katakana}|\p{P})|(\p{sc=Hiragana}|\p{P})(?=\p{sc=Han}|\p{sc=Katakana})|(\p{sc=Katakana}\p{P})(?=\p{sc=Han}|\p{sc=Hiragana})/gu, "$& ");
    const textArray = givenText.split(/(\s+)/);
    
    // Use a for loop to apply line break elements to any \n detected
    for (let i = 0; i < textArray.length -1; i++) {
        if (textArray[i].includes("\n")) {
            const tempIndex = textArray[i];
            textArray[i] = tempIndex.replace(/\n/g, "<br>");
        }
    }
    console.log(`HERE ARE EACH CHARACTERS OF THE STRING SPLIT INTO AN ARRAY: ${textArray}`);

    console.log(`HERE IS THE FINAL TEXT COMBINED BY KANJI COMPOUNDS: ${givenText}`);
    console.log(`HERE IS THE FINAL FURIGANA COMBINED BY KANJI COMPOUNDS: ${furiganaList}`);

    // These counters will be used to properly assign each kanji's furigana, based on the number of kanji that have been encountered, as well
    // as using them as the indices to properly match the furigana that was provided in the database
    let lastCharIndex = 0;
    let lastKanjiIndex = 0;
    let kanjiCounter = 0;

    // The map function will be used to iterate through each character and return TSX as needed
    const buildFurigana = textArray.map((char, index) => {
        // These consts will be used to determine if the current character is kanji and if it is included in the list of kanji for each level
        const isKanji = KANJI_REGEX.test(char);

        // If the current character is kanji, increment the counter and set the proper indices
        if (isKanji) {
            const currentKanjiCompound = char.split("");
            const isBeginnerTwoKanji = currentKanjiCompound.some(char => BEGINNER_TWO_KANJI.includes(char));
            const isIntermediateOneKanji = currentKanjiCompound.some(char => INTERMEDIATE_ONE_KANJI.includes(char));
            const isIntermediateTwoKanji = currentKanjiCompound.some(char => INTERMEDIATE_TWO_KANJI.includes(char));
            const isAdvancedKanji = currentKanjiCompound.some(char => ADVANCED_KANJI.includes(char));
            // These consts will be used to determine if the current kanji should have furigana or not based on the question level. With each increasing
            // level, the kanji from the previous levels will also be included
            const levelIsBeginnerTwo = questionLevel === 'Beginner II' && isBeginnerTwoKanji;
            const levelIsIntermediateOne = questionLevel === 'Intermediate I' && (isIntermediateOneKanji || isBeginnerTwoKanji);
            const levelIsIntermediateTwo = questionLevel === 'Intermediate II' && (isIntermediateTwoKanji || isIntermediateOneKanji || isBeginnerTwoKanji);
            const levelIsAdvanced = questionLevel === 'Advanced' && (isAdvancedKanji || isIntermediateTwoKanji || isIntermediateOneKanji || isBeginnerTwoKanji);
            //const furiganaNotNeeded = [levelIsBeginnerTwo, levelIsIntermediateOne, levelIsIntermediateTwo, levelIsAdvanced].some(Boolean) && [levelIsBeginnerTwo, levelIsIntermediateOne, levelIsIntermediateTwo, levelIsAdvanced].filter(Boolean).length > (char.length / 2);
            const furiganaNotNeeded = [levelIsBeginnerTwo, levelIsIntermediateOne, levelIsIntermediateTwo, levelIsAdvanced].some(Boolean) && currentKanjiCompound.every(char => BEGINNER_TWO_KANJI.includes(char) || INTERMEDIATE_ONE_KANJI.includes(char) || INTERMEDIATE_TWO_KANJI.includes(char) || ADVANCED_KANJI.includes(char));
            console.log('IS BEGINNER II?', levelIsBeginnerTwo);
            console.log('IS INTERMEDIATE I?', levelIsIntermediateOne);
            console.log('IS INTERMEDIATE II?', levelIsIntermediateTwo);
            console.log('IS ADVANCED?', levelIsAdvanced);
            console.log("IS FURIGANA NEEDED?", furiganaNotNeeded);

            kanjiCounter++;
            lastCharIndex = lastKanjiIndex;
            lastKanjiIndex = index + 1;
            // Now check if the kanji should not have furigana based on the question level, or if the furigana is a dash 
            // (for kanji compounds with irregular readings, the furigana is given to the kanji that is learned last, thus the dash).
            // If it doesn't, return an empty fragment
            if (furiganaNotNeeded) {
                return (
                    <Fragment key = {String(index)}>{`${char}`}</Fragment>
                );
            }
            // Otherwise, go here and return the ruby element with the furigana
            else {
                // The format might look weird, but rp tags are used in case the user's browser doesn't support rt. 
                // Also mb-1.5 so that it is properly aligned with the rest of the text
                console.log(`${char} is kanji! Return Ruby TSX!`);
                return (
                    <Fragment key = {String(index)}>
                        <ruby className = "mb-1.5">
                            {char}<rp>(</rp><rt className = "text-[0.65rem]">{furiganaList[kanjiCounter - 1]}</rt><rp>)</rp>
                        </ruby>
                    </Fragment>
                );
            }
        }
        else if (char === " " && JAPANESE_CHAR_REGEX.test(textArray[index + 1]) && JAPANESE_CHAR_REGEX.test(textArray[index - 1])) {
            console.log("This is a space between a Japanese character and a non-Japanese character, so do not render it!");
        }
        else {
            console.log(`${char} is not kanji!`);
            return (
                <Fragment key = {String(index)}>
                    {char}
                </Fragment>
            );
        }
    });
   
    return buildFurigana;
}