import React, { useState, useEffect } from 'react';

function useDebounce(dependentValue, delay, callback = null, initialValue=undefined, additionalDependentValues=null) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(initialValue !== undefined ? initialValue : dependentValue);

    useEffect(
        () => {
            if(debouncedValue === dependentValue) {
                return;
            }

            const handler = setTimeout(() => {
                if(callback) {
                    callback(dependentValue, setDebouncedValue);
                } else {
                    setDebouncedValue(dependentValue);
                }
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }, [dependentValue, ...(additionalDependentValues || [])]
    );

    return [debouncedValue];
}

export default useDebounce;