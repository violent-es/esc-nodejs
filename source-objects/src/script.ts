import {GrowableInt32Array} from 'com.violentes.esc.util';
import SourceCharacter from './source-character';
import {Problem} from './problem';
import type Comment from './comment';

export default class Script {
    filePath: string;
    content: string;
    contentLength: number;
    private _valid: boolean = true;
    private _lineStarts = new GrowableInt32Array;
    private _includesScripts: Script[] = [];
    private _problems: Problem[] = [];
    private _comments: Comment[] = [];

    constructor(filePath: string, content: string) {
        this.filePath = filePath;
        this.content = content;
        this.contentLength = content.length;
        this._lineStarts.push(0, 0);
    }

    get fileURL(): string {
        return 'file://' + this.filePath.replace(/ /g, '%20').replace(/\\/g, '/');
    }

    get isValid(): boolean {
        return this._valid;
    }

    addLineStart(index: number) {
        this._lineStarts.push(index);
    }

    getLineStart(lineNumber: number) {
        let r = this._lineStarts.at(lineNumber);
        return r === undefined ? this._lineStarts.at(this._lineStarts.length - 1) : r;
    }

    getLineIndent(lineNumber: number) {
        let lineStart = this.getLineStart(lineNumber);
        let i = lineStart;
        for (; i < this.contentLength; ++i)
            if (!SourceCharacter.isWhitespace(this.content.charCodeAt(i)))
                break;
        return i - lineStart;
    }

    get includesScripts() {
        return this._includesScripts.slice(0);
    }

    addIncludedScript(script) {
        this._includesScripts.push(script);
    }

    get comments(): Comment[] {
        return this._comments.slice(0);
    }

    addComment(c: Comment) {
        this._comments.push(c);
    }

    get problems(): Problem[] {
        return this._problems.slice(0);
    }

    collectProblem(p: Problem): Problem {
        this._valid = p.isWarning ? this._valid : false;
        this._problems.push(p);
        return p;
    }

    sortProblems() {
        this._problems.sort((a, b) => a.span.compareTo(b.span));
        for (let included of this._includesScripts)
            included.sortProblems();
    }
}