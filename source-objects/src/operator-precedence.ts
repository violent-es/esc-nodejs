// precedences based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
export default class OperatorPrecedence {
    static _byValue = new Map;

    static POSTFIX = new OperatorPrecedence(17);
    static UNARY = new OperatorPrecedence(16);
    static EXPONENTIATION = new OperatorPrecedence(15);
    static MULTIPLICATIVE = new OperatorPrecedence(14);
    static ADDITIVE = new OperatorPrecedence(13);
    static SHIFT = new OperatorPrecedence(12);
    static RELATIONAL = new OperatorPrecedence(11);
    static EQUALITY = new OperatorPrecedence(10);
    static BITWISE_AND = new OperatorPrecedence(9);
    static BITWISE_XOR = new OperatorPrecedence(8);
    static BITWISE_OR = new OperatorPrecedence(7);
    static LOGICAL_AND = new OperatorPrecedence(6);
    static LOGICAL_XOR = new OperatorPrecedence(5);
    static LOGICAL_OR = new OperatorPrecedence(4);
    static NULL_COALESCING = new OperatorPrecedence(3);
    static ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION = new OperatorPrecedence(2);
    static LIST = new OperatorPrecedence(1);

    private _v: number;

    constructor(v) {
        this._v = v;
        OperatorPrecedence._byValue.set(v, this);
    }

    static valueOf(v) {
        return OperatorPrecedence._byValue.get(v) || null;
    }

    valueOf() {
        return this._v;
    }
}