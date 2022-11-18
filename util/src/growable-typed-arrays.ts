export class GrowableInt32Array {
    _array: Int32Array;
    _length: number;

    constructor() {
        this._array = new Int32Array(16);
        this._length = 0;
    }

    get typedArray() {
        let r = new Int32Array(this._length);
        r.set(this._array, 0);
        return r;
    }

    get length() {
        return this._length;
    }

    set length(v) {
        v = Math.max(0, v);
        let k = this._array;
        this._array = new Int32Array(v);
        this._array.set(k);
        this._length = v;
    }

    at(index): number | undefined {
        return index < this._length ? this._array[index] : undefined;
    }

    get first() {
        return this.length != 0 ? this._array[0] : undefined;
    }
    set first(v) {
        if (this.length != 0) this._array[0] = v;
    }

    get last() {
        return this.length != 0 ? this._array[this.length - 1] : undefined;
    }
    set last(v) {
        if (this._length != 0)
            this._array[this.length - 1] = v;
    }

    push(...argumentsList) {
        for (let arg of argumentsList) {
            if (arg instanceof Int32Array) this._pushTypedArray(arg);
            else if (arg instanceof GrowableInt32Array) this._pushGrowableTypedArray(arg);
            else this._pushSingleValue(arg);
        }
        return this.length;
    }

    _pushSingleValue(v) {
        if (this.length >= this._array.length) {
            let k = this._array;
            this._array = new Int32Array(k.length * 2);
            this._array.set(k);
        }
        this._array[this._length++] = v;
    }

    _pushTypedArray(v) {
        let newLength = this.length + v.length;
        if (newLength > this._array.length) {
            let k = this._array;
            this._array = new Int32Array(k.length + v.length);
            this._array.set(k);
        }
        this._array.set(v, this._length);
        this._length = newLength;
    }

    _pushGrowableTypedArray(v) {
        this._pushTypedArray(v.typedArray);
    }

    *[Symbol.iterator]() {
        for (let i = 0; i != this._length; ++i) yield this.at(i);
    }
}