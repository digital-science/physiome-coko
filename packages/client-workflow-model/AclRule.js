const Condition = require('./Condition');
const AclFieldSet = require('./AclFieldSet');
const AclTaskSet = require('./AclTaskSet');


const AclActions = {
    Access: "access",
    Write: "write",
    Read: "read",

    Create: "create",
    Destroy: "destroy",

    Task: "task"
};


class AclRule {

    static get Actions() {
        return AclActions;
    }


    constructor(data, lookupGrouping, resolveEnum) {

        this.allow = (data.permission === "allow");
        this.target = data.target;
        this.actions = data.actions;

        this.taskRule = (this.actions && this.actions.length === 1 && this.actions[0].type === "task");

        if(data.grouping) {
            this.grouping = lookupGrouping(data.grouping, this.taskRule ? AclTaskSet.type : AclFieldSet.type);
        }

        if(data.condition) {
            this.condition = new Condition(data.condition, resolveEnum);
        }
    }

    targetAndActionMatch(targets, action) {
        return targets.indexOf(this.target) !== -1 && this.actions.filter(a => a.type === action).length;
    }

    doesApply(targets, action, object, audience = 'server') {

        // Is the target included in the possible set of allowed targets that this rule applies to.

        if(targets.indexOf(this.target) === -1) {
            return null;
        }

        const matchingActions = this.actions.filter(a => a.type === action);
        if(!matchingActions.length) {
            return null;
        }

        if(this.condition) {

            if(!object) {
                return null;
            }

            if(!this.condition.evaluate(object, audience)) {
                return null;
            }
        }

        const actionRestrictions = matchingActions.filter(a => a.restriction).map(a => a.restriction);

        const r = {match:true, rule:this};
        if(actionRestrictions.length) {
            r.restrictions = actionRestrictions;
        }

        r.grouping = this.grouping || null;
        return r;
    }


    get description() {

        return `${this.allow ? "allow" : "deny"} <${this.target}> [${this.actions.map(a => `${a.type}${a.restriction ? ":" + a.restriction : ""}`).join(", ")}]${this.condition ? " where " + this.condition.description : ""}`;
    }

}

module.exports = AclRule;