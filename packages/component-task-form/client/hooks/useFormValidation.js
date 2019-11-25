import React, { useState, useMemo, useEffect } from 'react';

const clearValidationWarningsNoop = () => {
};

function useFormValidation(description, formDefinition, formValidator) {

    if(!description || !formDefinition || !formValidator) {
        return [null, clearValidationWarningsNoop];
    }

    const validations = useMemo(() => {
        return formDefinition.findMatchingValidations(description);
    }, [description, formDefinition]);

    if(!validations || !validations.length) {
        return [null, clearValidationWarningsNoop];
    }

    const [validationWarnings, setValidationWarnings] = useState(null);
    if(!formDefinition) {
        return [null, clearValidationWarningsNoop];
    }

    useEffect(() => {

        const interest = formValidator.createInterest((data) => {

            const newWarnings = validations.map(v => {
                if(!v.evaluateCondition(data, 'client')) {
                    return v.evaluateWarning(data);
                }
                return null;
            }).filter(w => !!w);

            setValidationWarnings(newWarnings.length ? newWarnings : null);
            return !newWarnings.length;
        });

        formValidator.registerInterest(interest);

        return () => {
            formValidator.unregisterInterest(interest);
            formValidator.destroyInterest(interest);
        };

    }, [formValidator, validations]);

    return [validationWarnings, () => setValidationWarnings(null)];
}


export default useFormValidation;


function formFieldClassNameWithValidations(className, validationIssues, ...rest) {

    return `${className || ''} ${validationIssues && validationIssues.length ? 'target-form-field-has-issues' : ''}` + (rest ? " " + rest.join(" ") : "");
}

export { formFieldClassNameWithValidations };