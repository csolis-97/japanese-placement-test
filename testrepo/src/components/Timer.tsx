"use client";

import { useState, useEffect } from "react";

interface TimerProps {
    timerOver: () => void;
};

// These consts will handle the duration of the test, change it if anything is needed
const ONE_MINUTE = 60;
const ONE_HOUR = ONE_MINUTE * 5;
//const ONE_HOUR = ONE_MINUTE * ONE_MINUTE;

export default function Timer({ timerOver } : TimerProps){
    // This useState will be used to track the current value of time timer, which starts at the value of ONE_HOUR
    const [count, setCount] = useState<number>(ONE_HOUR);

    // EndTime is the current date, plus the value of ONE_HOUR multipled by 1000, or 1 second
    const [endTime, setEndTime] = useState<number>(Date.now() + ONE_HOUR * 1000);

    // These consts will be used to calculate how the minutes and seconds are displayed.
    const second = count % ONE_MINUTE;
    const secondDisplay = String(second).padStart(2, "0");
    const minute = Math.floor(count / ONE_MINUTE);
    const minuteDisplay = String(minute);

    // This useEffect will handle the counter. Once it reaches 0, end the test. Otherwise calculate the difference between
    // The time the test will end and the current timeStamp. If the difference is below 0, set it to 0, otherwise set newVal
    // to the difference divided by 1000, or 1 second.
    useEffect(() => {
        const startTimer = setInterval(() => setCount(prev => {
            if (prev > 0) {
                //console.log(`CURRENT PREV VALUE: ${prev}`);
                const timeStamp = Date.now();
                //console.log(`CURRENT TIMESTAMP: ${timeStamp}`);
                const timeDifference = (endTime - timeStamp);
                //console.log(`CURRENT DIFFERENCE BETWEEN TIMESTAMP AND ENDTIME: ${timeDifference}`);
                // To avoid display errors, if the value of timeDifference goes under 0, newVal is set to 0 instead
                const newVal = (Math.max(0, Math.ceil(timeDifference / 1000)));
                //console.log(`NEW VALUE OF COUNT: ${newVal}`);
                return newVal;
            }
            else {
                return prev;
            }
            // Every 100 ms to prevent jumping between numbers in the counter display
        }), 100);

        // Clean up logic. Basically the inverse of the regular logic so that it unmounts and remounts
        // instead of decrementing the timer twice.
        return () => {
            clearInterval(startTimer);
        };
    },[]); // If the dependency array had count, then it would break

    // This useEffect will handle setting the time up to true once count <= 0
    useEffect(() => {
        if (count <= 0) {
            timerOver();
            console.log("THE TEST IS OVER!");
        }
    }, [count, timerOver]);

    // DEBUG, this useEffect will be used to track the current values of each useState
    useEffect(() => {
        //console.log(`CURRENT VALUE OF COUNT: ${count}`);
        //console.log(`CURRENT VALUE OF ENDTIME: ${endTime}`);
    }, [count, endTime, timerOver]);

    return (
        <div className = {`
            flex p-4
            mb-8 sm:mb-12
            bg-gray-100 rounded-lg 
            shadow-md
            min-w-[10.175rem] sm:min-w-[14rem]
        `}>
            <p className = "text-base sm:text-2xl text-gray-700 font-semibold">{`Time Left: ${minuteDisplay}:${secondDisplay}`}</p>
        </div>
    );
}