import { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';

function useTimedMinimumDisplay(minimumDisplayTime = 1500) {

    const [display, setDisplay] = useState(0);
    const [timing, setTiming] = useState(0);
    const displayRef = useRef();

    useLayoutEffect(() => {
        displayRef.current = display;
    });

    const showTimedDisplay = useCallback(() => {
        setDisplay(displayRef.current + 1);
        return new Date();
    }, [displayRef]);

    const removeTimedDisplay = useCallback((token, immediate=false) => {

        if(immediate) {
            setDisplay(0);
            return;
        }

        const difference = new Date() - token;

        if(difference > minimumDisplayTime) {
            if(displayRef.current > 0) {
                setDisplay(displayRef.current - 1);
            }
            return;
        }

        setTiming(minimumDisplayTime - difference);

    }, [displayRef]);

    useEffect(() => {

        if(timing <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            if(displayRef.current > 0) {
                setDisplay(displayRef.current - 1);
            }
        }, timing);

        return () => {
            clearTimeout(timer);
        };

    }, [timing]);

    return [display, showTimedDisplay, removeTimedDisplay];
}

export default useTimedMinimumDisplay;