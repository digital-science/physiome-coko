class FormValidator {

    constructor() {
        this.interests = [];
        this._blockingProcesses = [];
    }

    registerInterest(listener) {

        if(this.interests.indexOf(listener) === -1) {
            this.interests.push(listener);
        }
    }

    unregisterInterest(listener) {
        const index = this.interests.indexOf(listener);
        if (index > -1) {
            this.interests.splice(index, 1);
        }
    }

    createInterest(callback) {
        return {callback};
    }

    destroyInterest(listener) {
        delete listener.callback;
    }


    validate(data) {

        let result = true;
        this.interests.forEach(listener => {
            const r = listener.callback(data);
            if(!r) {
                result = false;
            }
        });
        return result;
    }


    // Blocking process - something that is ongoing within a form that should prevent submission of the form.
    // For example, a file upload is underway and submission should not be allowed until that has completed.

    createBlockingProcess(message) {
        return {message};
    }

    registerBlockingProcess(process) {
        if(this._blockingProcesses.indexOf(process) === -1) {
            this._blockingProcesses.push(process);
        }
    }

    unregisterBlockingProcess(process) {
        const index = this._blockingProcesses.indexOf(process);
        if (index > -1) {
            this._blockingProcesses.splice(index, 1);
        }
    }

    get blockingProcesses() {
        return this._blockingProcesses;
    }

}


export default FormValidator;