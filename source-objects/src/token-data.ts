import Span from './span';
import Token from './token';
import type Script from './script';
import Operator from './operator';

export default class TokenData {
    script: Script;
    type: Token = Token.EOF;
    firstLine: number = 1;
    lastLine: number = 1;
    start: number = 0;
    end: number = 0;
    stringValue: string = '';
    numberValue: number = 0;
    flags: string = '';
    operator: Operator | null = null;

    constructor(script: Script) {
        this.script = script;
    }

    copyTo(other) {
        other.type = this.type;
        other.firstLine = this.firstLine;
        other.lastLine = this.lastLine;
        other.start = this.start;
        other.end = this.end;
        other.stringValue = this.stringValue;
        other.numberValue = this.numberValue;
        other.flags = this.flags;
        other.operator = this.operator;
    }

    isKeyword(name) {
        return this.type == Token.KEYWORD && this.stringValue == name;
    }

    isContextKeyword(name) {
        return this.type == Token.IDENTIFIER && this.stringValue == name && this.rawLength == name.length;
    }

    isOperator(type) {
        return this.type == Token.OPERATOR && this.operator == type;
    }

    isCompoundAssignment(type) {
        return this.type == Token.COMPOUND_ASSIGNMENT && this.operator == type;
    }

    get span() {
        return Span.linesThenIndexes(this.script, this.firstLine, this.lastLine, this.start, this.end);
    }

    get rawLength() {
        return this.end - this.start;
    }
}