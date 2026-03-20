"use client";

import { useState, useEffect } from "react";

interface TimerProps {
    timerOver: () => void;
};

export default function Timer({timerOver} : TimerProps){

    const ONE_MINUTE = 60;
    const ONE_HOUR = ONE_MINUTE * 1;
    //const ONE_HOUR = ONE_MINUTE * ONE_MINUTE;

    const [count, setCount] = useState<number>(ONE_HOUR);

    const second = count % ONE_MINUTE;
    const secondDisplay = String(second).padStart(2, "0");
    const minute = Math.floor(count / ONE_MINUTE);
    const minuteDisplay = String(minute);

    // This useEffect will handle the counter. Once it reaches 0, end the test. Otherwise decrement each second
    useEffect(() => {
            // Check this syntax later
        const startTimer = setInterval(() => setCount(prev => {
            if (prev > 0) {
                const newVal = prev - 1;
                console.log(`NEW VALUE OF COUNT: ${newVal}`);
                return newVal;
            }
            else {
                return prev;
            }
        }), 1000);

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

    // DEBUG,  This useEffect will be used to track the current values of each useState
    useEffect(() => {
        console.log(`CURRENT VALUE OF COUNT: ${count}`);
    }, [count, timerOver]);

    //             <p>{`${count}`}</p>

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