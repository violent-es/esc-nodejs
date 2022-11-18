import {Script, Operator} from 'com.violentes.esc.source-objects';
import {Ast, Parser} from '../src/index';
import * as assert from 'assert';

function parse(src: string, filePath = 'no-file'): Ast.Expression | null {
    let script = new Script(filePath, src);
    return new Parser(script).parseExpression();
}

// Ast.Identifier
{
    assert(parse('x') instanceof Ast.Identifier);
    assert(parse('#for') instanceof Ast.Identifier);
}
// Ast.ImportMetaExpression
{
    let e = parse('import.meta');
    assert(e instanceof Ast.ImportMetaExpression);
}
// Ast.EmbedExpression
{
    let e = parse('embed "./src.es"');
    assert(e instanceof Ast.EmbedExpression);
    assert(e.type == null);
}
// Ast.UnaryExpression
{
    assert(parse('!x') instanceof Ast.UnaryExpression);
    assert( parse('x!') instanceof Ast.UnaryExpression);
    assert((parse('x!') as Ast.UnaryExpression).operator == Operator.NON_NULL);
    assert((parse('++x') as Ast.UnaryExpression).operator == Operator.PRE_INCREMENT);
    assert((parse('x++') as Ast.UnaryExpression).operator == Operator.POST_INCREMENT);
}
// Ast.BinaryExpression
{
    assert( parse('x + y * z') instanceof Ast.BinaryExpression);
    assert((parse('x + y * z') as Ast.BinaryExpression).operator == Operator.ADD);
}
// Ast.TypeBinaryExpression
{
    assert( parse('o as T') instanceof Ast.TypeBinaryExpression);
    assert((parse('os as T') as Ast.TypeBinaryExpression).operator == Operator.AS);
    assert( parse('o as! T') instanceof Ast.TypeBinaryExpression);
    assert((parse('os as! T') as Ast.TypeBinaryExpression).operator == Operator.AS_STRICT);
}
// Ast.DefaultExpression
{
    assert(parse('default(T)') instanceof Ast.DefaultExpression);
}
// Ast.FunctionExpression
{
    let e: null | Ast.Expression = null;
    e = parse('function() {}');
    assert(e instanceof Ast.FunctionExpression);
    assert((e as Ast.FunctionExpression).common.body instanceof Ast.Block);
    e = parse('function() 10');
    assert(e instanceof Ast.FunctionExpression);
    assert((e as Ast.FunctionExpression).common.body instanceof Ast.NumericLiteral);
    e = parse('() -> 10');
    assert(e instanceof Ast.FunctionExpression);
    assert((e as Ast.FunctionExpression).common.body instanceof Ast.NumericLiteral);
}
// Ast.ObjectInitializer
{
    let e = parse('{x: 10, ...y, z,}');
    assert(e instanceof Ast.ObjectInitializer);
}
// Ast.ArrayInitializer
{
    let e = parse('[0, ...o,,,]');
    assert(e instanceof Ast.ArrayInitializer);
}
// Ast.NodeInitializer
{
    assert(parse('<E ta/>') instanceof Ast.NodeInitializer);
    assert(parse('<C></C>') instanceof Ast.NodeInitializer);
}
// Ast.NodeListInitializer
{
    assert(parse('<></>') instanceof Ast.NodeListInitializer);
}
// Ast.MemberExpression
{
    assert(parse('o.x') instanceof Ast.MemberExpression);
    assert(parse('o?.x') instanceof Ast.MemberExpression);
}
// Ast.IndexExpression
{
    assert(parse('o[k]') instanceof Ast.IndexExpression);
    assert(parse('o?.[k]') instanceof Ast.IndexExpression);
}
// Ast.CallExpression
{
    assert(parse('o()') instanceof Ast.CallExpression);
    assert(parse('o?.()') instanceof Ast.CallExpression);
}
// Ast.ThisLiteral
{
    assert(parse('this') instanceof Ast.ThisLiteral);
}
// Ast.StringLiteral
{
    assert(parse('""') instanceof Ast.StringLiteral);
}
// Ast.NullLiteral
{
    assert(parse('null') instanceof Ast.NullLiteral);
}
// Ast.BooleanLiteral
{
    assert(parse('false') instanceof Ast.BooleanLiteral);
    assert(parse('true') instanceof Ast.BooleanLiteral);
}
// Ast.NumericLiteral
{
    assert(parse('0') instanceof Ast.NumericLiteral);
}
// Ast.RegExpLiteral
{
    assert(parse('/./gi') instanceof Ast.RegExpLiteral);
}
// Ast.ConditionalExpression
{
    assert(parse('t ? c : a') instanceof Ast.ConditionalExpression);
}
// Ast.ParensExpression
{
    assert(parse('(x)') instanceof Ast.ParensExpression);
}
// Ast.ListExpression
{
    assert(parse('x, y') instanceof Ast.ListExpression);
}
// Ast.GenericInstantiationExpression
{
    assert(parse('o.<T>') instanceof Ast.GenericInstantiationExpression);
}
// Ast.AssignmentExpressionn
{
    assert(parse('l = r') instanceof Ast.AssignmentExpression);
    assert(parse('{} = v') instanceof Ast.AssignmentExpression);
    assert(parse('[] = v') instanceof Ast.AssignmentExpression);
}
// Ast.NewExpression
{
    assert(parse('new C') instanceof Ast.NewExpression);
    assert(parse('new C().x') instanceof Ast.MemberExpression);
}
// Ast.SuperExpression
{
    assert(parse('super') instanceof Ast.SuperExpression);
}