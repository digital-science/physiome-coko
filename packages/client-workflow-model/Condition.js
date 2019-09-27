const { ConditionFunctions } = require('./ConditionFunctions');

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

        function _resolveEnumsOnValue(value) {
            if(!value) {
                return;
            }
            if(value.type === "enum") {
                value._clientValue = enumResolver(value.value, 'client');
                value._serverValue = enumResolver(value.value, 'server');
            } else if(value.type === "enum-set") {
                value._clientValue = value.value.map(v => enumResolver(v, 'client'));
                value._serverValue = value.value.map(v => enumResolver(v, 'server'));
            } else if(value.type === "function" && value.argument) {
                _resolveEnumsOnValue(value.argument);
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


    // Note: the audience here is either 'client' or 'server'. Because of the way GraphQL works, the value we get for an
    // enum client-side is not the same as the value that is used server-side. In order to share this code between
    // the front-end and back-end components we need to specify what format the data we are passing to it is in.
    // When we initialise a condition, we cache both the client and server side values and then use here the value
    // based on the audience.

    evaluate(data, audience) {

        if(!this.expression || !this.expression.length) {
            return true;
        }

        function _resolveValue(v) {
            if(v.type === "model") {
                return data.getFieldValue(v.value);
            } else if(v.type === "function") {
                const arg = v.argument ? _resolveValue(v.argument) : undefined;
                return _resolveFunction(v.function, arg);
            } else if(v.type === "enum" || v.type === "enum-set") {
                return audience === 'client' ? v._clientValue : v._serverValue;
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

    get description() {
        return expressionDescription(this.expression);
    };

}



function _printValue(v) {
    if(v.type === "model") {
        return v.value;
    } else if(v.type === "function") {
        return `${v.function}(${_printValue(v.argument)})`;
    }
    return `'${v.value}'`;
}

function expressionDescription(expression) {

    if(expression instanceof Array) {

        const joined = expression.map((e, index) => {

            if(index === 0) {
                return expressionDescription(e);
            }

            return "" + e.op + " " + expressionDescription(e);
        });

        return "(" + joined.join(" ") + ")"
    }

    if(expression.op === "function") {

        return `${expression.function}(${_printValue(expression.argument)})`;

    } else if(expression.op === "!=" || expression.op === "==" || expression.op === "in" ||
        expression.op === ">=" || expression.op === "<=" || expression.op === ">" || expression.op === "<") {

        return _printValue(expression.lhs) + " " + expression.op + " " + _printValue(expression.rhs);
    }

    if(expression.expression) {
        return expressionDescription(expression.expression);
    }

    return "";
}


module.exports = Condition;