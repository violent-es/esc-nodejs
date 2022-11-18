import Operator from './operator';
import Token from './token';
import TokenData from './token-data';
import type Span from './span';

export class Problem {
    id: string;
    problemKind: ProblemKind;
    span: Span;
    formatArguments: any;

    static warning(id, span, formatArguments = null) {
        return new Problem(id, ProblemKind.WARNING, span, formatArguments);
    }
    static syntaxError(id, span, formatArguments = null) {
        return new Problem(id, ProblemKind.SYNTAX_ERROR, span, formatArguments);
    }
    static verifyError(id, span, formatArguments = null) {
        return new Problem(id, ProblemKind.VERIFY_ERROR, span, formatArguments);
    }

    constructor(id, problemKind, span, formatArguments = null) {
        this.id = id;
        this.problemKind = problemKind;
        this.span = span;
        this.formatArguments = formatArguments || {};
    }

    get isWarning() {
        return this.problemKind == ProblemKind.WARNING;
    }

    toString() {
        return (new ProblemFormatter).format(this);
    }
}

export class ProblemKind {
    static WARNING = new ProblemKind('Warning');
    static SYNTAX_ERROR = new ProblemKind('SyntaxError');
    static VERIFY_ERROR = new ProblemKind('VerifyError');

    private _s: string;

    constructor(s) {
        this._s = s;
    }

    toString() {
        return this._s;
    }
}

export class ProblemFormatter {
    format(p) {
        let msg = this.resolveId(p.id)
            .replace(/\$(\$|[a-z0-9_\-]+)/gi, (_, s) => {
                if (s == '$') return '$';
                let arg = p.formatArguments[s];
                return arg === undefined ? 'undefined' : this.formatArgument(arg);
            });
        msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        return `${p.span.script.fileURL}:${p.span.firstLine}:${p.span.firstColumn + 1}: ${p.problemKind.toString()}: ${msg}`;
    }

    formatArgument(v) {
        if (v instanceof TokenData) {
            if (v.type == Token.OPERATOR) return this.formatArgument(v.operator);
            if (v.type == Token.COMPOUND_ASSIGNMENT) return this.formatArgument(v.operator) + '=';
            if (v.type == Token.KEYWORD) return "'" + v.stringValue + "'";
            return this.formatArgument(v.type);
        }
        if (v instanceof Token)
            return tokenTypesAsArguments.get(v) || 'undefined';
        return String(v);
    }

    resolveId(id) {
        return defaultMessages[id] || 'undefined';
    }
}

const defaultMessages = {
    'unexpected': 'Unexpected $t',
    'invalidOrUnexpected': 'Invalid or unexpected token',
    'keywordMustNotContainEscapes': 'Keyword must not contain escaped characters',
    'stringMustNotContainLineBreaks': 'String must not contain line breaks',
    'requiredParamMustntFollowOptParam': 'Required parameter must not follow optional parameter',
    'invalidDestructuringAssignmentTarget': 'Invalid destructuring assignment target',
    'awaitMustntAppearInGenerator': '\'await\' must not appear in generator',
    'yieldMustntAppearInAsyncFunction': '\'yield\' must not appear in asynchronous function',
    'throwsClauseMustntRepeat': '\'throws\' clause must not repeat',
    'undefinedLabel': 'Undefined label \'$label\'',
    'tryStatementMustveAtLeast': 'Try statement must have at least one \'catch\' or \'finally\' clause',
    'malformedForInBinding': 'Mal-formed for..in binding',
    'unexpectedSuperStatement': 'Unexpected super statement',
    'tokenMustBeInline': 'Token must be inline',
    'enumVariantDeclarationsMustBeConst': 'Enum variant declarations must be constant',
    'enumVariantMustBeSimple': 'Enum variant must be simple',
    'definitionInUnallowedContext': 'Definition appears in unallowed context',
    'yieldUnexpectedHere': '\'yield\' operator unexpected here',
    'definitionMustntHaveModifier': 'Definition must not have modifieer \'$m\'',
    'nativeFunctionMustntHaveBody': 'Native function must not have body',
    'functionMustveBody': 'Function must have body',
    'interfaceMethodMustveNoAttributes': 'Interface method must have no attributes',
    'proxyHasWrongNumParams': 'Proxy method has wrong number of parameters',
    'unrecognizedProxy': 'Unrecognized proxy \'$p\'',
    'extendsClauseMustntDuplicate': '\'extends\' clause must not duplicate',
    'failedToResolveInclude': 'Failed to resolve include source',
    'functionMustNotUseAwait': 'Function must not use \'await\'',
    'functionMustNotUseYield': 'Function must not use \'yield\'',
    'invalidArrowFunctionParam': 'Invalid arrow function parameter',
    'restParamMustntHaveInit': 'Rest parameter must not havee initializer',
    'valueClassMustntExtend': 'Value class must not have \'extends\' clause',
    'valueClassMustntImplement': 'Value class must not have \'implements\' clause',
    'illegalBreakStatement': 'Illegal break statement',
    'illegalContinueStatement': 'Illegal continue statement: no surrounding iteration statement',
};

const tokenTypesAsArguments = new Map([
    [Token.EOF, 'end of program'],
    [Token.IDENTIFIER, 'identifier'],
    [Token.STRING_LITERAL, 'string'],
    [Token.NUMERIC_LITERAL, 'number'],
    [Token.REG_EXP_LITERAL, 'regular expression'],
    [Token.KEYWORD, 'keyword'],
    [Token.OPERATOR, 'operator'],
    [Token.COMPOUND_ASSIGNMENT, 'assignment'],
    [Token.LCURLY, '{'],
    [Token.RCURLY, '}'],
    [Token.LPAREN, '('],
    [Token.RPAREN, ')'],
    [Token.LSQUARE, '['],
    [Token.RSQUARE, ']'],
    [Token.DOT, '.'],
    [Token.QUESTION_DOT, '?.'],
    [Token.ELLIPSIS, '...'],
    [Token.SEMICOLON, ';'],
    [Token.COMMA, ','],
    [Token.QUESTION_MARK, '?'],
    [Token.EXCLAMATION_MARK, '!'],
    [Token.COLON, ':'],
    [Token.ASSIGN, '='],
    [Token.ARROW, '->'],
    [Token.LT_SLASH, '</'],
]);
