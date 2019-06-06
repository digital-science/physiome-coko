const logger = require('@pubsweet/logger');

const LookupFieldSet = "fields";
const LookupTaskSet = "task";


function AclSet(data, enums) {

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
        return (type === LookupFieldSet) ? this.fieldSets[name] : this.taskSets[name];
    };

    const resolveEnum = (enumName) => {

        const [enumType, enumValue] = enumName.split(".");
        const type = enums.hasOwnProperty(enumType) ? enums[enumType] : null;

        if(!type) {
            logger.error(`[AclSet] unable to resolve enum ${enumName} during ACL rule construction (enum not defined)`);
            return null;
        }

        if(!type.values.hasOwnProperty(enumValue)) {
            logger.error(`[AclSet] unable to resolve enum ${enumName} during ACL rule construction (enum value not present)`);
            return null;
        }

        return type.values[enumValue];
    };

    if(data.rules) {
        this.rules = data.rules.map(rule => new AclRule(rule, lookup, resolveEnum));
    }
    return this;
}


AclSet.prototype.applyRules = function applyAclRules(targets, action, object) {

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
        let match = rule.doesApply(targets, action, object);

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

    /*const deniedValues = Object.keys(deniedSet);
    if(deniedValues && deniedValues.length) {
        if(actionIsTask) {
            r.deniedTasks = deniedValues;
        } else {
            r.deniedFields = deniedValues;
        }
    }

    if(!actionIsTask) {
        const deniedRestrictions = Object.keys(deniedRestrictionsSet);
        if(deniedRestrictions && deniedRestrictions.length) {
            r.deniedRestrictions = deniedRestrictions;
        }
    }*/

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


    // We now have matching allow actions, we need to obtain the list of allowed groupings (fields or tasks),
    // and aggregate these (removing any denied matches from above).

    const allowedSet = {};
    const allowedRestrictionSet = {};

    allowMatches.forEach(match => {

        if(match.grouping) {
            match.grouping.values.forEach(v => allowedSet[v] = true);
        }

        if(match.restrictions) {
            match.restrictions.forEach(restriction => allowedRestrictionSet[restriction] = true);
        }
    });

    Object.keys(deniedSet).forEach(k => delete allowedSet[k]);
    Object.keys(deniedRestrictionsSet).forEach(k => delete allowedRestrictionSet[k]);


    r.allow = true;
    r.matchingRules = allowMatches.map(m => m.rule);

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

    const allowedRestrictions = Object.keys(allowedRestrictionSet);
    if(allowedRestrictions.length) {
        r.allowedRestrictions = allowedRestrictions;
    }

    return r;
};



function AclFieldSet(data) {

    this.name = data.name;
    this.values = data.fields;
    return this;
}

function AclTaskSet(data) {

    this.name = data.name;
    this.values = data.tasks;
    return this;
}


function AclRule(data, lookupGrouping, resolveEnum) {

    this.allow = (data.permission === "allow");
    this.target = data.target;
    this.actions = data.actions;

    this.taskRule = (this.actions && this.actions.length === 1 && this.actions[0].type === "task");

    if(data.grouping) {
        this.grouping = lookupGrouping(data.grouping, this.taskRule ? LookupTaskSet : LookupFieldSet);
    }

    if(data.condition) {
        this.condition = new AclCondition(data.condition, resolveEnum);
    }

    return this;
}


AclRule.prototype.doesApply = function doesRuleApply(targets, action, object) {

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
            logger.warn('[AclRule/doesApply] condition provided on rule that does not apply to a specific object which the rule can be evaluated against');
            return null;
        }

        if(!this.condition.evaluate(object)) {
            return null;
        }
    }

    const actionRestrictions = matchingActions.filter(a => a.restriction).map(a => a.restriction);

    const r = {match:true, rule:this};
    if(actionRestrictions.length) {
        r.restrictions = actionRestrictions;
    }

    if(this.grouping) {
        r.grouping = this.grouping;
    } else {
        r.grouping = null;
    }

    return r;
};



function _resolveEnumsForExpression(expression, resolveEnum) {

    if(expression instanceof Array) {
        expression.forEach(e => _resolveEnumsForExpression(e, resolveEnum));
        return;
    }

    if(expression.lhs && expression.lhs.type === "enum") {
        expression.lhs.value = resolveEnum(expression.lhs.value);
    }

    if(expression.rhs && expression.rhs.type === "enum") {
        expression.rhs.value = resolveEnum(expression.rhs.value);
    }

    if(expression.expression) {
        _resolveEnumsForExpression(expression.expression, resolveEnum);
    }
}



function AclCondition(condition, resolveEnum) {

    this.expression = condition.expression;
    _resolveEnumsForExpression(this.expression, resolveEnum);
}

AclCondition.prototype.evaluate = function conditionEval(data) {

    if(!this.expression || !this.expression.length) {
        return true;
    }

    function _resolveValue(v) {
        if(v.type === "model") {
            return _getModelField(data, v.value);
        }
        return v.value;
    }

    function _reduceExpressionList(expressions) {

        return expressions.reduce((accumulator, e, index) => {

            if(index === 0) {
                return _evalExpression(e);
            }

            const r = _evalExpression(e);

            if(e.op === "||") {
                return accumulator || r;
            }

            return accumulator && r;

        }, true);
    }

    function _evalExpression(e) {

        if(!e) {
            return false;
        }

        if(e instanceof Array) {
            return _reduceExpressionList(e);
        }

        if(e.op === "!=" || e.op === "==" || e.op === "in") {

            const lhs = _resolveValue(e.lhs);
            const rhs = _resolveValue(e.rhs);

            switch(e.op) {
            case "!=":
                return lhs !== rhs;
            case "==":
                return lhs === rhs;
            case "in":
                return (rhs instanceof Array ? rhs : [rhs]).indexOf(lhs) !== -1;
            }

            return false;
        }

        if(e.expression) {
            return _evalExpression(e.expression);
        }

        return false;
    }

    return _evalExpression(this.expression);
};


function _get(obj, key) {
    if(obj && obj.hasOwnProperty(key)) {
        return obj[key];
    }
    return null;
}


function _getModelField(data, field) {

    if(field.indexOf('.') !== -1) {
        const path = field.split('.');
        let obj =  data;

        for(let i = 0; i < path.length; i++) {
            obj = _get(obj, path[i]);
            if(!obj) {
                break;
            }
        }

        return obj;
    }

    return data[field] || undefined;
}



module.exports = AclSet;
