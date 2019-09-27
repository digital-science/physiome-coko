class AclFieldSet {

    static get type() {
        return 'fields';
    }

    constructor(data) {
        this.name = data.name;
        this.values = data.fields;
    }
}

module.exports = AclFieldSet;