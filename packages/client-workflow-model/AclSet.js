const AclRule = require('./AclRule');
const AclFieldSet = require('./AclFieldSet');
const AclTaskSet = require('./AclTaskSet');

class AclSet {

    constructor(data, resolveEnum) {

        this.rules = [];
        this.fieldSets = {};
        this.taskSets = {};

        if(data.fields) {
            Object.values(data.fields).forEach(d => this.fieldSets[d.name] = new AclFieldSet(d));
        }

        if(data.tasks) {
            Object.values(data.tasks).forEach(d => this.taskSets[d.name] = new AclTaskSet(d));
        }

        const lookup = (name, type) => {
            return (type === AclFieldSet.type) ? this.fieldSets[name] : this.taskSets[name];
        };

        if(data.rules) {
            this.rules = data.rules.map(rule => new AclRule(rule, lookup, resolveEnum));
        }

    }


    applyRules(targets, action, object, audience = 'server') {

        // The response to the apply rules function returns a straight yes/no, including the set of fields
        // that are allowed to be read/written depending on the type of action requested.

        const actionIsTask = (action === "task");

        const allowRules = this.rules.filter(r => r.allow).filter(r => r.taskRule === actionIsTask);
        const allowLength = allowRules.length;
        const allowMatches = [];

        const denyRules = this.rules.filter(r => !r.allow).filter(r => r.taskRule === actionIsTask);
        const denyLength = denyRules.length;
        const denyMatches = [];

        const r = {allow:false};

        for(let i = 0; i < denyLength; i++) {

            const rule = denyRules[i];
            let match = rule.doesApply(targets, action, object, audience);

            if(match && match.match) {

                if(!match.grouping) {
                    r.matchingRules = [rule];
                    return r;
                }

                denyMatches.push(match);
            }
        }

        // The deny rules only now contain a listing of "fields" or "tasks" that are NOT allowed.
        // These can be applied on top of the determined allowed rules to specifically remove
        // fields and tasks from what is considered allowed.

        const deniedSet = {};
        const deniedRestrictionsSet = {};

        denyMatches.forEach(match => {
            match.grouping.values.forEach(v => deniedSet[v] = true);

            if(match.restrictions) {
                match.restrictions.forEach(restriction => deniedRestrictionsSet[restriction] = true);
            }
        });

        for(let i = 0; i < allowLength; i++) {

            const rule = allowRules[i];
            let match = rule.doesApply(targets, action, object);

            if(match && match.match) {
                allowMatches.push(match);
            }
        }

        // No rules match to allow the action to take place, therefore we don't allow the action (with no matching rules).
        // All actions must be explicitly allowed via an ACL rule.

        if(!allowMatches.length) {
            r.matchingRules = [];
            return r;
        }

        // FIXME: when returning matches, we need to return a list of explict denied tasks and fields


        // We now have matching allow actions, we need to obtain the list of allowed groupings (fields or tasks),
        // and aggregate these (removing any denied matches from above).

        const allowedSet = {};
        const allowedRestrictionSet = {};
        let allowAllEncountered = false;

        allowMatches.forEach(match => {

            if(match.grouping) {
                match.grouping.values.forEach(v => allowedSet[v] = true);
            } else {
                allowAllEncountered = true;
            }

            if(match.restrictions) {
                match.restrictions.forEach(restriction => allowedRestrictionSet[restriction] = true);
            }
        });

        Object.keys(deniedSet).forEach(k => delete allowedSet[k]);
        Object.keys(deniedRestrictionsSet).forEach(k => delete allowedRestrictionSet[k]);


        r.allow = true;
        r.matchingRules = allowMatches.map(m => m.rule);

        if(!allowAllEncountered) {
            if(actionIsTask) {
                r.allowedTasks = Object.keys(allowedSet);
                if(!r.allowedTasks.length) {
                    delete r.allowedTasks;
                }
            } else {
                r.allowedFields = Object.keys(allowedSet);
                if(!r.allowedFields.length) {
                    delete r.allowedFields;
                }
            }
        }

        const allowedRestrictions = Object.keys(allowedRestrictionSet);
        if(allowedRestrictions.length) {
            r.allowedRestrictions = allowedRestrictions;
        }

        return r;
    }
}

module.exports = AclSet;