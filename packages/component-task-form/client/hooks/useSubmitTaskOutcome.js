import React, { useContext } from 'react';
import useCompleteInstanceTask from './../mutations/completeInstanceTask';
import useDestroyInstance from './../mutations/destroyInstance';
import AuthenticatedUserContext from 'component-authentication/client/AuthenticatedUserContext';


const SubmitTaskSuccessReason = 'Success';

const SubmitTaskFailureReason = {
    RequiresValidatedSubmitter: 'RequiresValidatedSubmitter',
    FormValidationFailed: 'FormValidationFailed',
    FormBlockingProcesses: 'FormBlockingProcesses'
};



export default  function useSubmitTaskOutcome(instanceId, formDefinition, instanceType, saveInstanceData, validateForm, submitDidFail, wasSubmitted, getBlockingProcesses) {

    const completeInstanceTask = useCompleteInstanceTask(instanceType);
    const destroyInstance = useDestroyInstance(instanceType);
    const currentUser = useContext(AuthenticatedUserContext);

    const _submitDidFail = (reason, data) => {
        return (submitDidFail ?
            submitDidFail(reason, data).then(() => {
                return reason;
            })
            :
            Promise.resolve(reason)
        );
    };

    return (taskId, outcomeType, options) => {

        // From the task definition we want to find the outcome requested.
        // The outcome can have state variable changes requested alongside it that need
        // to be sent to the server at the same time.

        const outcome = formDefinition.findMatchingOutcome(outcomeType);
        if(!outcome) {
            throw new Error(`Unable to find matching outcome for outcome type (${outcomeType})`);
        }

        // Determine state changes that have been requested, fields should be filtered down to those that are
        // marked as being state variables within the tasks model definition.

        if(outcome.result === "Complete") {

            if(outcome.requiresValidatedSubmitter === true && (!currentUser || !currentUser.emailIsValidated)) {
                return _submitDidFail(SubmitTaskFailureReason.RequiresValidatedSubmitter);
            }

            if(outcome.skipValidations !== true && validateForm && !validateForm()) {
                return _submitDidFail(SubmitTaskFailureReason.FormValidationFailed);
            }

            const blockingProcesses = getBlockingProcesses ? getBlockingProcesses() : null;
            if(blockingProcesses && blockingProcesses.length) {
                return _submitDidFail(SubmitTaskFailureReason.FormBlockingProcesses, blockingProcesses.slice(0));
            }


            const state = instanceType.filterObjectToStateVariables(outcome._clientState || {});

            return saveInstanceData().then(() => {

                return completeInstanceTask(instanceId, taskId, formDefinition.name, outcome.type, state);

            }).then(result => {

                // The server also enforces the requirement that a submitter may have to have an verified/validated email address.
                if(result === 'ValidatedEmailRequired') {

                    return _submitDidFail(SubmitTaskFailureReason.RequiresValidatedSubmitter);

                } else if(result === 'Success') {

                    if(wasSubmitted) {
                        return wasSubmitted(outcome, state).then(() => {
                            return SubmitTaskSuccessReason;
                        });
                    }
                    return SubmitTaskSuccessReason;

                } else if(result === 'ValidationFailed') {

                    return _submitDidFail(SubmitTaskFailureReason.FormValidationFailed);
                }
            });

        } else if(outcome.result === "Destroy") {

            const state = instanceType.filterObjectToStateVariables(outcome._clientState || {});

            return destroyInstance(instanceId, state).then(result => {

                if(wasSubmitted) {
                    return wasSubmitted(outcome, state).then(() => {
                        return SubmitTaskSuccessReason;
                    });
                }
                return SubmitTaskSuccessReason;
            });


        } else if(outcome.result === "Save") {

            // Save doesn't support state changes, just saves the currently modified data back to the instance.

            return saveInstanceData().then(() => {

                if(wasSubmitted) {
                    return wasSubmitted(outcome, {}).then(() => {
                        return SubmitTaskSuccessReason;
                    });
                }
                return SubmitTaskSuccessReason;
            });

        }
    };
}

export { SubmitTaskSuccessReason, SubmitTaskFailureReason };