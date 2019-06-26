class FormValidator {

    constructor() {
        this.interests = [];
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
        this.interests.forEach(listener => result = result && listener.callback(data));
        return result;
    }

}


export default FormValidator;