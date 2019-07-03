// FIXME: the client and server code here should be re-used (one in the same)
// this also applies to the function definitions


function Condition(condition, resolveEnum) {


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
            value.value = resolveEnum(value.value);
        } else if(value.type === "enum-set") {
            value.value = value.value.map(v => resolveEnum(v));
        } else if(value.type === "function" && value.argument) {
            _resolveEnumsOnValue(value.argument, resolveEnum);
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

Condition.prototype.bindings = function bindings() {
    return this._bindings;
};

Condition.prototype.evaluate = function conditionEval(data) {

    if(!this.expression || !this.expression.length) {
        return true;
    }

    function _resolveValue(v) {
        if(v.type === "model") {
            return _getModelField(data, v.value);
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
};



function _printValue(v) {
    if(v.type === "model") {
        return v.value
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
        expression.op === ">=" || expression.op === "<=" || expression.op === ">" || e.op === "<") {

        return _printValue(expression.lhs) + " " + expression.op + " " + _printValue(expression.rhs);
    }

    if(expression.expression) {
        return expressionDescription(expression.expression);
    }

    return "";
}


Condition.prototype.description = function() {
    return expressionDescription(this.expression);
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





const ConditionFunctions = {};

ConditionFunctions.length = v => {
    if(v instanceof Array) {
        return v.length;
    }

    if(typeof v === "string") {
        return v.length;
    }

    return 0;
};


ConditionFunctions.hasValue = v => {
    return !!v;
};

ConditionFunctions.correspondingAuthors =  v => {
    if(!v || !v.length) {
        return false;
    }
    return v.filter(a => a.isCorresponding === true).length > 0;
};


module.exports = Condition;
