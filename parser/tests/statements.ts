import {Script, Operator} from 'com.violentes.esc.source-objects';
import {Ast, Parser} from '../src/index';
import * as assert from 'assert';

function parse(src: string, filePath = 'no-file'): Ast.Program | null {
    let script = new Script(filePath, src);
    return new Parser(script).parseProgram();
}

function parseStatement(src: string, filePath = 'no-file'): Ast.Statement | null {
    let script = new Script(filePath, src);
    return new Parser(script).parseStatement();
}

// Ast.NamespaceDefinition
{
    let p = parse('namespace O {}');
    let n = p != null && p.statements != null && p.statements[0] instanceof Ast.NamespaceDefinition ? p.statements[0] as Ast.NamespaceDefinition : null;
    assert(n != null);
}
// Ast.NamespaceAliasDefinition
{
    assert(parseStatement('namespace L = R;') instanceof Ast.NamespaceAliasDefinition);
}
// Ast.AnnotatableDefinition
{
    assert(parseStatement('[D] var l = r;') != null);
    assert(parseStatement('public static var l = r;') != null);
}
// Ast.VariableDefinition
{
    assert(parseStatement('var l = r;') instanceof Ast.VariableDefinition);
}
// Ast.FunctionDefinition
{
    assert(parseStatement('function f() 10;') instanceof Ast.FunctionDefinition);
}
// Ast.ConstructorDefinition
{
}
// Ast.ProxyDefinition
{
}
// Ast.GetterDefinition
{
    assert(parseStatement('function get x():Number 10;') instanceof Ast.GetterDefinition);
}
// Ast.SetterDefinition
{
    assert(parseStatement('function set x(v:Number) {}') instanceof Ast.SetterDefinition);
}
// Ast.ClassDefinition
{
    let p = parse('class C { function C() {} }');
    let c = p != null && p.statements != null && p.statements[0] instanceof Ast.ClassDefinition ? p.statements[0] as Ast.ClassDefinition : null;
    assert(c != null);
}
// Ast.InterfaceDefinition
{
    let p = parse('interface I {}');
    let i = p != null && p.statements != null && p.statements[0] instanceof Ast.InterfaceDefinition ? p.statements[0] as Ast.InterfaceDefinition : null;
    assert(i != null);
}
// Ast.EnumDefinition
{
    let p = parse('enum E {}');
    let e = p != null && p.statements != null && p.statements[0] instanceof Ast.EnumDefinition ? p.statements[0] as Ast.EnumDefinition : null;
    assert(e != null);
}
// Ast.TypeDefinition
{
    let p = parse('type L = R;');
    let t = p != null && p.statements != null && p.statements[0] instanceof Ast.TypeDefinition ? p.statements[0] as Ast.TypeDefinition : null;
    assert(t != null);
}
// Ast.ExpressionStatement
{
    assert(parseStatement('f();') instanceof Ast.ExpressionStatement);
}
// Ast.EmptyStatement
{
    assert(parseStatement(';') instanceof Ast.EmptyStatement);
}
// Ast.Block
{
    assert(parseStatement('{}') instanceof Ast.Block);
}
// Ast.SuperStatement
{
}
// Ast.ImportStatement
{
    assert(parseStatement('import p.*;') instanceof Ast.ImportStatement);
    assert(parseStatement('import p.**;') instanceof Ast.ImportStatement);
    assert(parseStatement('import p.x;') instanceof Ast.ImportStatement);
}
// Ast.IfStatement
{
    assert(parseStatement('if (1) c;') instanceof Ast.IfStatement);
    assert(parseStatement('if (1) c; else a') instanceof Ast.IfStatement);
}
// Ast.DoStatement
{
    assert(parseStatement('do {} while (Infinity)') instanceof Ast.DoStatement);
}
// Ast.WhileStatement
{
    assert(parseStatement('while (Infinity) ;') instanceof Ast.WhileStatement);
}
// Ast.BreakStatement
{
}
// Ast.ContinueStatement
{
}
// Ast.ReturnStatement
{
    assert(parseStatement('return;') instanceof Ast.ReturnStatement);
}
// Ast.ThrowStatement
{
    assert(parseStatement('throw e;') instanceof Ast.ThrowStatement);
}
// Ast.TryStatement
{
    assert(parseStatement('try {} catch(e) {}') instanceof Ast.TryStatement);
}
// Ast.LabeledStatement
{
    assert(parseStatement('l: for (;;) {}') instanceof Ast.LabeledStatement);
}
// Ast.ForStatement
{
    assert(parseStatement('for(;;);') instanceof Ast.ForStatement);
}
// Ast.ForInStatement
{
    assert(parseStatement('for (var k in o) ;') instanceof Ast.ForInStatement);
    assert(parseStatement('for each (var v in o) ;') instanceof Ast.ForInStatement);
}
// Ast.SwitchStatement
{
    assert(parseStatement('switch (0) {}') instanceof Ast.SwitchStatement);
}
// Ast.SwitchTypeStatement
{
    assert(parseStatement('switch type (0) {}') instanceof Ast.SwitchTypeStatement);
}
// Ast.UseNamespaceStatement
{
    assert(parseStatement('use namespace N;') instanceof Ast.UseNamespaceStatement);
}
// Ast.UseResourceStatement
{
    assert(parseStatement('use resource (x = y) {}') instanceof Ast.UseResourceStatement);
}
// Ast.WithStatement
{
    assert(parseStatement('with (o) {}') instanceof Ast.WithStatement);
}