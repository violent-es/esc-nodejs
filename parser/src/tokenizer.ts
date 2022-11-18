import {Script, Token, TokenData, Comment, Operator, Problem, ProblemKind, SourceCharacter, Span, isStrictKeyword} from 'com.violentes.esc.source-objects';
import ParseError from './parse-error';

export default class Tokenizer {
    script: Script;
    token: TokenData;
    content: string;
    contentLength: number;
    index: number;
    line: number;
    private _sliceStart: number;

    constructor(script) {
        this.script = script;
        this.token = new TokenData(script);
        this.content = script.content;
        this.contentLength = script.content.length;
        this.index = 0;
        this.line = 1;
        this._sliceStart = 0;
    }

    get _atEOF() {
        return this.index >= this.contentLength;
    }

    getCharacterSpan() {
        return Span.point(this.script, this.line, this.index);
    }

    raiseUnexpected() {
        throw new ParseError(this.script.collectProblem(this._atEOF ? Problem.syntaxError('unexpected', this.getCharacterSpan(), {t:Token.EOF}) : Problem.syntaxError('invalidOrUnexpected', this.getCharacterSpan())));
    }

    beginToken() {
        this.token.start = this.index;
        this.token.firstLine = this.line;
    }

    endToken(type) {
        this.token.type = type;
        this.token.end = this.index;
        this.token.lastLine = this.line;
    }

    skipAndEndToken(length, type) {
        this.index += length;
        this.endToken(type);
    }

    skipAndEndOperator(length, operator) {
        this.index += length;
        this.endToken(Token.OPERATOR);
        this.token.operator = operator;
    }

    skipAndEndCompoundAssignment(length, operator) {
        this.index += length;
        this.endToken(Token.COMPOUND_ASSIGNMENT);
        this.token.operator = operator;
    }

    beginSlice() {
        this._sliceStart = this.index;
    }

    endSlice() {
        return this.content.slice(this._sliceStart, this.index);
    }

    lookahead(index = 0) {
        return this.content.charCodeAt(this.index + index);
    }

    tokenize() {
        let ch = 0;
        for (;;) {
            ch = this.lookahead();
            if (SourceCharacter.isWhitespace(ch)) {
                this.index += 1;
            } else if (!this.scanLineTerminator() && !this.scanComment()) {
                break;
            }
        }
        this.beginToken();
        if (SourceCharacter.isIdentifierStart(ch)) {
            do {
                this.index += 1;
            } while (SourceCharacter.isIdentifierPart(this.lookahead()));
            return this.scanIdentifier(this.content.slice(this.token.start, this.index));
        }
        else if (SourceCharacter.isDecDigit(ch)) {
            return this.scanNumericLiteral(false);
        }
        else {
            let slice = this.content.slice(this.index, this.index + 4);
            if (slice === '>>>=')
                return void this.skipAndEndCompoundAssignment(4, Operator.UNSIGNED_RIGHT_SHIFT);
            switch (slice.slice(0, 3)) {
                case '...': return void this.skipAndEndToken(3, Token.ELLIPSIS);
                case '>>>': return void this.skipAndEndOperator(3, Operator.UNSIGNED_RIGHT_SHIFT);
                case '===': return void this.skipAndEndOperator(3, Operator.STRICT_EQUALS);
                case '!==': return void this.skipAndEndOperator(3, Operator.STRICT_NOT_EQUALS);
                case '**=': return void this.skipAndEndCompoundAssignment(3, Operator.POW);
                case '&&=': return void this.skipAndEndCompoundAssignment(3, Operator.LOGICAL_AND);
                case '^^=': return void this.skipAndEndCompoundAssignment(3, Operator.LOGICAL_XOR);
                case '||=': return void this.skipAndEndCompoundAssignment(3, Operator.LOGICAL_OR);
                case '??=': return void this.skipAndEndCompoundAssignment(3, Operator.NULL_COALESCING);
                case '<<=': return void this.skipAndEndCompoundAssignment(3, Operator.LEFT_SHIFT);
                case '>>=': return void this.skipAndEndCompoundAssignment(3, Operator.RIGHT_SHIFT);
            }
            switch (slice.slice(0, 2)) {
                case '?.': return void this.skipAndEndToken(2, Token.QUESTION_DOT);
                case '</': return void this.skipAndEndToken(2, Token.LT_SLASH);
                case '->': return void this.skipAndEndToken(2, Token.ARROW);
                case '**': return void this.skipAndEndOperator(2, Operator.POW);
                case '&&': return void this.skipAndEndOperator(2, Operator.LOGICAL_AND);
                case '^^': return void this.skipAndEndOperator(2, Operator.LOGICAL_XOR);
                case '||': return void this.skipAndEndOperator(2, Operator.LOGICAL_OR);
                case '??': return void this.skipAndEndOperator(2, Operator.NULL_COALESCING);
                case '<<': return void this.skipAndEndOperator(2, Operator.LEFT_SHIFT);
                case '>>': return void this.skipAndEndOperator(2, Operator.RIGHT_SHIFT);
                case '==': return void this.skipAndEndOperator(2, Operator.EQUALS);
                case '!=': return void this.skipAndEndOperator(2, Operator.NOT_EQUALS);
                case '<=': return void this.skipAndEndOperator(2, Operator.LE);
                case '>=': return void this.skipAndEndOperator(2, Operator.GE);
                case '++': return void this.skipAndEndOperator(2, Operator.PRE_INCREMENT);
                case '--': return void this.skipAndEndOperator(2, Operator.PRE_DECREMENT);
                case '+=': return void this.skipAndEndCompoundAssignment(2, Operator.ADD);
                case '-=': return void this.skipAndEndCompoundAssignment(2, Operator.SUBTRACT);
                case '*=': return void this.skipAndEndCompoundAssignment(2, Operator.MULTIPLY);
                case '/=': return void this.skipAndEndCompoundAssignment(2, Operator.DIVIDE);
                case '%=': return void this.skipAndEndCompoundAssignment(2, Operator.REMAINDER);
                case '&=': return void this.skipAndEndCompoundAssignment(2, Operator.BITWISE_AND);
                case '^=': return void this.skipAndEndCompoundAssignment(2, Operator.BITWISE_XOR);
                case '|=': return void this.skipAndEndCompoundAssignment(2, Operator.BITWISE_OR);
            }
            switch (slice.charAt(0)) {
                case '.':
                    if (SourceCharacter.isDecDigit(this.lookahead(1)))
                        return void this.scanNumericLiteral(true);
                    return void this.skipAndEndToken(1, Token.DOT);
                case '{': return void this.skipAndEndToken(1, Token.LCURLY);
                case '}': return void this.skipAndEndToken(1, Token.RCURLY);
                case '(': return void this.skipAndEndToken(1, Token.LPAREN);
                case ')': return void this.skipAndEndToken(1, Token.RPAREN);
                case '[': return void this.skipAndEndToken(1, Token.LSQUARE);
                case ']': return void this.skipAndEndToken(1, Token.RSQUARE);
                case '.': return void this.skipAndEndToken(1, Token.DOT);
                case ';': return void this.skipAndEndToken(1, Token.SEMICOLON);
                case ',': return void this.skipAndEndToken(1, Token.COMMA);
                case '?': return void this.skipAndEndToken(1, Token.QUESTION_MARK);
                case '!': return void this.skipAndEndToken(1, Token.EXCLAMATION_MARK);
                case ':': return void this.skipAndEndToken(1, Token.COLON);
                case '=': return void this.skipAndEndToken(1, Token.ASSIGN);
                case '+': return void this.skipAndEndOperator(1, Operator.ADD);
                case '-': return void this.skipAndEndOperator(1, Operator.SUBTRACT);
                case '*': return void this.skipAndEndOperator(1, Operator.MULTIPLY);
                case '/': return void this.skipAndEndOperator(1, Operator.DIVIDE);
                case '%': return void this.skipAndEndOperator(1, Operator.REMAINDER);
                case '&': return void this.skipAndEndOperator(1, Operator.BITWISE_AND);
                case '^': return void this.skipAndEndOperator(1, Operator.BITWISE_XOR);
                case '|': return void this.skipAndEndOperator(1, Operator.BITWISE_OR);
                case '<': return void this.skipAndEndOperator(1, Operator.LT);
                case '>': return void this.skipAndEndOperator(1, Operator.GT);
                case '~': return void this.skipAndEndOperator(1, Operator.BITWISE_NOT);
                case '"':
                case "'": return void this.scanStringLiteral();
                // keyword-allowed identifier
                case '#': return void this.scanPossiblyKeywordIdentifier();
            }
            let idStart = this.scanOptUnicodeEscapeForIdentifier(true);
            if (idStart != '') return void this.scanIdentifier(idStart);

            if (!this._atEOF) this.raiseUnexpected();
            this.endToken(Token.EOF);
        }
    }

    scanIdentifier(s, reserveKeyword = true) {
        for (;;) {
            let ch = this.lookahead();
            if (SourceCharacter.isIdentifierPart(ch)) {
                this.index += 1;
                s += String.fromCodePoint(ch);
            } else {
                let s2 = this.scanOptUnicodeEscapeForIdentifier(false);
                if (s2 == '') break;
                s += s2;
            }
        }
        this.endToken(Token.IDENTIFIER);
        this.token.stringValue = s;
        if (reserveKeyword && isStrictKeyword(s)) {
            if (this.token.rawLength != s.length)
                throw new ParseError(this.script.collectProblem(Problem.syntaxError('keywordMustNotContainEscapes', this.getCharacterSpan())));
            this.token.type = Token.KEYWORD;
        }
    }

    scanPossiblyKeywordIdentifier() {
        this.index += 1;
        let s = '';
        if (SourceCharacter.isIdentifierPart(this.lookahead())) {
            do {
                this.index += 1;
            } while (SourceCharacter.isIdentifierPart(this.lookahead()));
            s = this.content.slice(this.token.start + 1, this.index);
        } else {
            s = this.scanOptUnicodeEscapeForIdentifier(false);
            if (s == '') this.raiseUnexpected();
        }
        this.scanIdentifier(s, false);
    }

    scanNumericLiteral(startsWithDot) {
        let ch = 0;
        if (startsWithDot) {
            this.index += 2;
        } else {
            let startsWithZero = this.lookahead() == 0;
            ++this.index;
            ch = this.lookahead();
            if (startsWithZero) {
                if (ch == 0x78 || ch == 0x58) this.scanHexLiteral();
                if (ch == 0x62 || ch == 0x42) this.scanBinLiteral();
                if (SourceCharacter.isDecDigit(ch)) this.raiseUnexpected();
            }
            this.scanDecDigitSequence();
        }
        let dot = startsWithDot;
        if (!dot && this.lookahead() == 0x2e) {
            this.index += 1;
            dot = true;
        }
        if (dot) this.scanDecDigitSequence();
        ch = this.lookahead();
        if (ch == 0x65 || ch == 0x45) {
            this.index += 1;
            ch = this.lookahead();
            if (ch == 0x2b || ch == 0x2d) this.index += 1;
            if (!SourceCharacter.isDecDigit(this.lookahead())) this.raiseUnexpected();
            this.scanDecDigitSequence();
        }
        this.endToken(Token.NUMERIC_LITERAL);
        this.token.numberValue = parseFloat(this.content.slice(this.token.start, this.index).replace(/_/g, ''));
    }

    scanDecDigitSequence() {
        for (;;) {
            let ch = this.lookahead();
            if (SourceCharacter.isDecDigit(ch))
                this.index += 1;
            else if (ch == 0x5f) {
                this.index += 1;
                if (!SourceCharacter.isDecDigit(this.lookahead())) this.raiseUnexpected();
                this.index += 1;
            }
            else break;
        }
    }

    scanHexLiteral() {
        ++this.index;
        if (!SourceCharacter.isHexDigit(this.lookahead())) this.raiseUnexpected();
        for (;;) {
            let ch = this.lookahead();
            if (SourceCharacter.isHexDigit(ch))
                this.index += 1;
            else if (ch == 0x5f) {
                this.index += 1;
                if (!SourceCharacter.isHexDigit(this.lookahead())) this.raiseUnexpected();
                this.index += 1;
            }
            else break;
        }
        this.endToken(Token.NUMERIC_LITERAL);
        this.token.numberValue = parseInt(this.content.slice(this.token.start + 2, this.index).replace(/_/g, ''), 16);
    }

    scanBinLiteral() {
        ++this.index;
        if (!SourceCharacter.isBinDigit(this.lookahead())) this.raiseUnexpected();
        for (;;) {
            let ch = this.lookahead();
            if (SourceCharacter.isBinDigit(ch))
                this.index += 1;
            else if (ch == 0x5f) {
                this.index += 1;
                if (!SourceCharacter.isBinDigit(this.lookahead())) this.raiseUnexpected();
                this.index += 1;
            }
            else break;
        }
        this.endToken(Token.NUMERIC_LITERAL);
        this.token.numberValue = parseInt(this.content.slice(this.token.start + 2, this.index).replace(/_/g, ''), 2);
    }

    scanLineTerminator() {
        let ch = this.lookahead();
        if (SourceCharacter.isLineTerminator(ch)) {
            if (ch == 0x0d && this.lookahead(1) == 0x0a)
                this.index += 1;
            this.index += 1;
            this.line += 1;
            this.script.addLineStart(this.index);
            return true;
        }
        return false;
    }

    scanComment() {
        let ch = this.lookahead();
        if (ch == 0x3c && this.lookahead(1) == 0x21 && this.lookahead(2) == 0x2d && this.lookahead(3) == 0x2d) {
            let startSpan = this.getCharacterSpan();
            this.index += 4;
            for (;;) {
                ch = this.lookahead();
                if (ch == 0x2d && this.lookahead(1) == 0x2d && this.lookahead(2) == 0x3e) {
                    this.index += 3;
                    break;
                } else if (!this.scanLineTerminator()) {
                    if (this._atEOF) this.raiseUnexpected();
                    this.index += 1;
                }
            }
            this.script.addComment(new Comment(true, this.content.slice(startSpan.start + 4, this.index - 3), startSpan.to(this.getCharacterSpan())));
            return true;
        }
        if (ch != 0x2f) return false;
        ch = this.lookahead(1);
        if (ch == 0x2a) {
            let startSpan = this.getCharacterSpan();
            let nested = 1;
            this.index += 2;
            for (;;) {
                ch = this.lookahead();
                if (ch == 0x2f && this.lookahead(1) == 0x2a) {
                    this.index += 2;
                    ++nested;
                } else if (ch == 0x2a && this.lookahead(1) == 0x2f) {
                    this.index += 2;
                    if (--nested == 0) break;
                } else if (!this.scanLineTerminator()) {
                    if (this._atEOF) this.raiseUnexpected();
                    this.index += 1;
                }
            }
            this.script.addComment(new Comment(true, this.content.slice(startSpan.start + 2, this.index - 2), startSpan.to(this.getCharacterSpan())));
            return true;
        }
        if (ch == 0x2f) {
            let start = this.index;
            this.index += 2;
            while (!SourceCharacter.isLineTerminator(this.lookahead()))
                this.index += 1;
            this.script.addComment(new Comment(false, this.content.slice(start + 2, this.index), Span.inline(this.script, this.line, start, this.index)));
            return true;
        }
        return false;
    }

    scanOptUnicodeEscapeForIdentifier(atIdStart, mustBeValid = true) {
        if (this.lookahead() != 0x5c)
            return '';
        this.index += 1;
        let ch = this.scanUnicodeEscapeXOrU();
        if (mustBeValid) {
            if (atIdStart && !SourceCharacter.isIdentifierStart(ch)) throw new ParseError(this.script.collectProblem(Problem.syntaxError('invalidOrUnexpected', this.getCharacterSpan())));
            if (!atIdStart && !SourceCharacter.isIdentifierPart(ch)) throw new ParseError(this.script.collectProblem(Problem.syntaxError('invalidOrUnexpected', this.getCharacterSpan())));
        }
        return String.fromCodePoint(ch);
    }

    // scans \x or \u escape sequences starting from 'x' or 'u'; raises error
    // if a different character is found or end of program is reached.
    scanUnicodeEscapeXOrU() {
        let ch = this.lookahead();
        if (ch == 0x75) {
            this.index += 1;
            if (this.lookahead() == 0x7b) return this.scanMultiDigitUnicodeEscape();
            return (this.requireHexDigit() << 12)
                | (this.requireHexDigit() << 8)
                | (this.requireHexDigit() << 4)
                | this.requireHexDigit();
        } else if (ch == 0x78) {
            this.index += 1;
            if (this.lookahead() == 0x7b) return this.scanMultiDigitUnicodeEscape();
            return (this.requireHexDigit() << 4) | this.requireHexDigit();
        }
        this.raiseUnexpected();
        return 0;
    }

    // scans \x{...} or \u{...} starting from {
    scanMultiDigitUnicodeEscape() {
        this.index += 1;
        let v = SourceCharacter.hexDigitMV(this.lookahead());
        if (v == -1) this.raiseUnexpected();
        for (;;) {
            let ch = this.lookahead();
            if (ch == 0x7d) break;
            else v = (v << 4) | this.requireHexDigit();
        }
        this.index += 1;
        return v;
    }

    requireHexDigit() {
        let v = SourceCharacter.hexDigitMV(this.lookahead());
        if (v == -1) this.raiseUnexpected();
        this.index += 1;
        return v;
    }

    requireBinDigit() {
        if (!SourceCharacter.isBinDigit(this.lookahead())) this.raiseUnexpected();
        this.index += 1;
    }

    scanOptEscapeSequence() {
        if (this.lookahead() != 0x5c) return null;
        this.index += 1;
        let ch = this.lookahead();
        if (ch == 0x75 || ch == 0x78) return String.fromCodePoint(this.scanUnicodeEscapeXOrU());
        switch (ch) {
            case 0x27: return this.index += 1, "'";
            case 0x22: return this.index += 1, '"';
            case 0x5c: return this.index += 1, '\\';
            case 0x62: return this.index += 1, '\b';
            case 0x66: return this.index += 1, '\f';
            case 0x6e: return this.index += 1, '\n';
            case 0x72: return this.index += 1, '\r';
            case 0x74: return this.index += 1, '\t';
            case 0x76: return this.index += 1, '\v';
            case 0x30: return this.index += 1, '\0';
        }
        if (this.scanLineTerminator())
            return '';
        if (this._atEOF) this.raiseUnexpected();
        this.index += 1;
        return String.fromCodePoint(ch);
    }

    scanRegExpLiteral() {
        let ch = 0;
        for (;;) {
            ch = this.lookahead();
            if (ch == 0x5c) {
                this.index += 1;
                if (this._atEOF) this.raiseUnexpected();
                if (!this.scanLineTerminator())
                    this.index += 1;
            } else if (ch == 0x2f) {
                this.index += 1;
                break;
            } else if (this._atEOF) {
                this.raiseUnexpected();
            } else if (!this.scanLineTerminator()) {
                this.index += 1;
            }
        }
        let bodyStart = this.token.start + (this.token.isOperator(Operator.DIVIDE) ? 1 : 2);
        let body = this.content.slice(bodyStart, this.index - 1).replace(SourceCharacter.lineTerminatorsRegex, '\n');
        let flags = '';
        for (;;) {
            let s = this.scanOptUnicodeEscapeForIdentifier(false, false);
            if (s != '') {
                flags += s;
            } else if (SourceCharacter.isIdentifierPart(this.lookahead())) {
                flags += this.content.charAt(this.index);
                this.index += 1;
            } else {
                break;
            }
        }
        this.token.flags = flags;
        this.endToken(Token.REG_EXP_LITERAL);
    }

    scanStringLiteral() {
        let delim = this.lookahead();
        this.index += 1;
        if (this.lookahead() == delim && this.lookahead(1) == delim)
            return this.scanTripleStringLiteral(delim);
        let ch = 0, lineBreakFound = false;
        let builder = [];
        this.beginSlice();
        for (;;) {
            ch = this.lookahead();
            if (ch == delim) {
                builder.push(this.endSlice());
                this.index += 1;
                break;
            } else if (ch == 0x5c) {
                builder.push(this.endSlice(), this.scanOptEscapeSequence());
                this.beginSlice();
            } else if (SourceCharacter.isLineTerminator(ch)) {
                lineBreakFound = true;
                builder.push(this.endSlice(), '\n');
                this.scanLineTerminator();
                this.beginSlice();
            } else if (this._atEOF) {
                this.raiseUnexpected();
            } else this.index += 1;
        }
        this.endToken(Token.STRING_LITERAL);
        this.token.stringValue = builder.join('');
        if (lineBreakFound)
            throw new ParseError(this.script.collectProblem(Problem.syntaxError('stringMustNotContainLineBreaks', this.token.span)));
    }

    scanTripleStringLiteral(delim) {
        this.index += 2;
        let ch = 0;
        let lines = [];
        let builder = [];
        let startedWithLineBreak = this.scanLineTerminator();
        this.beginSlice();
        for (;;) {
            ch = this.lookahead();
            if (ch == delim && this.lookahead(1) == delim && this.lookahead(2) == delim) {
                builder.push(this.endSlice());
                lines.push(builder.join(''));
                builder.length = 0;
                this.index += 3;
                break;
            } else if (ch == 0x5c) {
                builder.push(this.endSlice(), this.scanOptEscapeSequence());
                this.beginSlice();
            } else if (SourceCharacter.isLineTerminator(ch)) {
                builder.push(this.endSlice());
                lines.push(builder.join(''));
                builder.length = 0;
                this.scanLineTerminator();
                this.beginSlice();
            } else if (this._atEOF) {
                this.raiseUnexpected();
            } else this.index += 1;
        }
        this.endToken(Token.STRING_LITERAL);
        let lastLine = startedWithLineBreak && lines.length > 1 ? lines.pop() : '';
        let baseIndent = 0;
        for (; baseIndent < lastLine.length; ++baseIndent)
            if (!SourceCharacter.isWhitespace(lastLine.charCodeAt(baseIndent)))
                break;
        lines = lines.map(line => {
            let indent = 0;
            for (; indent < line.length; ++indent)
                if (!SourceCharacter.isWhitespace(line.charCodeAt(indent)))
                    break;
            return line.slice(Math.min(baseIndent, indent));
        });
        lastLine = lastLine.slice(baseIndent);
        if (lastLine.length > 0) lines.push(lastLine);
        this.token.stringValue = lines.join('\n');
    }
}
