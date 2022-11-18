import {Script} from 'com.violentes.esc.source-objects';
import {Ast, Parser} from '../src/index';
import * as assert from 'assert';

function parse(src: string, filePath = 'no-file'): Ast.TypeExpression | null {
    let script = new Script(filePath, src);
    return new Parser(script).parseTypeExpression();
}

// Ast.IdentifierTypeExpression
{
    let te = parse('Number');
    assert(te instanceof Ast.IdentifierTypeExpression);
    assert(te.name == 'Number');
}
// Ast.AnyTypeExpression
{
    let te = parse('*');
    assert(te instanceof Ast.AnyTypeExpression);
}
// Ast.VoidTypeExpression
{
    let te = parse('void');
    assert(te instanceof Ast.VoidTypeExpression);
}
// Ast.UndefinedTypeExpression
{
    let te = parse('undefined');
    assert(te instanceof Ast.UndefinedTypeExpression);
}
// Ast.NullTypeExpression
{
    let te = parse('null');
    assert(te instanceof Ast.NullTypeExpression);
}
// Ast.FunctionTypeExpression
{
    const assertEmptyToVoid = te => {
        assert(te instanceof Ast.FunctionTypeExpression);
        assert(te.params == null && te.optParams == null && te.restParam == null && te.returnType instanceof Ast.VoidTypeExpression);
    };
    assertEmptyToVoid(parse('function():void'));
    assertEmptyToVoid(parse('()->void'));
}
// Ast.ArrayTypeExpression
{
    let te = parse('[...Number]');
    assert(te instanceof Ast.ArrayTypeExpression);
    {
        let ate = te as Ast.ArrayTypeExpression;
        assert(ate.itemType instanceof Ast.IdentifierTypeExpression);
        assert((ate.itemType as Ast.IdentifierTypeExpression).name == 'Number');
    }
}
// Ast.TupleTypeExpression
{
    let te = parse('[String,Number]');
    assert(te instanceof Ast.TupleTypeExpression);
    {
        let tte = te as Ast.TupleTypeExpression;
        assert(tte.itemTypes.length == 2);
        assert(tte.itemTypes[0] instanceof Ast.IdentifierTypeExpression);
        assert(tte.itemTypes[0].name == 'String');
        assert(tte.itemTypes[1] instanceof Ast.IdentifierTypeExpression);
        assert(tte.itemTypes[1].name == 'Number');
    }
}
// Ast.RecordTypeExpression
{
    let te = parse('{x:Int,y:undefined|Int}');
    assert(te instanceof Ast.RecordTypeExpression);
    {
        let rte = te as Ast.RecordTypeExpression;
        assert(rte.fields.length == 2);
        assert(rte.fields[0] instanceof Ast.Identifier);
        assert(rte.fields[0].name == 'x');
        assert(rte.fields[1].type instanceof Ast.UnionTypeExpression);
        assert((rte.fields[1].type as Ast.UnionTypeExpression).types.length == 2);
    }
}
// Ast.ParensTypeExpression
{
    assert(parse('(T)') instanceof Ast.ParensTypeExpression);
}
// Ast.UnionTypeExpression
{
    assert(parse('X|Y') instanceof Ast.UnionTypeExpression);
    assert(parse('(X,Y)') instanceof Ast.UnionTypeExpression);
}
// Ast.MemberTypeExpression
{
    let te = parse('o.T');
    assert(te instanceof Ast.MemberTypeExpression);
    assert((te as Ast.MemberTypeExpression).base instanceof Ast.IdentifierTypeExpression);
    assert((te as Ast.MemberTypeExpression).base.name == 'o');
    assert((te as Ast.MemberTypeExpression).id.name == 'T');
}
// Ast.GenericInstantiationTypeExpression
{
    let te = parse('C.<P>');
    assert(te instanceof Ast.GenericInstantiationTypeExpression);
    let gite = te as Ast.GenericInstantiationTypeExpression;
    assert(gite.base instanceof Ast.IdentifierTypeExpression);
    assert(gite.base.name == 'C');
    assert(gite.argumentsList.length == 1);
    assert(gite.argumentsList[0] instanceof Ast.IdentifierTypeExpression);
}
// Ast.NullableTypeExpression
{
    let te = parse('T?');
    assert(te instanceof Ast.NullableTypeExpression);
    let nte = te as Ast.NullableTypeExpression;
    assert(nte.base instanceof Ast.IdentifierTypeExpression);
    assert(nte.base.name == 'T');
}
// Ast.NonNullableTypeExpression
{
    let te = parse('T!');
    assert(te instanceof Ast.NonNullableTypeExpression);
    let nte = te as Ast.NonNullableTypeExpression;
    assert(nte.base instanceof Ast.IdentifierTypeExpression);
    assert(nte.base.name == 'T');
}