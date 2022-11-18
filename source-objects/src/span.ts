import type Script from './script';

export default class Span {
    script: Script;
    firstLine: number;
    lastLine: number;
    start: number;
    end: number;

    constructor(script, firstLine, lastLine, start, end) {
        this.script = script;
        /**
         * First line number, starting at 1.
         */
        this.firstLine = firstLine;
        /**
         * Last line number, starting at 1.
         */
        this.lastLine = lastLine;
        /**
         * Last index, starting at 0.
         */
        this.start = start;
        /**
         * Last index, starting at 0.
         */
        this.end = end;
        Object.freeze(this);
    }

    static linesThenIndexes(script, firstLine, lastLine, start, end) {
        return new Span(script, firstLine, lastLine, start, end);
    }

    static byLinesThenIndexes(script, firstLine, lastLine, start, end) {
        return new Span(script, firstLine, lastLine, start, end);
    }

    static inline(script, line, start, end) {
        return new Span(script, line, line, start, end);
    }

    static point(script, line, index) {
        return Span.inline(script, line, index, index);
    }

    get firstColumn() {
        return this.start - this.script.getLineStart(this.firstLine);
    }

    get lastColumn() {
        return this.end - this.script.getLineStart(this.lastLine);
    }

    /**
     * Combines two `Span` into one, going from `this` to `other`.
     */
    to(other) {
        return Span.linesThenIndexes(this.script, this.firstLine, other.lastLine, this.start, other.end);
    }

    compareTo(other) {
        return this.start < other.start ? -1 : this.start == other.start ? 0 : 1;
    }
}