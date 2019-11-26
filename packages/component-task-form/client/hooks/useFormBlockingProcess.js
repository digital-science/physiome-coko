import React, { useState, useCallback, useEffect, useMemo } from 'react';

const noopFunction = () => {
};

function useFormBlockingProcess(formValidator, message) {

    if(!formValidator) {
        return [0, noopFunction, noopFunction];
    }

    const [blockingCount, setBlockingCount] = useState(0);
    const process = useMemo(() => formValidator.createBlockingProcess(message), [formValidator, message]);

    useEffect(() => {

        if(blockingCount > 0) {
            formValidator.registerBlockingProcess(process);
        } else {
            formValidator.unregisterBlockingProcess(process);
        }

        return () => {
            formValidator.unregisterBlockingProcess(process);
        };

    }, [formValidator, blockingCount, process]);

    const incrementBlockingProcesses = useCallback(() => {
        setBlockingCount(blockingCount + 1);
    }, [blockingCount]);

    const decrementBlockingProcesses = useCallback(() => {
        if(blockingCount > 0) {
            setBlockingCount(blockingCount - 1);
        }
    }, [blockingCount]);


    return [blockingCount > 0, incrementBlockingProcesses, decrementBlockingProcesses];
}


export default useFormBlockingProcess;