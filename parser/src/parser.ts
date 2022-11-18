import {Script, Token, TokenData, Operator, OperatorPrecedence, Problem, ProblemKind, Span} from 'com.violentes.esc.source-objects';
import Tokenizer from './tokenizer';
import ParseError from './parse-error';
import * as Ast from './ast';

import * as FileSystem from 'fs';
import * as Paths from 'path';

export default class Parser {
    script: Script;
    tokenizer: Tokenizer;
    private internalParser: InternalParser;

    constructor(script) {
        this.script = script;
        this.tokenizer = new Tokenizer(script);
        this.internalParser = new InternalParser(script, this.tokenizer);
        try {
            this.tokenizer.tokenize();
        } catch (e) {
            if (!(e instanceof ParseError)) throw e;
        }
    }

    parseProgram(): null | Ast.Program {
        if (!this.script.isValid) return null;
        let r = null;
        try {
            r = this.internalParser.parseProgram();
        } catch (e) {
            if (!(e instanceof ParseError)) throw e;
        }
        return this.script.isValid ? r : null;
    }

    parseStatement(): null | Ast.Statement {
        if (!this.script.isValid) return null;
        let r = null;
        try {
            let r2 = this.internalParser.parseStatement();
            if (this.internalParser.token.type != Token.EOF) {
                this.internalParser.throwUnexpected();
            }
            r = r2.node;
        } catch (e) {
            if (!(e instanceof ParseError)) throw e;
        }
        return this.script.isValid ? r : null;
    }

    parseExpression(allowIn = true, minPrecedence = null): null | Ast.Expression {
        if (!this.script.isValid) return null;
        let r = null;
        try {
            r = this.internalParser.parseExpression(allowIn, minPrecedence);
            if (this.internalParser.token.type != Token.EOF) {
                this.internalParser.throwUnexpected();
            }
        } catch (e) {
            if (!(e instanceof ParseError)) throw e;
        }
        return this.script.isValid ? r : null;
    }

    parseTypeExpression() {
        if (!this.script.isValid) return null;
        let r = null;
        try {
            r = this.internalParser.parseTypeExpression();
            if (this.internalParser.token.type != Token.EOF) {
                this.internalParser.throwUnexpected();
            }
        } catch (e) {
            if (!(e instanceof ParseError)) throw e;
        }
        return this.script.isValid ? r : null;
    }
}

type OperatorFilter = {
    operator: Operator,
    precedence: OperatorPrecedence,
    nextPrecedence: OperatorPrecedence,
};

class InternalParser {
    script: Script;
    tokenizer: Tokenizer;
    token: TokenData;
    previousToken: TokenData;
    locations: number[];
    functionStack: StackFunction[];

    constructor(script, tokenizer) {
        this.script = script;
        this.tokenizer = tokenizer;
        this.token = tokenizer.token;
        this.previousToken = new TokenData(script);
        this.locations = [];
        this.functionStack = [];
    }

    get stackFunction() {
        return this.functionStack.length > 0 ? this.functionStack[this.functionStack.length - 1] : null;
    }

    nextToken() {
        this.token.copyTo(this.previousToken);
        this.tokenizer.tokenize();
    }

    syntaxError(id, span, formatArguments = null) {
        return this.script.collectProblem(Problem.syntaxError(id, span, formatArguments));
    }

    verifyError(id, span, formatArguments = null) {
        return this.script.collectProblem(Problem.verifyError(id, span, formatArguments));
    }

    warn(id, span, formatArguments = null) {
        return this.script.collectProblem(Problem.warning(id, span, formatArguments));
    }

    throwUnexpected() {
        this.raiseUnexpected();
    }

    raiseUnexpected() {
        throw new ParseError(this.syntaxError('unexpected', this.token.span, { t: this.token }));
    }

    consume(type) {
        if (this.token.type == type) {
            return this.nextToken(), true;
        }
        return false;
    }

    consumeIdentifier(keyword = false) {
        if (this.token.type == Token.IDENTIFIER || (keyword && this.token.type == Token.KEYWORD)) {
            return this.nextToken(), this.previousToken.stringValue;
        }
        return null;
    }

    consumeOperator(type) {
        if (this.token.isOperator(type)) {
            return this.nextToken(), true;
        }
        return false;
    }

    consumeKeyword(name) {
        if (this.token.isKeyword(name)) {
            return this.nextToken(), true;
        }
        return false;
    }

    consumeContextKeyword(name) {
        if (this.token.isContextKeyword(name)) {
            return this.nextToken(), true;
        }
        return false;
    }

    expect(type) {
        if (this.token.type != type)
            this.throwUnexpected();
        this.nextToken();
    }

    expectIdentifier(keyword = false) {
        if (this.token.type == Token.IDENTIFIER || (keyword && this.token.type == Token.KEYWORD))
            return this.nextToken(), this.previousToken.stringValue;
        this.throwUnexpected();
        return '';
    }

    expectOperator(type) {
        if (!this.token.isOperator(type)) this.throwUnexpected();
        this.nextToken();
    }

    expectGT() {
        if (this.consumeOperator(Operator.GT)) {
            return;
        }
        if (this.token.isOperator(Operator.GE)) {
            this.previousToken.type = Token.OPERATOR;
            this.previousToken.operator = Operator.GT;
            this.previousToken.firstLine =
            this.previousToken.lastLine = this.token.firstLine;
            this.previousToken.start = this.token.start;
            this.previousToken.end = this.token.start + 1;
            this.token.type = Token.ASSIGN;
            this.token.start += 1;
            return;
        }
        if (this.token.isOperator(Operator.RIGHT_SHIFT)) {
            this.previousToken.type = Token.OPERATOR;
            this.previousToken.operator = Operator.GT;
            this.previousToken.firstLine =
            this.previousToken.lastLine = this.token.firstLine;
            this.previousToken.start = this.token.start;
            this.previousToken.end = this.token.start + 1;
            this.token.type = Token.OPERATOR;
            this.token.operator = Operator.GT;
            this.token.start += 1;
            return;
        }
        if (this.token.isOperator(Operator.UNSIGNED_RIGHT_SHIFT)) {
            this.previousToken.type = Token.OPERATOR;
            this.previousToken.operator = Operator.GT;
            this.previousToken.firstLine =
            this.previousToken.lastLine = this.token.firstLine;
            this.previousToken.start = this.token.start;
            this.previousToken.end = this.token.start + 1;
            this.token.type = Token.OPERATOR;
            this.token.operator = Operator.RIGHT_SHIFT;
            this.token.start += 1;
            return;
        }
        this.throwUnexpected();
    }

    expectKeyword(name) {
        if (!this.token.isKeyword(name)) this.throwUnexpected();
        this.nextToken();
    }

    expectContextKeyword(name) {
        if (!this.token.isContextKeyword(name)) this.throwUnexpected();
        this.nextToken();
    }

    markLocation() {
        this.locations.push(this.token.firstLine, this.token.start);
    }

    pushLocation(span) {
        this.locations.push(span.firstLine, span.start);
    }

    duplicateLocation() {
        let l = this.locations.length;
        this.locations.push(this.locations[l - 2], this.locations[l - 1]);
    }

    popLocation() {
        let start = this.locations.pop();
        let firstLine = this.locations.pop();
        return Span.linesThenIndexes(this.script, firstLine, this.previousToken.lastLine, start, this.previousToken.end);
    }

    finishNode(node, lastSpan: Span | Ast.Node = null) {
        if (lastSpan) {
            lastSpan = lastSpan instanceof Ast.Node ? lastSpan.span : lastSpan;
            let start = this.locations.pop();
            let firstLine = this.locations.pop();
            return Span.linesThenIndexes(this.script, firstLine, lastSpan.lastLine, start, lastSpan.end);
        } else {
            node.span = this.popLocation();
        }
        return node;
    }

    parseTypeExpression() {
        this.markLocation();
        let r = null;
        if (this.consumeContextKeyword('undefined')) {
            r = this.finishNode(new Ast.UndefinedTypeExpression);
        } else if (this.consume(Token.IDENTIFIER)) {
            r = this.finishNode(new Ast.IdentifierTypeExpression(this.previousToken.stringValue));
            if (this.consume(Token.ARROW)) {
                this.pushLocation(r.span);
                let [params] = this.convertTypeExpressionsIntoFunctionParams([r]);
                r = this.parseArrowFunctionTypeExpression(params, null, null);
            }
        } else if (this.consumeKeyword('function')) {
            this.expect(Token.LPAREN);
            let params = null;
            let optParams = null;
            let restParam = null;
            do {
                if (this.token.type == Token.RPAREN) break;
                if (this.consume(Token.ELLIPSIS)) {
                    this.markLocation();
                    let name = this.expectIdentifier();
                    restParam = this.finishNode(new Ast.Identifier(name, this.consume(Token.COLON) ? this.parseTypeExpression() : null));
                    break;
                } else if (this.consume(Token.IDENTIFIER)) {
                    this.markLocation();
                    let name = this.previousToken.stringValue;
                    let opt = this.consume(Token.QUESTION_MARK);
                    let p = this.finishNode(new Ast.Identifier(name, this.consume(Token.COLON) ? this.parseTypeExpression() : null));
                    if (opt) {
                        optParams = optParams || [];
                        optParams.push(p);
                    } else {
                        if (optParams != null)
                            this.syntaxError('requiredParamMustntFollowOptParam', this.token.span);
                        params = params || [];
                        params.push(p);
                    }
                } else this.throwUnexpected();
            } while (this.consume(Token.COMMA));
            this.expect(Token.RPAREN);
            let returnType = this.consume(Token.COLON) ? this.parseTypeExpression() : null;
            r = this.finishNode(new Ast.FunctionTypeExpression(params, optParams, restParam, returnType));
        } else if (this.consume(Token.LSQUARE)) {
            if (this.consume(Token.ELLIPSIS)) {
                let itemType = this.parseTypeExpression();
                this.expect(Token.RSQUARE);
                r = this.finishNode(new Ast.ArrayTypeExpression(itemType));
            } else if (this.consume(Token.RSQUARE)) {
                r = this.finishNode(new Ast.TupleTypeExpression([]));
            } else {
                let fst = this.parseTypeExpression();
                if (this.token.type == Token.COMMA) {
                    let itemTypes = [fst];
                    while (this.consume(Token.COMMA)) {
                        if (this.token.type == Token.RSQUARE) break;
                        itemTypes.push(this.parseTypeExpression());
                    }
                    this.expect(Token.RSQUARE);
                    r = this.finishNode(new Ast.TupleTypeExpression(itemTypes));
                } else {
                    this.expect(Token.RSQUARE);
                    r = this.finishNode(new Ast.ArrayTypeExpression(fst));
                }
            }
        } else if (this.consume(Token.LCURLY)) {
            let fields = [];
            do {
                if (this.token.type == Token.RCURLY) break;
                let name = this.expectIdentifier();
                let field = this.finishNode(new Ast.Identifier(name, this.consume(Token.COLON) ? this.parseTypeExpression() : null));
                fields.push(field);
            } while (this.consume(Token.COMMA));
            this.expect(Token.RCURLY);
            r = this.finishNode(new Ast.RecordTypeExpression(fields));
        } else if (this.consume(Token.LPAREN)) {
            r = this.parseParensTypeExpression();
        } else if (this.consumeKeyword('void')) {
            r = this.finishNode(new Ast.VoidTypeExpression);
        } else if (this.consumeOperator(Operator.MULTIPLY)) {
            r = this.finishNode(new Ast.AnyTypeExpression);
        } else if (this.consumeKeyword('null')) {
            r = this.finishNode(new Ast.NullTypeExpression);
        } else if (this.consumeOperator(Operator.BITWISE_OR)) {
            this.popLocation();
            r = this.parseTypeExpression();
        } else this.throwUnexpected();

        for (;;) {
            if (this.consume(Token.QUESTION_MARK)) {
                this.pushLocation(r.span);
                r = this.finishNode(new Ast.NullableTypeExpression(r));
            }
            else if (this.consume(Token.EXCLAMATION_MARK)) {
                this.pushLocation(r.span);
                r = this.finishNode(new Ast.NonNullableTypeExpression(r));
            }
            else if (this.consume(Token.DOT)) {
                this.pushLocation(r.span);
                if (this.consumeOperator(Operator.LT)) {
                    let argumentsList = [];
                    do {
                        argumentsList.push(this.parseTypeExpression());
                    } while (this.consume(Token.COMMA));
                    this.expectGT();
                    r = this.finishNode(new Ast.GenericInstantiationTypeExpression(r, argumentsList));
                } else {
                    r = this.finishNode(new Ast.MemberTypeExpression(r, this.parseIdentifier(true)));
                }
            }
            else if (this.consume(Token.COLON)) {
                this.pushLocation(r.span);
                r = this.finishNode(new Ast.TypedTypeExpression(r, this.parseTypeExpression()));
            }
            else if (this.consumeOperator(Operator.BITWISE_OR)) {
                this.pushLocation(r.span);
                let m = r instanceof Ast.UnionTypeExpression ? r.types : [r];
                r = this.finishNode(new Ast.UnionTypeExpression([...m, this.parseTypeExpression()]));
            }
            else break;
        }

        return r;
    }

    parseParensTypeExpression() {
        let r = null;
        if (this.token.type == Token.RPAREN) {
            this.nextToken();
            this.expect(Token.ARROW);
            return this.parseArrowFunctionTypeExpression(null, null, null);
        }
        if (this.consume(Token.ELLIPSIS)) {
            this.markLocation();
            let restParamName = this.expectIdentifier();
            let restParam = this.finishNode(new Ast.Identifier(restParamName, this.consume(Token.COLON) ? this.parseTypeExpression() : null));
            this.expect(Token.RPAREN);
            this.expect(Token.ARROW);
            return this.parseArrowFunctionTypeExpression(null, null, restParam);
        }
        let fst = this.parseTypeExpression();
        if (this.token.type == Token.COMMA) {
            let itemTypes = [fst];
            while (this.consume(Token.COMMA)) {
                if (this.token.type == Token.RPAREN
                ||  this.token.type == Token.ELLIPSIS) break;
                itemTypes.push(this.parseTypeExpression());
            }
            if (this.consume(Token.ELLIPSIS)) {
                let [params, optParams] = this.convertTypeExpressionsIntoFunctionParams(itemTypes);
                this.markLocation();
                let restParamName = this.expectIdentifier();
                let restParam = this.finishNode(new Ast.Identifier(restParamName, this.consume(Token.COLON) ? this.parseTypeExpression() : null));
                this.expect(Token.RPAREN);
                this.expect(Token.ARROW);
                r = this.parseArrowFunctionTypeExpression(params, optParams, restParam);
            } else {
                this.expect(Token.RPAREN);
                if (this.consume(Token.ARROW)) {
                    let [params, optParams] = this.convertTypeExpressionsIntoFunctionParams(itemTypes);
                    r = this.parseArrowFunctionTypeExpression(params, optParams, null);
                }
                else r = this.finishNode(new Ast.UnionTypeExpression(itemTypes));
            }
        } else {
            this.expect(Token.RPAREN);
            if (this.consume(Token.ARROW)) {
                let [params, optParams] = this.convertTypeExpressionsIntoFunctionParams([fst]);
                r = this.parseArrowFunctionTypeExpression(params, optParams, null);
            } else r = this.finishNode(new Ast.ParensTypeExpression(fst));
        }
        return r;
    }

    convertTypeExpressionsIntoFunctionParams(types): [null | Ast.TypeExpression[], null | Ast.TypeExpression[]] {
        let params = null, optParams = null;
        for (let t of types) {
            if (t instanceof Ast.TypedTypeExpression) {
                [params, optParams] = this.convertTypeExpressionIntoFunctionParam(t.base, t.type, params, optParams);
            } else [params, optParams] = this.convertTypeExpressionIntoFunctionParam(t, null, params, optParams);
        }
        return [params, optParams];
    }

    convertTypeExpressionIntoFunctionParam(node, type, outParams, outOptParams): [null | Ast.TypeExpression[], null | Ast.TypeExpression[]] {
        if (node instanceof Ast.NullableTypeExpression) {
            outOptParams = outOptParams || [];
            if (node.base instanceof Ast.IdentifierTypeExpression) {
                this.pushLocation(node.span);
                outOptParams = outOptParams || [];
                outOptParams.push(this.finishNode(new Ast.Identifier(node.base.name, type), node.span));
            } else this.syntaxError('invalidArrowFunctionParam', node.base.span);
        } else if (node instanceof Ast.IdentifierTypeExpression) {
            this.pushLocation(node.span);
            outParams = outParams || [];
            outParams.push(this.finishNode(new Ast.Identifier(node.name, type), node.span));
            if (outOptParams != null) this.syntaxError('requiredParamMustntFollowOptParam', node.span);
        } else this.syntaxError('invalidOrUnexpected', node.span);
        return [outParams, outOptParams];
    }

    /**
     * Parses arrow function type, assuming the previous token is
     * `->`.
     */
    parseArrowFunctionTypeExpression(params, optParams, restParam) {
        let returnType = this.parseTypeExpression();
        return this.finishNode(new Ast.FunctionTypeExpression(params, optParams, restParam, returnType));
    }

    parseVariableBinding(allowIn = true) {
        this.markLocation();
        let pattern = this.parseDestructuringPattern();
        let init = this.consume(Token.ASSIGN) ? this.parseExpression(allowIn, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION) : null;
        return this.finishNode(new Ast.VariableBinding(pattern, init));
    }

    parseSimpleVariableDeclaration(allowIn = true) {
        let r = this.parseOptSimpleVariableDeclaration(allowIn);
        if (!r) this.throwUnexpected();
        return r;
    }

    parseOptSimpleVariableDeclaration(allowIn = true) {
        let constFound = this.token.isKeyword('const');
        if (!(this.token.isKeyword('var') || constFound)) return null;
        this.markLocation();
        this.nextToken();
        let bindings = [];
        do {
            bindings.push(this.parseVariableBinding(allowIn));
        } while (this.consume(Token.COMMA));
        return this.finishNode(new Ast.SimpleVariableDeclaration(constFound, bindings));
    }

    parseDestructuringPattern() {
        if (!(this.token.type == Token.IDENTIFIER || this.token.type == Token.LCURLY || this.token.type == Token.LSQUARE))
            this.throwUnexpected();
        return this.convertExpressionIntoDestructuringPattern(this.parseOptPrimaryExpression());
    }

    convertExpressionIntoDestructuringPattern(e) {
        let r = this.optConvertExpressionIntoDestructuringPattern(e);
        if (!r) throw new ParseError(this.syntaxError('invalidDestructuringAssignmentTarget', e.span));
        return r;
    }

    optConvertExpressionIntoDestructuringPattern(e) {
        if (e instanceof Ast.Identifier) {
            this.pushLocation(e.span);
            return this.finishNode(new Ast.NonDestructuringPattern(e.name, e.type), e.span);
        } else if (e instanceof Ast.ArrayInitializer) {
            this.pushLocation(e.span);
            let items = [];
            for (let item of e.items) {
                if (item instanceof Ast.Spread) {
                    this.pushLocation(item.span);
                    let se = this.convertExpressionIntoDestructuringPattern(item.expression);
                    items.push(this.finishNode(new Ast.ArrayDestructuringSpread(se), item.span));
                } else if (!item) {
                    items.push(null);
                } else {
                    items.push(this.convertExpressionIntoDestructuringPattern(item));
                }
            }
            return this.finishNode(new Ast.ArrayDestructuringPattern(items, e.type));
        } else if (e instanceof Ast.ObjectInitializer) {
            this.pushLocation(e.span);
            let fields = [];
            for (let field of e.fields) {
                if (field instanceof Ast.Spread) {
                    throw new ParseError(this.syntaxError('invalidDestructuringAssignmentTarget', field.span));
                } else {
                    let subpattern = field.value ? this.convertExpressionIntoDestructuringPattern(field.value) : null;
                    this.pushLocation(field.span);
                    fields.push(this.finishNode(new Ast.ObjectDestructuringPatternField(field.key, subpattern), field.span));
                }
            }
            return this.finishNode(new Ast.ObjectDestructuringPattern(fields, e.type), e.span);
        }
        return null;
    }

    parseExpression(allowIn = true, minPrecedence = null, allowTypedId = true) {
        let r = this.parseOptExpression(allowIn, minPrecedence, allowTypedId);
        if (!r) this.throwUnexpected();
        return r;
    }

    parseOptExpression(allowIn = true, minPrecedence = null, allowTypedId = true) {
        minPrecedence = minPrecedence || OperatorPrecedence.LIST;
        let r = this.parseOptPrimaryExpression(allowTypedId, minPrecedence);
        if (!r) {
            let filter = this.filterUnaryOperator();
            if (filter && minPrecedence.valueOf() <= filter.precedence.valueOf()) {
                this.markLocation();
                this.nextToken();
                r = this.finishNode(new Ast.UnaryExpression(filter.operator, this.parseExpression(allowIn, filter.nextPrecedence)));
                if (filter.operator == Operator.AWAIT) {
                    let {stackFunction} = this;
                    if (stackFunction) {
                        if (stackFunction.usesYield)
                            this.syntaxError('awaitMustntAppearInGenerator', r.span);
                        else stackFunction.usesAwait = true;
                    }
                } else if (filter.operator == Operator.YIELD) {
                    let {stackFunction} = this;
                    if (stackFunction) {
                        if (stackFunction.usesAwait)
                            this.syntaxError('yieldMustntAppearInAsyncFunction', r.span);
                        else stackFunction.usesYield = true;
                    } else this.syntaxError('yieldUnexpectedHere', r.span);
                }
            // 'function' expression
            } else if (minPrecedence.valueOf() <= OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION.valueOf() && this.consumeKeyword('function')) {
                this.pushLocation(this.previousToken.span);
                let id = null;
                if (this.consumeIdentifier()) {
                    this.pushLocation(this.previousToken.span);
                    id = this.finishNode(new Ast.Identifier(this.previousToken.stringValue));
                }
                let {common} = this.parseFunctionCommon();
                r = this.finishNode(new Ast.FunctionExpression(id, common));
                if (common.body == null) this.syntaxError('functionMustveBody', id.span);
            }
        }
        return r ? this.parseSubexpressions(r, allowIn, minPrecedence) : null;
    }

    parseOptPrimaryExpression(allowTypedId = true, minPrecedence = null) {
        minPrecedence = minPrecedence || OperatorPrecedence.POSTFIX;
        let exp = null;
        if (this.consumeIdentifier()) {
            return this.parseIdentifierPrimaryExpression(allowTypedId, minPrecedence);
        } else if (this.consumeKeyword('default')) {
            this.pushLocation(this.previousToken.span);
            this.expect(Token.LPAREN);
            exp = this.parseTypeExpression();
            this.expect(Token.RPAREN);
            return this.finishNode(new Ast.DefaultExpression(exp));
        } else if (this.consumeKeyword('this')) {
            this.pushLocation(this.previousToken.span);
            return this.finishNode(new Ast.ThisLiteral)
        } else if (this.consumeKeyword('import')) {
            this.pushLocation(this.previousToken.span);
            this.expect(Token.DOT);
            this.expectContextKeyword('meta');
            return this.finishNode(new Ast.ImportMetaExpression);
        } else if (this.consumeKeyword('null')) {
            this.pushLocation(this.previousToken.span);
            return this.finishNode(new Ast.NullLiteral);
        } else if (this.consume(Token.STRING_LITERAL)) {
            this.pushLocation(this.previousToken.span);
            return this.finishNode(new Ast.StringLiteral(this.previousToken.stringValue));
        } else if (this.consume(Token.NUMERIC_LITERAL)) {
            this.pushLocation(this.previousToken.span);
            return this.finishNode(new Ast.NumericLiteral(this.previousToken.numberValue));
        } else if (this.consumeKeyword('true')) {
            this.pushLocation(this.previousToken.span);
            return this.finishNode(new Ast.BooleanLiteral(true));
        } else if (this.consumeKeyword('false')) {
            this.pushLocation(this.previousToken.span);
            return this.finishNode(new Ast.BooleanLiteral(false));
        } else if (this.token.isOperator(Operator.DIVIDE) || this.token.isCompoundAssignment(Operator.DIVIDE)) {
            this.markLocation();
            this.tokenizer.scanRegExpLiteral();
            this.nextToken();
            return this.finishNode(new Ast.RegExpLiteral(this.previousToken.stringValue, this.previousToken.flags));
        } else if (this.consumeKeyword('super')) {
            this.pushLocation(this.previousToken.span);
            return this.finishNode(new Ast.SuperExpression);
        } else if (this.consume(Token.LPAREN)) {
            this.pushLocation(this.previousToken.span);
            // arrow function
            if (minPrecedence.valueOf() <= OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION.valueOf() && this.consume(Token.RPAREN)) {
                this.expect(Token.ARROW);
                return this.parseArrowFunctionExpression(null, null, null);
            }
            if (minPrecedence.valueOf() <= OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION.valueOf()) {
                return this.parseParensExpressionOrArrowFunctionOfOneOrMoreParams();
            } else {
                let exp = this.parseExpression();
                this.expect(Token.RPAREN);
                return this.finishNode(new Ast.ParensExpression(exp));
            }
        } else if (this.consume(Token.LCURLY)) {
            this.pushLocation(this.previousToken.span);
            let fields = [];
            do {
                if (this.token.type == Token.RCURLY) break;
                if (this.consume(Token.ELLIPSIS)) {
                    this.pushLocation(this.previousToken.span);
                    fields.push(this.finishNode(new Ast.Spread(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION))));
                } else {
                    this.markLocation();
                    let key = null, value = null;
                    if (this.consumeIdentifier()) {
                        this.pushLocation(this.previousToken.span);
                        key = this.finishNode(new Ast.StringLiteral(this.previousToken.stringValue));
                        value = this.consume(Token.COLON) ? this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION) : null;
                    } else {
                        if (this.consume(Token.LSQUARE)) {
                            key = this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION);
                            this.expect(Token.RSQUARE);
                        } else if (this.consume(Token.NUMERIC_LITERAL)) {
                            this.pushLocation(this.previousToken.span);
                            key = this.finishNode(new Ast.NumericLiteral(this.previousToken.numberValue));
                        } else {
                            this.expect(Token.STRING_LITERAL);
                            this.pushLocation(this.previousToken.span);
                            key = this.finishNode(new Ast.StringLiteral(this.previousToken.stringValue));
                        }
                        this.expect(Token.COLON);
                        value = this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION);
                    }
                    fields.push(this.finishNode(new Ast.ObjectField(key, value)));
                }
            } while (this.consume(Token.COMMA));
            this.expect(Token.RCURLY);
            return this.finishNode(new Ast.ObjectInitializer(fields, this.consume(Token.COLON) ? this.parseTypeExpression() : null));
        } else if (this.consume(Token.LSQUARE)) {
            this.pushLocation(this.previousToken.span);
            let items = [];
            do {
                while (this.consume(Token.COMMA)) items.push(null);
                if (this.token.type == Token.RSQUARE) break;
                if (this.consume(Token.ELLIPSIS)) {
                    this.pushLocation(this.previousToken.span);
                    items.push(this.finishNode(new Ast.Spread(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION))));
                } else items.push(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION));
            } while (this.consume(Token.COMMA));
            this.expect(Token.RSQUARE);
            return this.finishNode(new Ast.ArrayInitializer(items, this.consume(Token.COLON) ? this.parseTypeExpression() : null));
        } else if (this.consumeKeyword('new')) {
            this.pushLocation(this.previousToken.span);
            let base = this.parseOptPrimaryExpression(false);
            if (!base) this.raiseUnexpected();
            while (Infinity) {
                if (this.token.type == Token.DOT) {
                    this.pushLocation(base.span);
                    this.nextToken();
                    if (this.consumeOperator(Operator.LT)) {
                        let argumentsList = [];
                        do {
                            argumentsList.push(this.parseTypeExpression());
                        } while (this.consume(Token.COMMA));
                        this.expectGT();
                        base = this.finishNode(new Ast.GenericInstantiationExpression(base, argumentsList));
                    } else {
                        let id = this.parseIdentifier(true);
                        base = this.finishNode(new Ast.MemberExpression(base, id));
                    }
                }
                else if (this.token.type == Token.LSQUARE && this.inlineOrAtHigherIndentLine) {
                    this.pushLocation(base.span);
                    this.nextToken();
                    let exp = this.parseExpression();
                    this.expect(Token.RSQUARE);
                    base = this.finishNode(new Ast.IndexExpression(base, exp));
                }
                else break;
            }
            let argumentsList = [];
            if (this.consume(Token.LPAREN)) {
                do {
                    if (this.token.type == Token.RPAREN) break;
                    argumentsList.push(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION));
                } while (this.consume(Token.COMMA));
                this.expect(Token.RPAREN);
            }
            return this.finishNode(new Ast.NewExpression(base, argumentsList));
        }
        else if (this.token.isOperator(Operator.LT)) {
            return this.parseNodeInitializer(true);
        }
        return null;
    }

    // assumes previousToken is the starting identifier
    parseIdentifierPrimaryExpression(allowTypedId = true, minPrecedence = null) {
        minPrecedence = minPrecedence || OperatorPrecedence.POSTFIX;
        this.pushLocation(this.previousToken.span);
        let name = this.previousToken.stringValue;
        if (allowTypedId && this.consume(Token.COLON)) {
            return this.finishNode(new Ast.Identifier(name, this.parseTypeExpression()));
        } else if (this.token.type == Token.STRING_LITERAL && this.previousToken.isContextKeyword('embed')) {
            this.nextToken();
            let embedType = this.consume(Token.COLON) ? this.parseTypeExpression() : null;
            return this.finishNode(new Ast.EmbedExpression(this.previousToken.stringValue, embedType));
        }
        let r = this.finishNode(new Ast.Identifier(name));
        if (this.consume(Token.ARROW)) {
            this.pushLocation(r.span);
            let [params] = this.convertExpressionsIntoArrowFunctionParams([r]);
            r = this.parseArrowFunctionExpression(params, null, null);
        }
        return r;
    }

    parseParensExpressionOrArrowFunctionOfOneOrMoreParams() {
        let expressions = [];
        do {
            if (this.consume(Token.ELLIPSIS)) {
                let [params, optParams] = this.convertExpressionsIntoArrowFunctionParams(expressions);
                let restParam = this.parseVariableBinding();
                if (restParam.init) this.syntaxError('restParamMustntHaveInit', restParam.span);
                this.expect(Token.RPAREN);
                let returnType = this.consume(Token.COLON) ? this.parseTypeExpression() : null;
                this.expect(Token.ARROW);
                return this.parseArrowFunctionExpression(params, optParams, restParam, returnType);
            }
            expressions.push(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION));
        } while (this.consume(Token.COMMA));
        this.expect(Token.RPAREN);
        if (this.consume(Token.COLON)) {
            let [params, optParams] = this.convertExpressionsIntoArrowFunctionParams(expressions);
            let returnType = this.parseTypeExpression();
            this.expect(Token.ARROW);
            return this.parseArrowFunctionExpression(params, optParams, null, returnType);
        }
        if (this.consume(Token.ARROW)) {
            let [params, optParams] = this.convertExpressionsIntoArrowFunctionParams(expressions);
            return this.parseArrowFunctionExpression(params, optParams, null);
        }
        let exp = null;
        if (expressions.length == 1) {
            exp = expressions[0];
        } else {
            let startSpan = expressions[0].span;
            exp = new Ast.ListExpression(expressions);
            exp.span = startSpan.to(expressions[expressions.length - 1].span);
        }
        return this.finishNode(new Ast.ParensExpression(exp));
    }

    convertExpressionsIntoArrowFunctionParams(expressions): [null | Ast.VariableBinding[], null | Ast.VariableBinding[]] {
        let params = null, optParams = null;
        for (let exp of expressions) {
            if (exp instanceof Ast.AssignmentExpression) {
                if ((exp.left instanceof Ast.DestructuringPattern) || exp.compound != null)
                    this.syntaxError('invalidArrowFunctionParam', exp.span);
                else [params, optParams] = this.convertExpressionIntoArrowFunctionParam(exp.left, exp.right, params, optParams);
            } else [params, optParams] = this.convertExpressionIntoArrowFunctionParam(exp, null, params, optParams);
        }
        return [params, optParams];
    }

    convertExpressionIntoArrowFunctionParam(node, init, outParams, outOptParams): [null | Ast.VariableBinding[], null | Ast.VariableBinding[]] {
        if (init) {
            outOptParams = outOptParams || [];
            this.pushLocation(node.span);
            let pattern = this.convertExpressionIntoDestructuringPattern(node);
            outOptParams = outOptParams || [];
            outOptParams.push(this.finishNode(new Ast.VariableBinding(pattern, init), node.span.to(init.span)));
        } else {
            outParams = outParams || [];
            this.pushLocation(node.span);
            let pattern = this.convertExpressionIntoDestructuringPattern(node);
            outParams = outParams || [];
            outParams.push(this.finishNode(new Ast.VariableBinding(pattern, null), node.span));
            if (outOptParams)
                this.syntaxError('requiredParamMustntFollowOptParam', node.span);
        }

        return [outParams, outOptParams];
    }

    /**
     * Parses arrow function, assuming the previous token is `->`
     * and that the starting location was pushed to the stack.
     */
    parseArrowFunctionExpression(params, optParams, restParam, returnType = null) {
        let sf = new StackFunction;
        this.functionStack.push(sf);
        let body = this.token.type == Token.LCURLY
            ? this.parseBlock(new ConstructorContext)
            : this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION);
        this.functionStack.pop();
        this.duplicateLocation();
        let common = this.finishNode(new Ast.FunctionCommon(sf.usesAwait, sf.usesYield, params, optParams, restParam, returnType, null, body));
        return this.finishNode(new Ast.FunctionExpression(null, common));
    }

    parseNodeInitializer(root = false) {
        this.markLocation();
        this.expectOperator(Operator.LT);
        if (root && this.consumeOperator(Operator.GT)) {
            let children = [];
            while (!this.consume(Token.LT_SLASH)) {
                if (this.token.type == Token.LCURLY) {
                    this.markLocation();
                    this.nextToken();
                    let expr = this.parseExpression();
                    this.expect(Token.RCURLY);
                    children.push(this.finishNode(new Ast.Spread(expr)));
                } else {
                    children.push(this.parseNodeInitializer());
                }
            }
            this.expectOperator(Operator.GT);
            return this.finishNode(new Ast.NodeListInitializer(children));
        }
        this.markLocation();
        let id = this.finishNode(new Ast.Identifier(this.expectIdentifier()));
        while (this.consume(Token.COLON)) {
            this.pushLocation(id.span);
            id = this.finishNode(new Ast.MemberExpression(id, this.expectIdentifier()));
        }
        let attribs = [];
        while (!this.token.isOperator(Operator.DIVIDE) && !this.token.isOperator(Operator.GT)) {
            this.markLocation();
            this.duplicateLocation();
            let id = this.finishNode(new Ast.Identifier(this.expectIdentifier()));
            let value = null;
            if (this.consume(Token.ASSIGN)) {
                if (this.consume(Token.LCURLY)) {
                    value = this.parseExpression();
                    this.expect(Token.RCURLY);
                } else {
                    value = this.parseOptPrimaryExpression(false);
                    if (!value) this.throwUnexpected();
                }
            }
            let attrib = this.finishNode(new Ast.NodeAttribute(id, value));
            attribs.push(attrib);
        }
        let children = null;
        if (this.consumeOperator(Operator.DIVIDE)) {
            this.expectOperator(Operator.GT);
        } else {
            this.expectOperator(Operator.GT);
            children = [];
            while (!this.consume(Token.LT_SLASH)) {
                if (this.token.type == Token.LCURLY) {
                    this.markLocation();
                    this.nextToken();
                    let expr = this.parseExpression();
                    this.expect(Token.RCURLY);
                    children.push(this.finishNode(new Ast.Spread(expr)));
                } else {
                    children.push(this.parseNodeInitializer());
                }
            }
            this.expectIdentifier();
            while (this.consume(Token.COLON)) {
                this.expectIdentifier();
            }
            this.expectOperator(Operator.GT);
        }
        return this.finishNode(new Ast.NodeInitializer(id, attribs, children));
    }

    static _unaryOperatorFiltersByOperator = new Map<Operator, OperatorFilter>([
        [Operator.ADD, {operator: Operator.POSITIVE, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.UNARY}],
        [Operator.SUBTRACT, {operator: Operator.NEGATE, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.UNARY}],
        [Operator.BITWISE_NOT, {operator: Operator.BITWISE_NOT, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.UNARY}],
        [Operator.PRE_INCREMENT, {operator: Operator.PRE_INCREMENT, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.POSTFIX}],
        [Operator.PRE_DECREMENT, {operator: Operator.PRE_DECREMENT, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.POSTFIX}],
    ]);

    static _unaryOperatorFiltersByKeyword = new Map<string, OperatorFilter>([
        ['await', {operator: Operator.AWAIT, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.UNARY}],
        ['yield', {operator: Operator.YIELD, precedence: OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION, nextPrecedence: OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION}],
        ['delete', {operator: Operator.DELETE, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.POSTFIX}],
        ['typeof', {operator: Operator.TYPEOF, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.UNARY}],
        ['void', {operator: Operator.VOID, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.UNARY}],
    ]);

    static _unaryOperatorFiltersByTokenType = new Map([
        [Token.EXCLAMATION_MARK, {operator: Operator.LOGICAL_NOT, precedence: OperatorPrecedence.UNARY, nextPrecedence: OperatorPrecedence.UNARY}],
    ]);

    /**
     * Returns `null` or `{operator, precedence, nextPrecedence}`.
     */
    filterUnaryOperator(): null | OperatorFilter {
        if (this.token.type == Token.OPERATOR)
            return InternalParser._unaryOperatorFiltersByOperator.get(this.token.operator) || null;
        else if (this.token.type == Token.KEYWORD)
            return InternalParser._unaryOperatorFiltersByKeyword.get(this.token.stringValue) || null;
        else return InternalParser._unaryOperatorFiltersByTokenType.get(this.token.type) || null;
    }

    static _binaryOperatorFiltersByOperator = new Map<Operator, OperatorFilter>([
        [Operator.ADD, {operator: Operator.ADD, precedence: OperatorPrecedence.ADDITIVE, nextPrecedence: OperatorPrecedence.MULTIPLICATIVE}],
        [Operator.SUBTRACT, {operator: Operator.SUBTRACT, precedence: OperatorPrecedence.ADDITIVE, nextPrecedence: OperatorPrecedence.MULTIPLICATIVE}],
        [Operator.MULTIPLY, {operator: Operator.MULTIPLY, precedence: OperatorPrecedence.MULTIPLICATIVE, nextPrecedence: OperatorPrecedence.EXPONENTIATION}],
        [Operator.DIVIDE, {operator: Operator.DIVIDE, precedence: OperatorPrecedence.MULTIPLICATIVE, nextPrecedence: OperatorPrecedence.EXPONENTIATION}],
        [Operator.REMAINDER, {operator: Operator.REMAINDER, precedence: OperatorPrecedence.MULTIPLICATIVE, nextPrecedence: OperatorPrecedence.EXPONENTIATION}],
        [Operator.POW, {operator: Operator.POW, precedence: OperatorPrecedence.EXPONENTIATION, nextPrecedence: OperatorPrecedence.EXPONENTIATION}],
        [Operator.LOGICAL_AND, {operator: Operator.LOGICAL_AND, precedence: OperatorPrecedence.LOGICAL_AND, nextPrecedence: OperatorPrecedence.BITWISE_OR}],
        [Operator.LOGICAL_XOR, {operator: Operator.LOGICAL_XOR, precedence: OperatorPrecedence.LOGICAL_XOR, nextPrecedence: OperatorPrecedence.LOGICAL_AND}],
        [Operator.LOGICAL_OR, {operator: Operator.LOGICAL_OR, precedence: OperatorPrecedence.LOGICAL_OR, nextPrecedence: OperatorPrecedence.LOGICAL_XOR}],
        [Operator.NULL_COALESCING, {operator: Operator.NULL_COALESCING, precedence: OperatorPrecedence.LOGICAL_OR, nextPrecedence: OperatorPrecedence.NULL_COALESCING}],
        [Operator.BITWISE_AND, {operator: Operator.BITWISE_AND, precedence: OperatorPrecedence.BITWISE_AND, nextPrecedence: OperatorPrecedence.EQUALITY}],
        [Operator.BITWISE_XOR, {operator: Operator.BITWISE_XOR, precedence: OperatorPrecedence.BITWISE_XOR, nextPrecedence: OperatorPrecedence.BITWISE_AND}],
        [Operator.BITWISE_OR, {operator: Operator.BITWISE_OR, precedence: OperatorPrecedence.BITWISE_OR, nextPrecedence: OperatorPrecedence.BITWISE_XOR}],
        [Operator.LEFT_SHIFT, {operator: Operator.LEFT_SHIFT, precedence: OperatorPrecedence.SHIFT, nextPrecedence: OperatorPrecedence.ADDITIVE}],
        [Operator.RIGHT_SHIFT, {operator: Operator.RIGHT_SHIFT, precedence: OperatorPrecedence.SHIFT, nextPrecedence: OperatorPrecedence.ADDITIVE}],
        [Operator.UNSIGNED_RIGHT_SHIFT, {operator: Operator.UNSIGNED_RIGHT_SHIFT, precedence: OperatorPrecedence.SHIFT, nextPrecedence: OperatorPrecedence.ADDITIVE}],
        [Operator.EQUALS, {operator: Operator.EQUALS, precedence: OperatorPrecedence.EQUALITY, nextPrecedence: OperatorPrecedence.RELATIONAL}],
        [Operator.NOT_EQUALS, {operator: Operator.NOT_EQUALS, precedence: OperatorPrecedence.EQUALITY, nextPrecedence: OperatorPrecedence.RELATIONAL}],
        [Operator.STRICT_EQUALS, {operator: Operator.STRICT_EQUALS, precedence: OperatorPrecedence.EQUALITY, nextPrecedence: OperatorPrecedence.RELATIONAL}],
        [Operator.STRICT_NOT_EQUALS, {operator: Operator.STRICT_NOT_EQUALS, precedence: OperatorPrecedence.EQUALITY, nextPrecedence: OperatorPrecedence.RELATIONAL}],
        [Operator.LT, {operator: Operator.LT, precedence: OperatorPrecedence.RELATIONAL, nextPrecedence: OperatorPrecedence.SHIFT}],
        [Operator.GT, {operator: Operator.GT, precedence: OperatorPrecedence.RELATIONAL, nextPrecedence: OperatorPrecedence.SHIFT}],
        [Operator.LE, {operator: Operator.LE, precedence: OperatorPrecedence.RELATIONAL, nextPrecedence: OperatorPrecedence.SHIFT}],
        [Operator.GE, {operator: Operator.GE, precedence: OperatorPrecedence.RELATIONAL, nextPrecedence: OperatorPrecedence.SHIFT}],
    ]);

    static _binaryOperatorFiltersByKeyword = new Map<string, OperatorFilter>([
    ]);

    static _binaryOperatorFiltersByTokenType = new Map<Token, OperatorFilter>([
    ]);

    /**
     * Returns `null` or `{operator, precedence, nextPrecedence}`.
     */
    filterBinaryOperator(): null | OperatorFilter {
        if (this.token.type == Token.OPERATOR)
            return InternalParser._binaryOperatorFiltersByOperator.get(this.token.operator) || null;
        else if (this.token.type == Token.KEYWORD)
            return InternalParser._binaryOperatorFiltersByKeyword.get(this.token.stringValue) || null;
        else return InternalParser._binaryOperatorFiltersByTokenType.get(this.token.type) || null;
    }

    /**
     * Determines if current token is in same line as previous token
     * or if current token is at a new line with higher indentation
     * than previous token.
     */
    get inlineOrAtHigherIndentLine() {
        return this.previousToken.firstLine == this.token.firstLine || this.script.getLineIndent(this.previousToken.firstLine) < this.script.getLineIndent(this.token.firstLine);
    }

    parseSubexpressions(r, allowIn = true, minPrecedence = null) {
        minPrecedence = minPrecedence || OperatorPrecedence.LIST;
        for (;;) {
            let filter = this.filterBinaryOperator();
            if (filter && minPrecedence.valueOf() <= filter.precedence.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                r = this.finishNode(new Ast.BinaryExpression(filter.operator, r, this.parseExpression(allowIn, filter.nextPrecedence)));
            } else if (this.token.type == Token.EXCLAMATION_MARK && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf() && this.previousToken.lastLine == this.token.firstLine) {
                this.pushLocation(r.span);
                this.nextToken();
                r = this.finishNode(new Ast.UnaryExpression(Operator.NON_NULL, r));
            } else if (this.token.isOperator(Operator.PRE_INCREMENT) && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf() && this.previousToken.lastLine == this.token.firstLine) {
                this.pushLocation(r.span);
                this.nextToken();
                r = this.finishNode(new Ast.UnaryExpression(Operator.POST_INCREMENT, r));
            } else if (this.token.isOperator(Operator.PRE_DECREMENT) && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf() && this.previousToken.lastLine == this.token.firstLine) {
                this.pushLocation(r.span);
                this.nextToken();
                r = this.finishNode(new Ast.UnaryExpression(Operator.POST_DECREMENT, r));
            } else if (this.token.isKeyword('as') && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                let strict = this.consume(Token.EXCLAMATION_MARK);
                if (!strict) this.consume(Token.QUESTION_MARK);
                r = this.finishNode(new Ast.TypeBinaryExpression(strict ? Operator.AS_STRICT : Operator.AS, r, this.parseTypeExpression()));
            } else if (this.token.isKeyword('instanceof') && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                r = this.finishNode(new Ast.TypeBinaryExpression(Operator.INSTANCEOF, r, this.parseTypeExpression()));
            } else if (this.token.isKeyword('is') && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                r = this.finishNode(new Ast.TypeBinaryExpression(Operator.IS, r, this.parseTypeExpression()));
            } else if (this.token.type == Token.ASSIGN && minPrecedence.valueOf() <= OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                let leftAsPattern = this.token.type == Token.LSQUARE || this.token.type == Token.LCURLY ? this.optConvertExpressionIntoDestructuringPattern(r) : null;
                let left = leftAsPattern || r;
                r = this.finishNode(new Ast.AssignmentExpression(left, null, this.parseExpression(allowIn, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION)));
            } else if (this.token.type == Token.COMPOUND_ASSIGNMENT && minPrecedence.valueOf() <= OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION.valueOf()) {
                this.pushLocation(r.span);
                let {operator: compound} = this.token;
                this.nextToken();
                r = this.finishNode(new Ast.AssignmentExpression(r, compound, this.parseExpression(allowIn, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION)));
            } else if (this.token.type == Token.QUESTION_MARK && minPrecedence.valueOf() <= OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                let consequent = this.parseExpression(allowIn, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION, false);
                this.expect(Token.COLON);
                let alternative = this.parseExpression(allowIn, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION);
                r = this.finishNode(new Ast.ConditionalExpression(r, consequent, alternative));
            } else if (this.token.type == Token.COMMA && minPrecedence.valueOf() <= OperatorPrecedence.LIST.valueOf()) {
                this.pushLocation(r.span);
                let expressions = [r];
                while (this.consume(Token.COMMA)) expressions.push(this.parseExpression(allowIn, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION));
                r = this.finishNode(new Ast.ListExpression(expressions));
            } else if (this.token.type == Token.DOT && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                if (this.consumeOperator(Operator.LT)) {
                    let argumentsList = [];
                    do {
                        argumentsList.push(this.parseTypeExpression());
                    } while (this.consume(Token.COMMA));
                    this.expectGT();
                    r = this.finishNode(new Ast.GenericInstantiationExpression(r, argumentsList));
                } else {
                    let id = this.parseIdentifier(true);
                    r = this.finishNode(new Ast.MemberExpression(r, id));
                }
            } else if (this.token.type == Token.LSQUARE && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf() && this.inlineOrAtHigherIndentLine) {
                this.pushLocation(r.span);
                this.nextToken();
                let exp = this.parseExpression();
                this.expect(Token.RSQUARE);
                r = this.finishNode(new Ast.IndexExpression(r, exp));
            } else if (this.token.type == Token.LPAREN && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf() && this.inlineOrAtHigherIndentLine) {
                this.pushLocation(r.span);
                this.nextToken();
                let argumentsList = [];
                do {
                    if (this.token.type == Token.RPAREN) break;
                    argumentsList.push(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION));
                } while (this.consume(Token.COMMA));
                this.expect(Token.RPAREN);
                r = this.finishNode(new Ast.CallExpression(r, argumentsList));
            } else if (this.token.type == Token.QUESTION_DOT && minPrecedence.valueOf() <= OperatorPrecedence.POSTFIX.valueOf()) {
                this.pushLocation(r.span);
                this.nextToken();
                if (this.consume(Token.LPAREN)) {
                    let argumentsList = [];
                    do {
                        if (this.token.type == Token.RPAREN) break;
                        argumentsList.push(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION));
                    } while (this.consume(Token.COMMA));
                    this.expect(Token.RPAREN);
                    r = this.finishNode(new Ast.CallExpression(r, argumentsList, true));
                } else if (this.consume(Token.LSQUARE)) {
                    let exp = this.parseExpression();
                    this.expect(Token.RSQUARE);
                    r = this.finishNode(new Ast.IndexExpression(r, exp, true));
                } else {
                    this.markLocation();
                    let name = this.expectIdentifier(true);
                    let id = this.finishNode(new Ast.Identifier(name));
                    r = this.finishNode(new Ast.MemberExpression(r, id, true));
                }
            } else break;
        }
        return r;
    }

    parseOptGenericTypesDeclaration() {
        if (this.token.type != Token.DOT) return null;
        this.markLocation();
        this.nextToken();
        this.expectOperator(Operator.LT);
        let params = [];
        do {
            this.markLocation();
            this.duplicateLocation();
            let id = this.finishNode(new Ast.Identifier(this.expectIdentifier()));
            params.push(this.finishNode(new Ast.GenericTypeParameter(id)));
        } while (this.consume(Token.COMMA));
        this.expectGT();
        return this.finishNode(new Ast.Generics(params));
    }

    parseOptGenericBounds(generics): [Boolean, Ast.Generics] {
        if (!this.consumeKeyword('where')) return [false, generics];
        do {
            this.markLocation();
            let id = this.parseIdentifier();
            let paramName = id.name;
            this.expectKeyword('is');
            let bound = this.finishNode(new Ast.GenericTypeParameterIsBound(id, this.parseTypeExpression()));
            if (!generics) {
                generics = new Ast.Generics([]);
                this.pushLocation(id.span);
                this.finishNode(generics);
            }
            generics.bounds = generics.bounds ?? [];
            generics.bounds.push(bound);
        } while (this.consume(Token.COMMA));
        return [true, generics];
    }

    parseFunctionCommon(generics = null, forFunctionDefinition = false, isConstructor = false) {
        this.markLocation();
        this.expect(Token.LPAREN);
        let params = null,
            optParams = null,
            restParam = null;
        do {
            if (this.token.type == Token.RPAREN) break;
            if (this.consume(Token.ELLIPSIS)) {
                restParam = this.parseVariableBinding();
                if (restParam.init) this.syntaxError('restParamMustntHaveInit', restParam.span);
                break;
            }
            let binding = this.parseVariableBinding();
            if (binding.init) {
                optParams = optParams || [];
                optParams.push(binding);
            } else {
                if (optParams) this.syntaxError('requiredParamMustntFollowOptParam', binding.span);
                params = params || [];
                params.push(binding);
            }
        } while (this.consume(Token.COMMA));
        this.expect(Token.RPAREN);
        let returnType = this.consume(Token.COLON) ? this.parseTypeExpression() : null;
        let throwsType = null;
        for (;;) {
            if (this.consumeKeyword('throws')) {
                if (throwsType) this.syntaxError('throwsClauseMustntRepeat', this.previousToken.span);
                throwsType = this.parseTypeExpression();
                if (this.token.type == Token.COMMA) {
                    this.pushLocation(throwsType.span); 
                    let types = [throwsType];
                    while (this.consume(Token.COMMA)) types.push(this.parseTypeExpression());
                    throwsType = this.finishNode(new Ast.UnionTypeExpression(types));
                }
            } else {
                let [gotWhereClause, generics2] = this.parseOptGenericBounds(generics);
                generics = generics2;
                if (!gotWhereClause) break;
            }
        }
        let sf = new StackFunction;
        this.functionStack.push(sf);
        let {body, semicolonInserted} = this.parseFunctionBody(sf, forFunctionDefinition, isConstructor);
        this.functionStack.pop();
        return {common: this.finishNode(new Ast.FunctionCommon(sf.usesAwait, sf.usesYield, params, optParams, restParam, returnType, throwsType, body)), semicolonInserted};
    }

    parseFunctionBody(stackFunction, forFunctionDefinition, isConstructor) {
        let context = new ConstructorContext;
        context.isConstructor = isConstructor;
        let block = this.token.type == Token.LCURLY ? this.parseBlock(context) : null;
        if (block) return {body: block, semicolonInserted: true};
        let semicolonInserted = forFunctionDefinition ? this.parseSemicolon() : false;
        if (semicolonInserted) return {body: null, semicolonInserted: true};
        let exp = this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION);
        semicolonInserted = forFunctionDefinition ? this.parseSemicolon() : semicolonInserted;
        return {body: exp, semicolonInserted};
    }

    /**
     * Tries parsing semicolon. Differently from ECMAScript,
     * line terminator only causes a semicolon to be inserted if
     * current token has less than or the same number of
     * indentation spaces compared to the last line of
     * the previous token.
     */
    parseSemicolon() {
        return this.consume(Token.SEMICOLON)
            || this.previousToken.type == Token.RCURLY
            || (this.previousToken.lastLine != this.token.firstLine && this.script.getLineIndent(this.previousToken.firstLine) >= this.script.getLineIndent(this.token.firstLine));
    }

    /**
     * Parses statement and returns `{node, semicolonInserted}`.
     */
    parseStatement(context = null) {
        context = context || new Context;
        let r = this.parseOptStatement(context);
        if (!r) this.throwUnexpected();
        return r;
    }

    /**
     * Parses statement and returns `null` or `{node, semicolonInserted}`.
     */
    parseOptStatement(context = null) {
        context = context || new Context;
        let semicolonInserted = false;
        if (this.token.type == Token.KEYWORD) {
            switch (this.token.stringValue) {
                case 'super': return this.parseSuperStatement(context);
                case 'import': return this.parseImportStatement();
                case 'if': return this.parseIfStatement(context.retainLabelsOnly);
                case 'do': return this.parseDoStatement(context.retainLabelsOnly);
                case 'while': return this.parseWhileStatement(context.retainLabelsOnly);
                case 'break': return this.parseBreakStatement(context);
                case 'continue': return this.parseContinueStatement(context);
                case 'return': return this.parseReturnStatement();
                case 'throw': return this.parseThrowStatement();
                case 'try': return this.parseTryStatement(context.retainLabelsOnly);
                case 'for': return this.parseForStatement(context.retainLabelsOnly);
                case 'switch': return this.parseSwitchStatement(context);
                case 'use': return this.parseUseStatement(context);
                case 'with': return this.parseWithStatement(context);
            }
            if (this.facingDefinitionStrictKeyword || this.takeTokenAsStrictKeywordAccessModifier(this.token) != null) {
                let startSpan = this.token.span;
                let attribs = new DefinitionAttributes;
                this.parseDefinitionAttributes(attribs);
                if (this.facingDefinitionStrictKeyword || this.facingDefinitionContextKeyword)
                    this.nextToken();
                return this.parseAnnotatableDefinition(attribs, context, startSpan);
            }
        } else if (this.consumeIdentifier()) {
            let {span: startSpan, stringValue: name} = this.previousToken;
            if (this.consume(Token.COLON)) {
                return this.parseLabeledStatement(name, context, startSpan);
            } else if (this.token.type == Token.STRING_LITERAL && this.previousToken.isContextKeyword('include') && this.tokenIsInline) {
                return this.parseIncludeStatement(context, startSpan);
            } else if (this.token.type == Token.IDENTIFIER && this.previousTokenIsDefinitionContextKeyword) {
                return this.parseAnnotatableDefinition(new DefinitionAttributes, context, startSpan);
            } else {
                let modifier = (this.token.type == Token.IDENTIFIER || this.facingDefinitionStrictKeyword || this.takeTokenAsStrictKeywordAccessModifier(this.token) != null) && this.tokenIsInline ? this.takeTokenAsContextKeywordModifier(this.previousToken) : null;
                if (modifier != null) {
                    let attribs = new DefinitionAttributes;
                    attribs.modifiers.add(modifier);
                    this.parseDefinitionAttributes(attribs);
                    if (this.facingDefinitionStrictKeyword || this.facingDefinitionContextKeyword)
                        this.nextToken();
                    return this.parseAnnotatableDefinition(attribs, context, startSpan);
                }
                if (this.tokenIsInline && this.previousTokenIsDefinitionContextKeyword)
                    return this.parseAnnotatableDefinition(new DefinitionAttributes, context, startSpan);
                let exp = this.parseIdentifierPrimaryExpression();
                exp = this.parseSubexpressions(exp);
                semicolonInserted = this.parseSemicolon();
                this.pushLocation(exp.span);
                return {node: this.finishNode(new Ast.ExpressionStatement(exp)), semicolonInserted};
            }
        } else if (this.token.type == Token.LCURLY) {
            return {node: this.parseBlock(context.retainLabelsOnly), semicolonInserted: true};
        } else if (this.consume(Token.SEMICOLON)) {
            this.pushLocation(this.previousToken.span);
            return {node: this.finishNode(new Ast.EmptyStatement), semicolonInserted: true};
        } else if (this.token.type == Token.LSQUARE) {
            return this.parsedBracketStartedStatement(context);
        }
        let exp = this.parseExpression();
        if (exp) {
            this.pushLocation(exp.span);
            semicolonInserted = this.parseSemicolon();
            return {node: this.finishNode(new Ast.ExpressionStatement(exp)), semicolonInserted};
        }
        return null;
    }

    parseIncludeStatement(context, startSpan) {
        this.pushLocation(startSpan);
        let src = this.token.stringValue;
        this.nextToken();
        let semicolonInserted = this.parseSemicolon();
        let r = this.finishNode(new Ast.IncludeStatement(src));
        let resolvedPath = Paths.resolve(Paths.dirname(this.script.filePath), src);
        resolvedPath = resolvedPath.endsWith('.es') ? resolvedPath : resolvedPath + '.es';
        let childSource = '', childScript = null, childStatements = [];

        try {
            childSource = FileSystem.readFileSync(resolvedPath, 'utf-8');
        } catch (e) {
            this.verifyError('failedToResolveInclude', r.span);
        }

        childScript = new Script(resolvedPath, childSource);
        try {
            let tokenizer = new Tokenizer(childScript);
            tokenizer.tokenize();
            let childParser = new InternalParser(childScript, tokenizer);
            childParser.functionStack = this.functionStack;
            while (childParser.token.type != Token.EOF) {
                let {node: stmt, semicolonInserted} = childParser.parseStatement(context);
                if (stmt) childStatements.push(stmt);
                if (!semicolonInserted) break;
            }
            if (childParser.token.type != Token.EOF) childParser.throwUnexpected();
        } catch (e) {
            if (!(e instanceof ParseError)) throw e;
        }

        r.childScript = childScript;
        r.childStatements = childStatements;
        this.script.addIncludedScript(childScript);

        return {node: r, semicolonInserted};
    }

    get tokenIsInline() {
        return this.previousToken.lastLine == this.token.firstLine;
    }

    parsedBracketStartedStatement(context) {
        let startSpan = this.token.span;
        let exp = this.parseExpression();
        let isExpAValidDecorator = exp => {
            if (exp instanceof Ast.ArrayInitializer && exp.type == null)
                return true;
            if (exp instanceof Ast.IndexExpression && exp.optional == false)
                return isExpAValidDecorator(exp.base);
            return false;
        };
        let exps = [exp];
        let foundInvalidDecorator = !isExpAValidDecorator(exp);
        while (this.token.type == Token.LSQUARE) {
            exp = this.parseExpression();
            exps.push(exp);
            if (!isExpAValidDecorator(exp)) {
                foundInvalidDecorator = true;
                break;
            }
        }
        if (!foundInvalidDecorator && (this.facingDefinitionContextKeyword || this.facingDefinitionStrictKeyword || this.takeTokenAsContextKeywordModifier(this.token) != null || this.takeTokenAsStrictKeywordAccessModifier(this.token) != null)) {
            let decorators = [];
            let extractDecorators = exp => {
                if (exp instanceof Ast.ArrayInitializer) {
                    for (let item of exp.items) {
                        if (!(item instanceof Ast.Spread)) decorators.push(item);
                    }
                } else {
                    extractDecorators(exp.base);
                    let {k} = exp.key;
                    if (k instanceof Ast.ListExpression) {
                        for (let exp of k.expressions) decorators.push(exp);
                    } else decorators.push(k);
                }
            };
            for (let exp of exps) extractDecorators(exp);
            let attribs = new DefinitionAttributes;
            attribs.decorators = decorators;
            this.parseDefinitionAttributes(attribs);
            if (this.facingDefinitionContextKeyword || this.facingDefinitionStrictKeyword)
                this.nextToken();
            return this.parseAnnotatableDefinition(attribs, context, startSpan);
        } else {
            this.pushLocation(startSpan);
            this.duplicateLocation();
            exp = this.finishNode(new Ast.ListExpression(exps));
            let semicolonInserted = this.parseSemicolon();
            return {node: this.finishNode(new Ast.ExpressionStatement(exp)), semicolonInserted};
        }
    }

    static _definitionContextKeywords = new Set([
        'enum', 'namespace', 'type',
    ]);

    get previousTokenIsDefinitionContextKeyword() {
        let l = this.previousToken.rawLength;
        if (this.token.type != Token.IDENTIFIER) return false;
        let v = this.previousToken.stringValue;
        return InternalParser._definitionContextKeywords.has(v) && l == v.length;
    }

    get facingDefinitionContextKeyword() {
        let l = this.token.rawLength;
        if (this.token.type != Token.IDENTIFIER) return false;
        let v = this.token.stringValue;
        return InternalParser._definitionContextKeywords.has(v) && l == v.length;
    }

    static _definitionStrictKeywords = new Set([
        'class', 'function', 'interface', 'var', 'const',
    ]);

    get facingDefinitionStrictKeyword() {
        if (this.token.type != Token.KEYWORD) return false;
        let v = this.token.stringValue;
        return InternalParser._definitionStrictKeywords.has(v);
    }

    takeTokenAsContextKeywordModifier(tokenData) {
        let v = tokenData.stringValue;
        if (tokenData.type != Token.IDENTIFIER || tokenData.rawLength != v.length) {
            return null;
        }
        return v == 'final' ? Ast.AnnotatableDefinitionModifier.FINAL
            :  v == 'native' ? Ast.AnnotatableDefinitionModifier.NATIVE
            :  v == 'override' ? Ast.AnnotatableDefinitionModifier.OVERRIDE
            :  v == 'proxy' ? Ast.AnnotatableDefinitionModifier.PROXY
            :  v == 'static' ? Ast.AnnotatableDefinitionModifier.STATIC
            :  null;
    }

    takeTokenAsStrictKeywordAccessModifier(tokenData) {
        if (tokenData.type != Token.KEYWORD) return null;
        let v = tokenData.stringValue;
        return v == 'public' ? Ast.AnnotatableDefinitionAccessModifier.PUBLIC
            :  v == 'private' ? Ast.AnnotatableDefinitionAccessModifier.PRIVATE
            :  v == 'protected' ? Ast.AnnotatableDefinitionAccessModifier.PROTECTED
            :  v == 'internal' ? Ast.AnnotatableDefinitionAccessModifier.INTERNAL
            :  null;
    }

    parseDefinitionAttributes(attribs) {
        let empty = attribs.hasEmptyModifiers;
        for (;;) {
            if (!empty && !this.tokenIsInline) this.syntaxError('tokenMustBeInline', this.token.span);
            let modifier = this.takeTokenAsContextKeywordModifier(this.token);
            if (modifier != null) {
                this.nextToken();
                attribs.modifiers.add(modifier);
                empty = false;
                continue;
            }
            let accessModifier = this.takeTokenAsStrictKeywordAccessModifier(this.token);
            if (accessModifier != null) {
                this.nextToken();
                attribs.accessModifier = accessModifier;
                empty = false;
                continue;
            }
            break;
        }
        return attribs;
    }

    /**
     * Parses annotatable definition, where the start keyword
     * is the previous token.
     */
    parseAnnotatableDefinition(attribs, context, startSpan) {
        let r = this.parseOptAnnotatableDefinition(attribs, context, startSpan);
        if (r == null) this.raiseUnexpected();
        return r;
    }

    /**
     * Tries parsing annotatable definition, where the start keyword
     * is the previous token.
     */
    parseOptAnnotatableDefinition(attribs, context, startSpan) {
        if (this.previousToken.isKeyword('var') || this.previousToken.isKeyword('const'))
            return this.parseVariableDefinition(attribs, context, startSpan);
        if (this.previousToken.isKeyword('function'))
            return this.parseFunctionDefinition(attribs, context, startSpan);
        if (this.previousToken.isContextKeyword('namespace'))
            return this.parseNamespaceDefinition(attribs, context, startSpan);
        if (this.previousToken.isKeyword('class'))
            return this.parseClassDefinition(attribs, context, startSpan);
        if (this.previousToken.isKeyword('interface'))
            return this.parseInterfaceDefinition(attribs, context, startSpan);
        if (this.previousToken.isContextKeyword('enum'))
            return this.parseEnumDefinition(attribs, context, startSpan);
        if (this.previousToken.isContextKeyword('type'))
            return this.parseTypeDefinition(attribs, context, startSpan);
        return null;
    }

    finishAnnotatableDefinition(node, attribs) {
        node.modifiers = attribs.modifiers;
        node.accessModifier = attribs.accessModifier;
        node.decorators = attribs.decorators;
        return this.finishNode(node);
    }

    restrictModifiers(span, actualModifiers, ...modifiersToRestrict) {
        for (let m of modifiersToRestrict)
            if (actualModifiers.has(m)) this.syntaxError('definitionMustntHaveModifier', span, {m: m.toString()});
    }

    parseVariableDefinition(attribs, context, startSpan) {
        this.pushLocation(startSpan);
        let readOnly = this.previousToken.isKeyword('const');
        let isStatic = attribs.modifiers.has(Ast.AnnotatableDefinitionModifier.STATIC);
        let bindings = [];
        do {
            let binding = this.parseVariableBinding();
            bindings.push(binding);

            // enum constant restrictions
            if (context instanceof EnumContext && !isStatic && (!(binding.pattern instanceof Ast.NonDestructuringPattern) || binding.pattern.type != null)) {
                this.verifyError('enumVariantMustBeSimple', binding.span);
            }
        } while (this.consume(Token.COMMA));
        let semicolonInserted = this.parseSemicolon();
        let r = this.finishAnnotatableDefinition(new Ast.VariableDefinition(readOnly, bindings), attribs);

        // enum context
        if (context instanceof EnumContext && !isStatic && !readOnly)
            this.verifyError('enumVariantDeclarationsMustBeConst', r.span);
        // interface context
        else if (context instanceof InterfaceContext)
            this.verifyError('definitionInUnallowedContext', r.span);

        // restrict modifiers
        this.restrictModifiers(r.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            /* Ast.AnnotatableDefinitionModifier.STATIC */
        );

        return {node: r, semicolonInserted};
    }

    parseFunctionDefinition(attribs, context, startSpan) {
        this.pushLocation(startSpan);
        let id = this.parseIdentifier();
        if (this.token.type == Token.IDENTIFIER && this.previousToken.isContextKeyword('get') || this.previousToken.isContextKeyword('set')) {
            let getter = this.previousToken.isContextKeyword('get');
            id = this.parseIdentifier();
            return this.parseGetterOrSetterDefinition(attribs, context, id, getter);
        }
        if (context instanceof ClassContext && id.name == context.name)
            return this.parseConstructorDefinition(attribs, id);
        if (attribs.modifiers.has(Ast.AnnotatableDefinitionModifier.PROXY))
            return this.parseProxyDefinition(attribs, context, id);

        let generics = this.parseOptGenericTypesDeclaration();
        let {common, semicolonInserted} = this.parseFunctionCommon(generics, true, false);
        let r = this.finishAnnotatableDefinition(new Ast.FunctionDefinition(id, generics, common), attribs);

        if (context instanceof InterfaceContext) {
            if (attribs.modifiers.size > 0 || attribs.accessModifier != null || (attribs.decorators != null && attribs.decorators.length > 0)) {
                this.syntaxError('interfaceMethodMustveNoAttributes', id.span);
            }
        } else {
            if (attribs.modifiers.has(Ast.AnnotatableDefinitionModifier.NATIVE)) {
                if (common.body != null) this.syntaxError('nativeFunctionMustntHaveBody', id.span);
            } else if (common.body == null)
                this.syntaxError('functionMustveBody', id.span);
        }

        /*
        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC,
        );
        */

        return {node: r, semicolonInserted};
    }

    parseConstructorDefinition(attribs, id) {
        let {common, semicolonInserted} = this.parseFunctionCommon(null, true, true);
        let r = this.finishAnnotatableDefinition(new Ast.ConstructorDefinition(id, common), attribs);

        if (attribs.modifiers.has(Ast.AnnotatableDefinitionModifier.NATIVE)) {
            if (common.body != null) this.syntaxError('nativeFunctionMustntHaveBody', id.span);
        } else if (common.body == null)
            this.syntaxError('functionMustveBody', id.span);

        if (common.usesAwait)
            this.syntaxError('functionMustNotUseAwait', id.span);
        else if (common.usesYield)
            this.syntaxError('functionMustNotUseYield', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            /* Ast.AnnotatableDefinitionModifier.NATIVE, */
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC,
        );

        return {node: r, semicolonInserted};
    }

    parseGetterOrSetterDefinition(attribs, context, id, isGetter) {
        let {common, semicolonInserted} = this.parseFunctionCommon(null, true, false);
        let r = this.finishAnnotatableDefinition(isGetter ? new Ast.GetterDefinition(id, common) : new Ast.SetterDefinition(id, common), attribs);

        if (context instanceof InterfaceContext) {
            if (attribs.modifiers.size > 0 || attribs.accessModifier != null || (attribs.decorators != null && attribs.decorators.length > 0)) {
                this.syntaxError('interfaceMethodMustveNoAttributes', id.span);
            }
        } else {
            if (attribs.modifiers.has(Ast.AnnotatableDefinitionModifier.NATIVE)) {
                if (common.body != null) this.syntaxError('nativeFunctionMustntHaveBody', id.span);
            } else if (common.body == null)
                this.syntaxError('functionMustveBody', id.span);
        }

        if (common.usesAwait)
            this.syntaxError('functionMustNotUseAwait', id.span);
        else if (common.usesYield)
            this.syntaxError('functionMustNotUseYield', id.span);

        /*
        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC,
        );
        */

        return {node: r, semicolonInserted};
    }

    static _identifierAsProxyOperator = new Map([
        ['positive', Operator.POSITIVE],
        ['negate', Operator.NEGATE],
        ['bitNot', Operator.BITWISE_NOT],
        ['add', Operator.ADD],
        ['subtract', Operator.SUBTRACT],
        ['multiply', Operator.MULTIPLY],
        ['divide', Operator.DIVIDE],
        ['remainder', Operator.REMAINDER],
        ['pow', Operator.POW],
        ['bitAnd', Operator.BITWISE_AND],
        ['bitXor', Operator.BITWISE_XOR],
        ['bitOr', Operator.BITWISE_OR],
        ['leftShift', Operator.LEFT_SHIFT],
        ['rightShift', Operator.RIGHT_SHIFT],
        ['unsignedRightShift', Operator.UNSIGNED_RIGHT_SHIFT],
        ['getIndex', Operator.PROXY_2_GET_INDEX],
        ['setIndex', Operator.PROXY_2_SET_INDEX],
        ['deleteIndex', Operator.PROXY_2_DELETE_INDEX],
        ['has', Operator.IN],
        ['iterateKeys', Operator.PROXY_2_ITERATE_KEYS],
        ['iterateValues', Operator.PROXY_2_ITERATE_VALUES],
        ['convertImplicit', Operator.PROXY_2_CONVERT_IMPLICIT],
        ['convertExplicit', Operator.PROXY_2_CONVERT_EXPLICIT],
    ]);

    parseProxyDefinition(attribs, context, id) {
        let {common, semicolonInserted} = this.parseFunctionCommon(null, true, false);

        let operator = InternalParser._identifierAsProxyOperator.get(id.name) || null;
        if (operator == null) {
            this.verifyError('unrecognizedProxy', id.span, {p:id.name});
            return {node: this.finishAnnotatableDefinition(new Ast.ProxyDefinition(id, Operator.IN, common), attribs), semicolonInserted};
        }

        let r = this.finishAnnotatableDefinition(new Ast.ProxyDefinition(id, operator, common), attribs);

        if (context instanceof ClassContext || context instanceof EnumContext) {
            if (attribs.modifiers.has(Ast.AnnotatableDefinitionModifier.NATIVE)) {
                if (common.body != null) this.syntaxError('nativeFunctionMustntHaveBody', id.span);
            } else if (common.body == null)
                this.syntaxError('functionMustveBody', id.span);
        } else this.verifyError('definitionInUnallowedContext', id.span);

        if (common.usesAwait)
            this.syntaxError('functionMustNotUseAwait', id.span);
        else if (common.usesYield && !(operator == Operator.PROXY_2_ITERATE_KEYS || operator == Operator.PROXY_2_ITERATE_VALUES))
            this.syntaxError('functionMustNotUseYield', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            /* Ast.AnnotatableDefinitionModifier.NATIVE, */
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            /* Ast.AnnotatableDefinitionModifier.PROXY, */
            Ast.AnnotatableDefinitionModifier.STATIC,
        );

        // validate number of parameters
        let {proxyNumParams} = operator;
        if (common.restParam != null || common.optParams != null || (proxyNumParams == 0 ? common.params != null : (common.params == null || common.params.length != proxyNumParams)))
            this.verifyError('proxyHasWrongNumParams', id.span);

        return {node: r, semicolonInserted};
    }

    parseNamespaceDefinition(attribs, context, startSpan) {
        this.pushLocation(startSpan);
        let id = this.parseIdentifier();
        if (this.consume(Token.ASSIGN)) {
            return this.parseNamespaceAliasDefinition(attribs, context, id);
        }
        let block = this.parseBlock(new NamespaceContext);
        let r = this.finishAnnotatableDefinition(new Ast.NamespaceDefinition(id, block), attribs);

        if (!(context instanceof PackageContext || context instanceof NamespaceContext || context instanceof TopLevelContext))
            this.verifyError('definitionInUnallowedContext', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC);

        return {node: r, semicolonInserted: true};
    }

    parseNamespaceAliasDefinition(attribs, context, id) {
        let exp = this.parseExpression();
        let semicolonInserted = this.parseSemicolon();
        let r = this.finishAnnotatableDefinition(new Ast.NamespaceAliasDefinition(id, exp), attribs);

        if (context instanceof InterfaceContext)
            this.verifyError('definitionInUnallowedContext', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC
        );

        return {node: r, semicolonInserted};
    }

    parseClassDefinition(attribs, context, startSpan) {
        this.pushLocation(startSpan);
        let id = this.parseIdentifier();
        let isValue = false, isAlgebraic = false;
        if (attribs.decorators != null) {
            let d = attribs.decorators.filter(d => d instanceof Ast.Identifier && d.name == 'Value' && d.type == null);
            if (d.length > 0) {
                attribs.decorators.splice(attribs.decorators.indexOf(d[0]), 1);
                isValue = true;
            }
            let d2 = attribs.decorators.filter(d => d instanceof Ast.Identifier && d.name == 'Algebraic' && d.type == null);
            if (d2.length > 0) {
                attribs.decorators.splice(attribs.decorators.indexOf(d2[0]), 1);
                isAlgebraic = true;
                isValue = true;
            }
        }
        let generics = this.parseOptGenericTypesDeclaration();
        let extendsType = null, implementsList = null;
        for (;;) {
            if (this.consumeKeyword('extends')) {
                let extendsType2 = this.parseTypeExpression();
                if (extendsType) this.syntaxError('extendsClauseMustntDuplicate', extendsType2.span);
                extendsType = extendsType2;
            } else if (this.consumeKeyword('implements')) {
                implementsList = implementsList || [];
                do {
                    implementsList.push(this.parseTypeExpression());
                } while (this.consume(Token.COMMA));
            } else {
                let [gotWhereClause, generics2] = this.parseOptGenericBounds(generics);
                generics = generics2;
                if (!gotWhereClause) break;
            }
        }
        let block = this.parseBlock(new ClassContext(id.name));
        let r = this.finishAnnotatableDefinition(new Ast.ClassDefinition(id, isValue, isAlgebraic, generics, extendsType, implementsList, block), attribs);

        if (!(context instanceof PackageContext || context instanceof NamespaceContext || context instanceof ClassContext || context instanceof EnumContext || context instanceof InterfaceContext || context instanceof TopLevelContext))
            this.verifyError('definitionInUnallowedContext', id.span);

        if (isValue && extendsType != null)
            this.verifyError('valueClassMustntExtend', id.span);
        if (isValue && implementsList != null)
            this.verifyError('valueClassMustntImplement', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            /* Ast.AnnotatableDefinitionModifier.FINAL, */
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC);

        return {node: r, semicolonInserted: true};
    }

    parseInterfaceDefinition(attribs, context, startSpan) {
        this.pushLocation(startSpan);
        let id = this.parseIdentifier();
        let generics = this.parseOptGenericTypesDeclaration();
        let extendsList = null;
        for (;;) {
            if (this.consumeKeyword('extends')) {
                extendsList = extendsList || [];
                do {
                    extendsList.push(this.parseTypeExpression());
                } while (this.consume(Token.COMMA));
            } else {
                let [gotWhereClause, generics2] = this.parseOptGenericBounds(generics);
                generics = generics2;
                if (!gotWhereClause) break;
            }
        }
        let block = this.parseBlock(new InterfaceContext);
        let r = this.finishAnnotatableDefinition(new Ast.InterfaceDefinition(id, generics, extendsList, block), attribs);

        if (!(context instanceof PackageContext || context instanceof NamespaceContext || context instanceof ClassContext || context instanceof EnumContext || context instanceof InterfaceContext || context instanceof TopLevelContext))
            this.verifyError('definitionInUnallowedContext', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            /* Ast.AnnotatableDefinitionModifier.FINAL, */
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC);

        return {node: r, semicolonInserted: true};
    }

    parseEnumDefinition(attribs, context, startSpan) {
        this.pushLocation(startSpan);
        let id = this.parseIdentifier();
        let isFlags = false;
        if (attribs.decorators != null) {
            let d = attribs.decorators.filter(d => d instanceof Ast.Identifier && d.name == 'Flags' && d.type == null);
            if (d.length > 0) {
                attribs.decorators.splice(attribs.decorators.indexOf(d[0]), 1);
                isFlags = true;
            }
        }
        let numericType = this.consume(Token.COLON) ? this.parseTypeExpression() : null;
        let block = this.parseBlock(new EnumContext);
        let r = this.finishAnnotatableDefinition(new Ast.EnumDefinition(id, isFlags, numericType, block), attribs);

        if (!(context instanceof PackageContext || context instanceof NamespaceContext || context instanceof ClassContext || context instanceof EnumContext || context instanceof InterfaceContext || context instanceof TopLevelContext))
            this.verifyError('definitionInUnallowedContext', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC);

        return {node: r, semicolonInserted: true};
    }

    parseTypeDefinition(attribs, context, startSpan) {
        this.pushLocation(startSpan);
        let wildcardSpan = this.token.span;
        let id = this.parseIdentifier();
        let generics = this.parseOptGenericTypesDeclaration();
        while (Infinity) {
            let [gotWhereClause, generics2] = this.parseOptGenericBounds(generics);
            generics = generics2;
            if (!gotWhereClause) break;
        }
        this.expect(Token.ASSIGN);
        let type = this.parseTypeExpression();
        let semicolonInserted = this.parseSemicolon();
        let r = this.finishAnnotatableDefinition(new Ast.TypeDefinition(id, generics, type), attribs);

        if (context instanceof InterfaceContext)
            this.verifyError('definitionInUnallowedContext', id.span);

        this.restrictModifiers(id.span, attribs.modifiers,
            Ast.AnnotatableDefinitionModifier.FINAL,
            Ast.AnnotatableDefinitionModifier.NATIVE,
            Ast.AnnotatableDefinitionModifier.OVERRIDE,
            Ast.AnnotatableDefinitionModifier.PROXY,
            Ast.AnnotatableDefinitionModifier.STATIC);

        return {node: r, semicolonInserted};
    }

    parseBlock(context = null) {
        context = context || new Context;
        this.markLocation();
        this.expect(Token.LCURLY);
        let statements = [];
        while (this.token.type != Token.RCURLY) {
            let {node: stmt, semicolonInserted} = this.parseStatement(context);
            if (stmt) statements.push(stmt);
            if (!semicolonInserted) break;
        }
        this.expect(Token.RCURLY);
        return this.finishNode(new Ast.Block(statements));
    }

    parseLabeledStatement(label, context, startSpan) {
        this.pushLocation(startSpan);
        let labeledContext = (context instanceof LabeledStatementsContext ? context : new LabeledStatementsContext).addLabel(label);
        let {node: r, semicolonInserted} = this.parseStatement(labeledContext);
        return {node: this.finishNode(new Ast.LabeledStatement(label, r)), semicolonInserted};
    }

    parseSuperStatement(context) {
        this.markLocation();
        this.nextToken();
        if (this.consume(Token.LPAREN)) {
            let argumentsList = [];
            do {
                if (this.token.type == Token.RPAREN) break;
                argumentsList.push(this.parseExpression(true, OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION));
            } while (this.consume(Token.COMMA));
            this.expect(Token.RPAREN);
            let semicolonInserted = this.parseSemicolon();
            let r = this.finishNode(new Ast.SuperStatement(argumentsList));
            if (!context.isConstructor || context.superStatementFound)
                this.syntaxError('unexpectedSuperStatement', r.span);
            else context.superStatementFound = true;
            return {node: r, semicolonInserted};
        } else {
            let exp = this.parseSubexpressions(this.finishNode(new Ast.SuperExpression));
            this.pushLocation(exp.span);
            let semicolonInserted = this.parseSemicolon();
            return {node: this.finishNode(new Ast.ExpressionStatement(exp)), semicolonInserted};
        }
    }

    parseImportStatement() {
        this.markLocation();
        this.nextToken();
        if (this.consume(Token.DOT)) {
            this.expectContextKeyword('meta');
            this.duplicateLocation();
            let exp = this.finishNode(new Ast.ImportMetaExpression);
            exp = this.parseSubexpressions(exp);
            let semicolonInserted = this.parseSemicolon();
            return {node: this.finishNode(new Ast.ExpressionStatement(exp)), semicolonInserted};
        }
        let id = this.parseIdentifier();
        let alias = null, importName = [], wildcard = false, recursive = false;
        if (this.token.type == Token.DOT) {
            importName.push(id);
        } else {
            alias = id;
            this.expect(Token.ASSIGN);
            importName.push(this.parseIdentifier());
            if (this.token.type != Token.DOT) this.throwUnexpected();
        }
        while (this.consume(Token.DOT)) {
            if (this.consumeOperator(Operator.MULTIPLY)) {
                wildcard = true;
                break;
            } else if (this.consumeOperator(Operator.POW)) {
                recursive = true;
                break;
            } else importName.push(this.parseIdentifier(true));
        }
        let semicolonInserted = this.parseSemicolon();
        return {node: this.finishNode(new Ast.ImportStatement(alias, importName, wildcard, recursive)), semicolonInserted};
    }

    parseIdentifier(keyword = false) {
        this.markLocation();
        let name = this.expectIdentifier(keyword);
        return this.finishNode(new Ast.Identifier(name));
    }

    parseIfStatement(context) {
        this.markLocation();
        this.nextToken();
        this.expect(Token.LPAREN);
        let test = this.parseExpression();
        this.expect(Token.RPAREN);
        let {node: consequent, semicolonInserted} = this.parseStatement(context.retainLabelsOnly);
        let alternative = null;
        if (semicolonInserted && this.consumeKeyword('else'))
            ({node: alternative, semicolonInserted} = this.parseStatement(context.retainLabelsOnly));
        return {node: this.finishNode(new Ast.IfStatement(test, consequent, alternative)), semicolonInserted};
    }

    parseDoStatement(context) {
        this.markLocation();
        this.nextToken();
        let bodyCtx = context.retainLabelsOnly;
        bodyCtx.inIterationStatement = true;
        let {node: body, semicolonInserted} = this.parseStatement(bodyCtx);
        if (!semicolonInserted) this.throwUnexpected();
        this.expectKeyword('while');
        this.expect(Token.LPAREN);
        let test = this.parseExpression();
        this.expect(Token.RPAREN);
        return {node: this.finishNode(new Ast.DoStatement(body, test)), semicolonInserted: true};
    }

    parseWhileStatement(context) {
        this.markLocation();
        this.nextToken();
        this.expect(Token.LPAREN);
        let test = this.parseExpression();
        this.expect(Token.RPAREN);
        let bodyCtx = context.retainLabelsOnly;
        bodyCtx.inIterationStatement = true;
        let {node: body, semicolonInserted} = this.parseStatement(bodyCtx);
        return {node: this.finishNode(new Ast.WhileStatement(test, body)), semicolonInserted};
    }

    parseBreakStatement(context) {
        this.markLocation();
        this.nextToken();
        let label = this.previousToken.lastLine == this.token.firstLine && this.consumeIdentifier() ? this.previousToken.stringValue : null;
        let semicolonInserted = this.parseSemicolon();
        let r = this.finishNode(new Ast.BreakStatement(label));
        if (label != null && !context.hasLabel(label))
            this.verifyError('undefinedLabel', r.span, {label});
        else (label == null && !(context.inIterationStatement || context.inSwitchStatement))
            this.syntaxError('illegalBreakStatement', r.span);
        return {node: r, semicolonInserted};
    }

    parseContinueStatement(context) {
        this.markLocation();
        this.nextToken();
        let label = this.previousToken.lastLine == this.token.firstLine && this.consumeIdentifier() ? this.previousToken.stringValue : null;
        let semicolonInserted = this.parseSemicolon();
        let r = this.finishNode(new Ast.ContinueStatement(label));
        if (label != null && !context.hasLabel(label))
            this.verifyError('undefinedLabel', r.span, {label});
        else (label == null && !(context.inIterationStatement || context.inSwitchStatement))
            this.syntaxError('illegalContinueStatement', r.span);
        return {node: r, semicolonInserted};
    }

    parseReturnStatement() {
        this.markLocation();
        this.nextToken();
        let exp = null;
        let semicolonInserted = this.parseSemicolon();
        if (!semicolonInserted && this.previousToken.lastLine == this.token.firstLine) {
            exp = this.parseOptExpression();
            semicolonInserted = exp ? this.parseSemicolon() : semicolonInserted;
        }
        return {node: this.finishNode(new Ast.ReturnStatement(exp)), semicolonInserted};
    }

    parseThrowStatement() {
        this.markLocation();
        this.nextToken();
        let exp = this.parseExpression();
        let semicolonInserted = this.parseSemicolon();
        return {node: this.finishNode(new Ast.ThrowStatement(exp)), semicolonInserted};
    }

    parseTryStatement(context) {
        this.markLocation();
        this.nextToken();
        let block = this.parseBlock(context.retainLabelsOnly);
        let catchClauses = [];
        while (this.token.isKeyword('catch')) {
            this.markLocation();
            this.nextToken();
            this.expect(Token.LPAREN);
            let pattern = this.parseDestructuringPattern();
            this.expect(Token.RPAREN);
            let block = this.parseBlock(context.retainLabelsOnly);
            catchClauses.push(this.finishNode(new Ast.CatchClause(pattern, block)));
        }
        let finallyBlock = this.consumeKeyword('finally') ? this.parseBlock() : null;
        let node = this.finishNode(new Ast.TryStatement(block, catchClauses, finallyBlock));
        if (catchClauses.length == 0 && finallyBlock == null)
            this.syntaxError('tryStatementMustveAtLeast', node.span);
        return {node, semicolonInserted: true};
    }

    parseForStatement(context) {
        this.markLocation();
        this.nextToken();
        if (this.consumeContextKeyword('each')) {
            this.expect(Token.LPAREN);
            let left = this.parseOptSimpleVariableDeclaration(false);
            left = left || this.parseExpression(false, OperatorPrecedence.POSTFIX);
            this.expectKeyword('in');
            return this.parseForInStatement(context, false, left);
        }
        this.expect(Token.LPAREN);

        let initOrLeft = this.parseOptSimpleVariableDeclaration(false);
        initOrLeft = initOrLeft || this.parseOptExpression(false, OperatorPrecedence.POSTFIX);
        if (this.consumeKeyword('in'))
            return this.parseForInStatement(context, true, initOrLeft);
        if (initOrLeft instanceof Ast.Expression) initOrLeft = this.parseSubexpressions(initOrLeft, false);
        else initOrLeft = this.parseOptExpression(false);

        this.expect(Token.SEMICOLON);
        let test = this.token.type != Token.SEMICOLON ? this.parseExpression() : null;
        this.expect(Token.SEMICOLON);
        let update = this.token.type != Token.RPAREN ? this.parseExpression() : null;
        this.expect(Token.RPAREN);
        let bodyCtx = context.retainLabelsOnly;
        bodyCtx.inIterationStatement = true;
        let {node: body, semicolonInserted} = this.parseStatement(bodyCtx);
        return {node: this.finishNode(new Ast.ForStatement(initOrLeft, test, update, body)), semicolonInserted};
    }

    parseForInStatement(context, iteratesKeys, left) {
        // ensure there is only one binding and no initializer
        if (left instanceof Ast.SimpleVariableDeclaration && (left.bindings.length > 1 || left.bindings[0].init != null))
            this.syntaxError('malformedForInBinding', left.span);
        let right = this.parseExpression();
        this.expect(Token.RPAREN);
        let bodyCtx = context.retainLabelsOnly;
        bodyCtx.inIterationStatement = true;
        let {node: body, semicolonInserted} = this.parseStatement(bodyCtx);
        return {node: this.finishNode(new Ast.ForInStatement(iteratesKeys, left, right, body)), semicolonInserted};
    }

    parseSwitchStatement(context) {
        this.markLocation();
        this.nextToken();
        if (this.consumeContextKeyword('type')) return this.parseSwitchTypeStatement(context);
        this.expect(Token.LPAREN);
        let discriminant = this.parseExpression();
        this.expect(Token.RPAREN);
        this.expect(Token.LCURLY);
        let cases = [];
        let consequentContext = context.retainLabelsOnly;
        consequentContext.inSwitchStatement = true;
        casesLoop: while (this.token.type != Token.RCURLY) {
            if (this.token.isKeyword('case')) {
                this.markLocation();
                this.nextToken();
                let test = this.parseExpression(true, OperatorPrecedence.LIST, false);
                this.expect(Token.COLON);
                let consequent = [];
                while (!this.token.isKeyword('case') && !this.token.isKeyword('default')) {
                    let {node: stmt, semicolonInserted} = this.parseStatement(consequentContext);
                    consequent.push(stmt);
                    if (!semicolonInserted) break casesLoop;
                }
                cases.push(this.finishNode(new Ast.SwitchCase(test, consequent)));
            } else if (this.token.isKeyword('default')) {
                this.markLocation();
                this.nextToken();
                this.expect(Token.COLON);
                let consequent = [];
                while (!this.token.isKeyword('case') && !this.token.isKeyword('default')) {
                    let {node: stmt, semicolonInserted} = this.parseStatement(consequentContext);
                    consequent.push(stmt);
                    if (!semicolonInserted) break casesLoop;
                }
                cases.push(this.finishNode(new Ast.SwitchCase(null, consequent)));
            } else this.raiseUnexpected();
        }
        this.expect(Token.RCURLY);
        return {node: this.finishNode(new Ast.SwitchStatement(discriminant, cases)), semicolonInserted: true};
    }

    parseSwitchTypeStatement(context) {
        this.expect(Token.LPAREN);
        let discriminant = this.parseExpression();
        this.expect(Token.RPAREN);
        this.expect(Token.LCURLY);
        let cases = [];
        for (;;) {
            if (this.token.isKeyword('case')) {
                this.markLocation();
                this.nextToken();
                this.expect(Token.LPAREN);
                let pattern = this.parseDestructuringPattern();
                this.expect(Token.RPAREN);
                cases.push(this.finishNode(new Ast.SwitchTypeCase(pattern, this.parseBlock(context.retainLabelsOnly))));
            } else if (this.token.isKeyword('default')) {
                this.markLocation();
                this.nextToken();
                cases.push(this.finishNode(new Ast.SwitchTypeCase(null, this.parseBlock(context.retainLabelsOnly))));
            } else break;
        }
        this.expect(Token.RCURLY);
        return {node: this.finishNode(new Ast.SwitchTypeStatement(discriminant, cases)), semicolonInserted: true};
    }

    parseUseStatement(context) {
        this.markLocation();
        this.nextToken();
        if (this.consumeContextKeyword('resource')) {
            this.expect(Token.LPAREN);
            let bindings = [];
            do {
                if (this.token.type == Token.RPAREN) break;
                bindings.push(this.parseVariableBinding());
            } while (this.consume(Token.COMMA));
            this.expect(Token.RPAREN);
            let block = this.parseBlock(context.retainLabelsOnly);
            let semicolonInserted = true;
            return {node: this.finishNode(new Ast.UseResourceStatement(bindings, block)), semicolonInserted};
        } else {
            this.expectContextKeyword('namespace');
            let exp = this.parseExpression();
            let semicolonInserted = this.parseSemicolon();
            return {node: this.finishNode(new Ast.UseNamespaceStatement(exp)), semicolonInserted};
        }
    }

    parseWithStatement(context) {
        this.markLocation();
        this.nextToken();
        this.expect(Token.LPAREN);
        let object = this.parseExpression();
        this.expect(Token.RPAREN);
        let {node: body, semicolonInserted} = this.parseStatement(context.retainLabelsOnly);
        return {node: this.finishNode(new Ast.WithStatement(object, body)), semicolonInserted};
    }

    parseProgram() {
        this.markLocation();
        let packages = [];
        while (this.token.isKeyword('package')) {
            this.markLocation();
            this.nextToken();
            let id = [];
            if (this.consumeIdentifier()) {
                id.push(this.previousToken.stringValue);
                while (this.consume(Token.DOT))
                    id.push(this.expectIdentifier(true));
            }
            packages.push(this.finishNode(new Ast.PackageDefinition(id, this.parseBlock(new PackageContext))));
        }
        let statements = null;
        while (this.token.type != Token.EOF) {
            let {node: stmt, semicolonInserted} = this.parseStatement(new TopLevelContext);
            if (stmt) {
                statements = statements || [];
                statements.push(stmt);
            }
            if (!semicolonInserted) break;
        }
        if (this.token.type != Token.EOF) this.throwUnexpected();
        return this.finishNode(new Ast.Program(packages, statements));
    }
}

class StackFunction {
    usesAwait: boolean;
    usesYield: boolean;

    constructor() {
        this.usesAwait = false;
        this.usesYield = false;
    }
}

class DefinitionAttributes {
    decorators: null | Ast.Expression[];
    modifiers: Set<Ast.AnnotatableDefinitionModifier>;
    accessModifier: null | Ast.AnnotatableDefinitionAccessModifier;

    constructor() {
        this.decorators = null;
        this.modifiers = new Set;
        this.accessModifier = null;
    }

    get hasEmptyModifiers() {
        return this.accessModifier == null && this.modifiers.size == 0;
    }
}

class Context {
    inSwitchStatement: boolean = false;
    inIterationStatement: boolean = false;

    constructor() {
    }

    get retainLabelsOnly() {
        let r: Context | null = null;
        if (this instanceof LabeledStatementsContext) {
            r = new LabeledStatementsContext;
            (r as LabeledStatementsContext)._labels = new Set((this as LabeledStatementsContext)._labels);
        } else r = new Context;
        r.inSwitchStatement = this.inSwitchStatement;
        r.inIterationStatement = this.inIterationStatement;
        return r;
    }

    get name() {
        return '';
    }

    addLabel(label) {
        return new Context;
    }
    hasLabel(label) {
        return false;
    }

    get isConstructor() {
        return false;
    }
    set isConstructor(v) {
    }

    get superStatementFound() {
        return false;
    }
    set superStatementFound(v) {
    }
}

class LabeledStatementsContext extends Context {
    public _labels: Set<string>;

    constructor() {
        super();
        this._labels = new Set;
    }

    addLabel(label) {
        let r = new LabeledStatementsContext;
        r._labels = new Set(this._labels);
        r._labels.add(label);
        return r;
    }
    hasLabel(label) {
        return this._labels.has(label);
    }
}

class ConstructorContext extends Context {
    _isConstructor: boolean;
    _superStatementFound: boolean;

    constructor() {
        super();
        this._isConstructor = false;
        this._superStatementFound = false;
    }

    get isConstructor() {
        return this._isConstructor;
    }
    set isConstructor(v) {
        this._isConstructor = v;
    }

    get superStatementFound() {
        return this._superStatementFound;
    }
    set superStatementFound(v) {
        this._superStatementFound = v;
    }
}

class ClassContext extends Context {
    _name: string;

    constructor(name) {
        super();
        this._name = name;
    }

    get name() {
        return this._name;
    }
}

class EnumContext extends Context {
}

class InterfaceContext extends Context {
}

class NamespaceContext extends Context {
}

class PackageContext extends Context {
}

class TopLevelContext extends Context {
}