class AclTaskSet {

    static get type() {
        return 'task';
    }

    constructor(data) {
        this.name = data.name;
        this.values = data.tasks;
    }
}

module.exports = AclTaskSet;