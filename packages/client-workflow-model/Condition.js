
// Condition functions
// ---

const ConditionFunctions = {};

ConditionFunctions.length = v => {
    if(v instanceof Array) {
        return v.length;
    }

    if(typeof v === "string") {
        return v.length;
    }
    return undefined;
};


ConditionFunctions.hasValue = v => {
    return !!v;
};



class Condition {

    constructor(condition, enumResolver, mappingResolver) {

        const allBindings = [];

        this.expression = condition.expression;

        function _addBindings(e) {

            if(!e) {
                return;
            }

            if(e.type === "model" && allBindings.indexOf(e.value) === -1) {
                allBindings.push(e.value);
            }

            if(e.type === "function" && e.argument) {
                _addBindings(e.argument);
            }
        }

        function _enumResolve(v) {
            return v.split(".")[1];
        }

        function _resolveEnumsOnValue(value) {
            if(!value) {
                return;
            }
            if(value.type === "enum") {
                value.value = _enumResolve(value.value);
            } else if(value.type === "enum-set") {
                value.value = value.value.map(v => _enumResolve(v));
            }
        }

        function _resolveEnums(expression) {

            _addBindings(expression.lhs);
            _addBindings(expression.rhs);
            _addBindings(expression.argument);

            _resolveEnumsOnValue(expression.lhs);
            _resolveEnumsOnValue(expression.rhs);
            _resolveEnumsOnValue(expression.argument);

            if(expression.expression) {
                if(expression.expression instanceof Array) {
                    expression.expression.forEach(e => {
                        _resolveEnums(e);
                    });
                } else {
                    _resolveEnums(expression.expression);
                }
            }
        }

        this.expression.forEach(expression => {
            _resolveEnums(expression);
        });

        this._bindings = allBindings;
    }

    evaluate(data) {

        if(!this.expression || !this.expression.length) {
            return true;
        }

        function _resolveValue(v) {
            if(v.type === "model") {
                return data.getFieldValue(v.value);
            } else if(v.type === "function") {
                const arg = v.argument ? _resolveValue(v.argument) : undefined;
                return _resolveFunction(v.function, arg);
            }
            return v.value;
        }

        function _resolveFunction(fnName, v) {

            if(ConditionFunctions.hasOwnProperty(fnName)) {
                return ConditionFunctions[fnName](v);
            }
            return undefined;
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

            if(e.op === "function") {

                const arg = _resolveValue(e.argument);
                return  _resolveFunction(e.function, arg);

            } else if(e.op === "!=" || e.op === "==" || e.op === "in" ||
                        e.op === ">=" || e.op === "<=" || e.op === ">" || e.op === "<" ) {

                const lhs = _resolveValue(e.lhs);
                const rhs = _resolveValue(e.rhs);

                switch(e.op) {
                case "!=":
                    return lhs !== rhs;
                case "==":
                    return lhs === rhs;

                case ">=":
                    return lhs >= rhs;
                case "<=":
                    return lhs <= rhs;
                case ">":
                    return lhs > rhs;
                case "<":
                    return lhs < rhs;

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
    }

    get bindings() {
        return this._bindings;
    }

}

export default Condition;