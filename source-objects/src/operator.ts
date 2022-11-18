export default class Operator {
    static _byValue = new Map;

    static AWAIT = new Operator(0x00, 'await');
    static YIELD = new Operator(0x01, 'yield');
    static AS = new Operator(0x02, 'as');
    static AS_STRICT = new Operator(0x03, 'as!');
    static INSTANCEOF = new Operator(0x04, 'instanceof');
    static IS = new Operator(0x05, 'is');
    static DELETE = new Operator(0x06, 'delete');
    static TYPEOF = new Operator(0x07, 'typeof');
    static VOID = new Operator(0x08, 'void');
    static LOGICAL_NOT = new Operator(0x09, '!');
    static POSITIVE = new Operator(0x0a, '+');
    static NEGATE = new Operator(0x0b, '-');
    static BITWISE_NOT = new Operator(0x0c, '~');
    static ADD = new Operator(0x0d, '+');
    static SUBTRACT = new Operator(0x0e, '-');
    static MULTIPLY = new Operator(0x0f, '*');
    static DIVIDE = new Operator(0x10, '/');
    static REMAINDER = new Operator(0x11, '%');
    static POW = new Operator(0x12, '**');
    static LOGICAL_AND = new Operator(0x13, '&&');
    static LOGICAL_XOR = new Operator(0x14, '^^');
    static LOGICAL_OR = new Operator(0x15, '||');
    static BITWISE_AND = new Operator(0x16, '&');
    static BITWISE_XOR = new Operator(0x17, '^');
    static BITWISE_OR = new Operator(0x18, '|');
    static LEFT_SHIFT = new Operator(0x19, '<<');
    static RIGHT_SHIFT = new Operator(0x1a, '>>');
    static UNSIGNED_RIGHT_SHIFT = new Operator(0x1b, '>>>');
    static EQUALS = new Operator(0x1c, '==');
    static NOT_EQUALS = new Operator(0x1d, '!=');
    static STRICT_EQUALS = new Operator(0x1e, '===');
    static STRICT_NOT_EQUALS = new Operator(0x1f, '!==');
    static LT = new Operator(0x20, '<');
    static GT = new Operator(0x21, '>');
    static LE = new Operator(0x22, '<=');
    static GE = new Operator(0x23, '>=');
    static NON_NULL = new Operator(0x24, '!');
    static PRE_INCREMENT = new Operator(0x25, '++');
    static PRE_DECREMENT = new Operator(0x26, '--');
    static POST_INCREMENT = new Operator(0x27, '++');
    static POST_DECREMENT = new Operator(0x28, '--');
    static PROXY_2_GET_INDEX = new Operator(0x29, 'getIndex');
    static PROXY_2_SET_INDEX = new Operator(0x2a, 'setIndex');
    static PROXY_2_DELETE_INDEX = new Operator(0x2b, 'deleteIndex');
    static PROXY_2_ITERATE_KEYS = new Operator(0x2c, 'iterateKeys');
    static PROXY_2_ITERATE_VALUES = new Operator(0x2d, 'iterateValues');
    /**
     * `in` operator. Constant also used for proxy `has` declarations.
     */
    static IN = new Operator(0x2e, 'in');
    static PROXY_2_CONVERT_IMPLICIT = new Operator(0x2f, 'convertImplicit');
    static PROXY_2_CONVERT_EXPLICIT = new Operator(0x30, 'convertExplicit');
    static NULL_COALESCING = new Operator(0x31, '??');

    static _unary = new Set([
        Operator.AWAIT, Operator.YIELD, Operator.DELETE,
        Operator.TYPEOF, Operator.VOID, Operator.LOGICAL_NOT,
        Operator.POSITIVE, Operator.NEGATE, Operator.BITWISE_NOT,
        Operator.NON_NULL, Operator.PRE_INCREMENT, Operator.PRE_DECREMENT,
        Operator.POST_INCREMENT, Operator.POST_DECREMENT,
    ]);

    static _alwaysReturnBoolean = new Set([
        Operator.EQUALS, Operator.NOT_EQUALS, Operator.STRICT_EQUALS, Operator.STRICT_NOT_EQUALS,
        Operator.LT, Operator.GT, Operator.LE, Operator.GE,
        Operator.DELETE, Operator.LOGICAL_NOT, Operator.IN,
        Operator.IS, Operator.INSTANCEOF,
    ]);

    private _value: number;
    private _string: string;

    constructor(value, string) {
        this._value = value;
        this._string = string;
        Operator._byValue.set(value, this);
    }

    static valueOf(value) {
        return this._byValue.get(value) || null;
    }

    get isUnary() {
        return Operator._unary.has(this);
    }

    get alwaysReturnsBoolean() {
        return Operator._alwaysReturnBoolean.has(this);
    }

    get proxyNumParams() {
        if (this.isUnary
            || this == Operator.PROXY_2_GET_INDEX
            || this == Operator.PROXY_2_DELETE_INDEX
            || this == Operator.PROXY_2_CONVERT_IMPLICIT
            || this == Operator.PROXY_2_CONVERT_EXPLICIT
            || this == Operator.IN) return 1;
        if (this == Operator.PROXY_2_ITERATE_KEYS || this == Operator.PROXY_2_ITERATE_VALUES)
            return 0;
        return 2;
    }

    toString() {
        return this._string;
    }

    valueOf() {
        return this._value;
    }
}