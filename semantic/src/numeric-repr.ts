export class Byte {
    static readonly MIN_VALUE: Byte = new Byte(0);
    static readonly MAX_VALUE: Byte = new Byte(0xff);

    private _v: number;

    constructor(v: number | Byte) {
        let v2 = typeof v == 'number' ? v : v._v;
        v2 = Math.max(0, v2);
        v2 = Math.min(v2, 0xff);
        this._v = v2;
    }

    equals(v: number | Byte): boolean {
        return this._v == new Byte(v)._v;
    }

    lt(v: number | Byte): boolean {
        return this._v < new Byte(v)._v;
    }

    gt(v: number | Byte): boolean {
        return this._v > new Byte(v)._v;
    }

    le(v: number | Byte): boolean {
        return this._v <= new Byte(v)._v;
    }

    ge(v: number | Byte): boolean {
        return this._v >= new Byte(v)._v;
    }

    add(v: number | Byte): Byte {
        return this._v + new Byte(v)._v;
    }

    subtract(v: number | Byte): Byte {
        return this._v + new Byte(v)._v;
    }

    multiply(v: number | Byte): Byte {
        return this._v * new Byte(v)._v;
    }

    divide(v: number | Byte): Byte {
        return this._v / new Byte(v)._v;
    }

    remainder(v: number | Byte): Byte {
        return this._v % new Byte(v)._v;
    }

    shiftLeft(v: number | Byte): Byte {
        return this._v << new Byte(v)._v;
    }

    shiftRight(v: number | Byte): Byte {
        return this._v >> new Byte(v)._v;
    }

    shiftRightUnsigned(v: number | Byte): Byte {
        return this._v >>> new Byte(v)._v;
    }

    and(v: number | Byte): Byte {
        return this._v & new Byte(v)._v;
    }

    xor(v: number | Byte): Byte {
        return this._v ^ new Byte(v)._v;
    }

    or(v: number | Byte): Byte {
        return this._v | new Byte(v)._v;
    }

    toString(base: number = 10): string {
        return this._v.toString(base);
    }

    valueOf(): number {
        return this._v;
    }
}

export class Short {
    static readonly MIN_VALUE: Short = new Short(-0x8000);
    static readonly MAX_VALUE: Short = new Short(0x7fff);

    private _v: number;

    constructor(v: number | Short) {
        let v2 = typeof v == 'number' ? v : v._v;
        v2 = Math.max(-0x8000, v2);
        v2 = Math.min(v2, 0x7fff);
        this._v = v2;
    }

    equals(v: number | Short): boolean {
        return this._v == new Short(v)._v;
    }

    lt(v: number | Short): boolean {
        return this._v < new Short(v)._v;
    }

    gt(v: number | Short): boolean {
        return this._v > new Short(v)._v;
    }

    le(v: number | Short): boolean {
        return this._v <= new Short(v)._v;
    }

    ge(v: number | Short): boolean {
        return this._v >= new Short(v)._v;
    }

    add(v: number | Short): Short {
        return this._v + new Short(v)._v;
    }

    subtract(v: number | Short): Short {
        return this._v + new Short(v)._v;
    }

    multiply(v: number | Short): Short {
        return this._v * new Short(v)._v;
    }

    divide(v: number | Short): Short {
        return this._v / new Short(v)._v;
    }

    remainder(v: number | Short): Short {
        return this._v % new Short(v)._v;
    }

    shiftLeft(v: number | Short): Short {
        return this._v << new Short(v)._v;
    }

    shiftRight(v: number | Short): Short {
        return this._v >> new Short(v)._v;
    }

    shiftRightUnsigned(v: number | Short): Short {
        return this._v >>> new Short(v)._v;
    }

    and(v: number | Short): Short {
        return this._v & new Short(v)._v;
    }

    xor(v: number | Short): Short {
        return this._v ^ new Short(v)._v;
    }

    or(v: number | Short): Short {
        return this._v | new Short(v)._v;
    }

    toString(base: number = 10): string {
        return this._v.toString(base);
    }

    valueOf(): number {
        return this._v;
    }
}

export class Int {
    static readonly MIN_VALUE: Int = new Int(-0x80000000);
    static readonly MAX_VALUE: Int = new Int(0x7fffffff);

    private _v: number;

    constructor(v: number | Int) {
        let v2 = typeof v == 'number' ? v : v._v;
        v2 = Math.max(-0x80000000, v2);
        v2 = Math.min(v2, 0x7fffffff);
        this._v = v2;
    }

    equals(v: number | Int): boolean {
        return this._v == new Int(v)._v;
    }

    lt(v: number | Int): boolean {
        return this._v < new Int(v)._v;
    }

    gt(v: number | Int): boolean {
        return this._v > new Int(v)._v;
    }

    le(v: number | Int): boolean {
        return this._v <= new Int(v)._v;
    }

    ge(v: number | Int): boolean {
        return this._v >= new Int(v)._v;
    }

    add(v: number | Int): Int {
        return this._v + new Int(v)._v;
    }

    subtract(v: number | Int): Int {
        return this._v + new Int(v)._v;
    }

    multiply(v: number | Int): Int {
        return this._v * new Int(v)._v;
    }

    divide(v: number | Int): Int {
        return this._v / new Int(v)._v;
    }

    remainder(v: number | Int): Int {
        return this._v % new Int(v)._v;
    }

    shiftLeft(v: number | Int): Int {
        return this._v << new Int(v)._v;
    }

    shiftRight(v: number | Int): Int {
        return this._v >> new Int(v)._v;
    }

    shiftRightUnsigned(v: number | Int): Int {
        return this._v >>> new Int(v)._v;
    }

    and(v: number | Int): Int {
        return this._v & new Int(v)._v;
    }

    xor(v: number | Int): Int {
        return this._v ^ new Int(v)._v;
    }

    or(v: number | Int): Int {
        return this._v | new Int(v)._v;
    }

    toString(base: number = 10): string {
        return this._v.toString(base);
    }

    valueOf(): number {
        return this._v;
    }
}

export class Long {
    static readonly MIN_VALUE: Long = new Long(-0x8000000000000000n);
    static readonly MAX_VALUE: Long = new Long(0x7fffffffffffffffn);

    private _v: number;

    constructor(v: number | bigint | Long) {
        let v2 = typeof v == 'number' ? BigInt(v) : ? typeof v == 'bigint' ? v : v._v;
        v2 = Math.max(-0x8000000000000000n, v2);
        v2 = Math.min(v2, 0x7fffffffffffffffn);
        this._v = v2;
    }

    equals(v: number | bigint | Long): boolean {
        return this._v == new Long(v)._v;
    }

    lt(v: number | bigint | Long): boolean {
        return this._v < new Long(v)._v;
    }

    gt(v: number | bigint | Long): boolean {
        return this._v > new Long(v)._v;
    }

    le(v: number | bigint | Long): boolean {
        return this._v <= new Long(v)._v;
    }

    ge(v: number | bigint | Long): boolean {
        return this._v >= new Long(v)._v;
    }

    add(v: number | bigint | Long): Long {
        return this._v + new Long(v)._v;
    }

    subtract(v: number | bigint | Long): Long {
        return this._v + new Long(v)._v;
    }

    multiply(v: number | bigint | Long): Long {
        return this._v * new Long(v)._v;
    }

    divide(v: number | bigint | Long): Long {
        return this._v / new Long(v)._v;
    }

    remainder(v: number | bigint | Long): Long {
        return this._v % new Long(v)._v;
    }

    shiftLeft(v: number | bigint | Long): Long {
        return this._v << new Long(v)._v;
    }

    shiftRight(v: number | bigint | Long): Long {
        return this._v >> new Long(v)._v;
    }

    shiftRightUnsigned(v: number | bigint | Long): Long {
        return this._v >>> new Long(v)._v;
    }

    and(v: number | bigint | Long): Long {
        return this._v & new Long(v)._v;
    }

    xor(v: number | bigint | Long): Long {
        return this._v ^ new Long(v)._v;
    }

    or(v: number | bigint | Long): Long {
        return this._v | new Long(v)._v;
    }

    toString(base: number = 10): string {
        return this._v.toString(base);
    }

    valueOf(): bigint {
        return this._v;
    }
}