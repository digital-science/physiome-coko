
class Condition {

    constructor(condition, enumResolver) {

        const allBindings = [];

        this.expression = condition.expression;

        function _addBindings(e) {
            if(e && e.type === "model" && allBindings.indexOf(e.value) === -1) {
                allBindings.push(e.value);
            }
        }

        function _enumResolve(v) {
            return v.split(".")[1];
        }

        function _resolveEnums(expression) {

            _addBindings(expression.lhs);
            _addBindings(expression.rhs);

            if(expression.lhs && expression.lhs.type === "enum") {
                expression.lhs.value = _enumResolve(expression.lhs.value);
            }
            if(expression.rhs && expression.rhs.type === "enum") {
                expression.rhs.value = _enumResolve(expression.rhs.value);
            }

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
    }

    get bindings() {
        return this._bindings;
    }

}

export default Condition;