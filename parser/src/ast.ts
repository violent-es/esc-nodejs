import type {Span, Script, Operator} from 'com.violentes.esc.source-objects';

export class Node {
    span: null | Span;

    constructor() {
        this.span = null;
    }

    get name() {
        return '';
    }
}

export class TypeExpression extends Node {
}

export class TypedTypeExpression extends TypeExpression {
    base: TypeExpression;
    type: TypeExpression;

    constructor(base, type) {
        super();
        this.base = base;
        this.type = type;
    }
}

export class IdentifierTypeExpression extends TypeExpression {
    private _name: string;

    constructor(name) {
        super();
        this._name = name;
    }

    override get name() {
        return this._name;
    }
}

/**
 * Member type expression.
 * - If the base is a package, then the member may be a subpackage. 
 */
export class MemberTypeExpression extends TypeExpression {
    base: TypeExpression;
    id: Identifier;

    constructor(base, id) {
        super();
        this.base = base;
        this.id = id;
    }
}

export class AnyTypeExpression extends TypeExpression {
}

export class VoidTypeExpression extends TypeExpression {
}

export class UndefinedTypeExpression extends TypeExpression {
}

export class NullTypeExpression extends TypeExpression {
}

export class FunctionTypeExpression extends TypeExpression {
    params: Identifier[] | null;
    optParams: Identifier[] | null;
    restParam: Identifier | null;
    returnType: TypeExpression | null;

    constructor(params, optParams, restParam, returnType) {
        super();
        this.params = params;
        this.optParams = optParams;
        this.restParam = restParam;
        /**
         * Return type. Omitting this should give
         * the type `*`.
         */
        this.returnType = returnType;
    }
}

export class ArrayTypeExpression extends TypeExpression {
    itemType: TypeExpression;

    constructor(itemType) {
        super();
        this.itemType = itemType;
    }
}

export class TupleTypeExpression extends TypeExpression {
    itemTypes: TypeExpression[];

    constructor(itemTypes) {
        super();
        this.itemTypes = itemTypes;
    }
}

export class RecordTypeExpression extends TypeExpression {
    fields: Identifier[];

    constructor(fields) {
        super();
        // these use Identifier node type
        this.fields = fields;
    }
}

export class UnionTypeExpression extends TypeExpression {
    types: TypeExpression[];

    constructor(types) {
        super();
        this.types = types;
    }
}

export class GenericInstantiationTypeExpression extends TypeExpression {
    base: TypeExpression;
    argumentsList: TypeExpression[];

    constructor(base, argumentsList) {
        super();
        this.base = base;
        this.argumentsList = argumentsList;
    }
}

export class NullableTypeExpression extends TypeExpression {
    base: TypeExpression;

    constructor(base) {
        super();
        this.base = base;
    }
}

export class NonNullableTypeExpression extends TypeExpression {
    base: TypeExpression;

    constructor(base) {
        super();
        this.base = base;
    }
}

export class ParensTypeExpression extends TypeExpression {
    base: TypeExpression;

    constructor(base) {
        super();
        this.base = base;
    }
}

export class DestructuringPattern extends Node {
    type: TypeExpression;

    constructor(type) {
        super();
        this.type = type;
    }
}

export class NonDestructuringPattern extends DestructuringPattern {
    private _name: string;

    constructor(name, type) {
        super(type);
        this._name = name;
    }

    override get name() {
        return this._name;
    }
}

export class ObjectDestructuringPattern extends DestructuringPattern {
    fields: ObjectDestructuringPatternField[];

    constructor(fields, type) {
        super(type);
        this.fields = fields;
    }
}

export class ObjectDestructuringPatternField extends Node {
    key: Expression;
    subpattern: DestructuringPattern | null;

    constructor(key, subpattern) {
        super();
        /**
         * @type {Expression}
         */
        this.key = key;
        /**
         * Optional pattern.
         */
        this.subpattern = subpattern;
    }
}

export class ArrayDestructuringPattern extends DestructuringPattern {
    items: (null | DestructuringPattern | ArrayDestructuringSpread)[];

    constructor(items, type) {
        super(type);
        /**
         * `null` (ellision), `DestructuringPattern` and `ArrayDestructuringSpread`.
         */
        this.items = items;
    }
}

export class ArrayDestructuringSpread extends Node {
    pattern: DestructuringPattern;

    constructor(pattern) {
        super();
        this.pattern = pattern;
    }
}

export class VariableBinding extends Node {
    pattern: DestructuringPattern;
    init: null | Expression;

    constructor(pattern, init) {
        super();
        this.pattern = pattern;
        /**
         * Optional expression.
         */
        this.init = init;
    }
}

export class Expression extends Node {
}

export class Identifier extends Expression {
    private _name: string;
    type: TypeExpression | null;

    constructor(name, type = null) {
        super();
        this._name = name;
        this.type = type;
    }

    override get name() {
        return this._name;
    }
}

export class EmbedExpression extends Expression {
    src: string;
    type: TypeExpression | null;

    constructor(src, type) {
        super();
        this.src = src;
        /**
         * Optional type annotation.
         */
        this.type = type;
    }
}

export class UnaryExpression extends Expression {
    operator: Operator;
    operand: Expression;

    constructor(operator, operand) {
        super();
        this.operator = operator;
        this.operand = operand;
    }
}

export class BinaryExpression extends Expression {
    operator: Operator;
    left: Expression;
    right: Expression;

    constructor(operator, left, right) {
        super();
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

export class TypeBinaryExpression extends Expression {
    operator: Operator;
    left: Expression;
    right: TypeExpression;

    constructor(operator, left, right) {
        super();
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

export class DefaultExpression extends Expression {
    type: TypeExpression;

    constructor(type) {
        super();
        this.type = type;
    }
}

export class FunctionExpression extends Expression {
    id: Identifier | null;
    common: FunctionCommon;

    constructor(id, common) {
        super();
        /**
         * Optional identifier.
         */
        this.id = id;
        this.common = common;
    }
}

export class ObjectInitializer extends Expression {
    fields: (Spread | ObjectField)[];
    type: TypeExpression | null;

    constructor(fields, type) {
        super();
        /**
         * List of `ObjectField` and `Spread`.
         */
        this.fields = fields;
        this.type = type;
    }
}

export class ObjectField extends Node {
    key: Expression;
    value: Expression | null;

    constructor(key, value) {
        super();
        /**
         * Field key. If source was a valid identifier,
         * it is constructed as a `StringLiteral` node.
         */
        this.key = key;
        /**
         * Optional for shorthand fields.
         */
        this.value = value;
    }
}

export class Spread extends Expression {
    expression: Expression;

    constructor(expression) {
        super();
        this.expression = expression;
    }
}

export class ArrayInitializer extends Expression {
    items: (null | Expression | Spread)[];
    type: TypeExpression | null;

    constructor(items, type) {
        super();
        /**
         * List of `null` (ellision), `Expression` and `Spread`.
         */
        this.items = items;
        this.type = type;
    }
}

export class NodeListInitializer extends Expression {
    /**
     * Child nodes and `Spread`s with curly brackets.
     */
    children: Expression[];

    constructor(children) {
        super();
        this.children = children;
    }
}

export class NodeInitializer extends Expression {
    nsId: Expression | null;
    id: Expression;
    attributes: NodeAttribute[];
    /**
     * `null` if node is empty. Contains child node initializers
     * and `Spread`s with curly brackets.
     */
    children: Expression[] | null;

    constructor(id, attributes, children) {
        super();
        this.id = id;
        this.attributes = attributes;
        this.children = children;
    }
}

export class NodeAttribute extends Node {
    id: Identifier;
    /**
     * Attribute value. If `null`,
     * this is equivalent to `attrib={true}`.
     */
    value: Expression | null;

    constructor(id, value) {
        super();
        this.id = id;
        this.value = value;
    }
}

/**
 * Member expression.
 * - If the base is a package, then the member may be a subpackage. 
 */
export class MemberExpression extends Expression {
    base: Expression;
    id: Identifier;
    optional: boolean;

    constructor(base, id, optional = false) {
        super();
        this.base = base;
        /**
         * @type `Identifier`
         */
        this.id = id;
        /**
         * @type {boolean}
         */
        this.optional = optional;
    }
}

export class IndexExpression extends Expression {
    base: Expression;
    key: Expression;
    optional: boolean;

    constructor(base, key, optional = false) {
        super();
        this.base = base;
        /**
         * @type `Expression`
         */
        this.key = key;
        /**
         * @type {boolean}
         */
        this.optional = optional;
    }
}

export class CallExpression extends Expression {
    base: Expression;
    argumentsList: Expression[];
    optional: boolean;

    constructor(base, argumentsList, optional = false) {
        super();
        this.base = base;
        this.argumentsList = argumentsList;
        /**
         * @type {boolean}
         */
        this.optional = optional;
    }
}

export class ImportMetaExpression extends Expression {
}

export class ThisLiteral extends Expression {
}

export class StringLiteral extends Expression {
    value: string;

    constructor(value) {
        super();
        this.value = value;
    }
}

export class NullLiteral extends Expression {
}

export class BooleanLiteral extends Expression {
    value: boolean;

    constructor(value) {
        super();
        this.value = value;
    }
}

export class NumericLiteral extends Expression {
    value: number;

    constructor(value) {
        super();
        this.value = value;
    }
}

export class RegExpLiteral extends Expression {
    body: string;
    flags: string;

    constructor(body, flags) {
        super();
        this.body = body;
        this.flags = flags;
    }
}

export class ConditionalExpression extends Expression {
    test: Expression;
    consequent: Expression;
    alternative: Expression;

    constructor(test, consequent, alternative) {
        super();
        this.test = test;
        this.consequent = consequent;
        this.alternative = alternative;
    }
}

export class ParensExpression extends Expression {
    expression: Expression;

    constructor(expression) {
        super();
        this.expression = expression;
    }
}

export class ListExpression extends Expression {
    expressions: Expression[];

    constructor(expressions) {
        super();
        this.expressions = expressions;
    }
}

export class GenericInstantiationExpression extends Expression {
    base: Expression;
    argumentsList: TypeExpression[];

    constructor(base, argumentsList) {
        super();
        this.base = base;
        this.argumentsList = argumentsList;
    }
}

export class AssignmentExpression extends Expression {
    /**
     * Left. This is never a `NonDestructuringPattern` node.
     */
    left: DestructuringPattern | Expression;
    /**
     * Compound operator kind. Always `null`
     * if left reference is a destructuring pattern.
     */
    compound: Operator | null;
    right: Expression;

    constructor(left, compound, right) {
        super();
        this.left = left;
        this.compound = compound;
        this.right = right;
    }
}

export class NewExpression extends Expression {
    base: Expression;
    argumentsList: Expression[];

    constructor(base, argumentsList) {
        super();
        this.base = base;
        this.argumentsList = argumentsList || [];
    }
}

export class SuperExpression extends Expression {
}

export class Program extends Node {
    packages: PackageDefinition[];
    statements: Statement[] | null;

    constructor(packages, statements) {
        super();
        this.packages = packages;
        /**
         * Optional list of statements, possibly `null`.
         */
        this.statements = statements;
    }
}

export class PackageDefinition extends Node {
    id: string[];
    block: Block;

    constructor(id, block) {
        super();
        /**
         * List of String, possibly empty for `package {}`.
         */
        this.id = id;
        this.block = block;
    }
}

export class Statement extends Node {
}

export class AnnotatableDefinition extends Statement {
    decorators: null | Expression[];
    modifiers: Set<AnnotatableDefinitionModifier>;
    accessModifier: null | AnnotatableDefinitionAccessModifier;

    constructor() {
        super();
        /**
         * Optional list of `Expression`.
         */
        this.decorators = null;
        /**
         * Set of `AnnotatableDefinitionModifier`.
         */
        this.modifiers = new Set;
        /**
         * Optional `AnnotatableDefinitionAccessModifier`.
         */
        this.accessModifier = null;
    }
}

export class AnnotatableDefinitionModifier {
    static FINAL = new AnnotatableDefinitionModifier('final');
    static NATIVE = new AnnotatableDefinitionModifier('native');
    static OVERRIDE = new AnnotatableDefinitionModifier('override');
    static PROXY = new AnnotatableDefinitionModifier('proxy');
    static STATIC = new AnnotatableDefinitionModifier('static');

    private _s: string;

    constructor(s) {
        this._s = s;
    }

    toString() {
        return this._s;
    }
}

export class AnnotatableDefinitionAccessModifier {
    static PUBLIC = new AnnotatableDefinitionAccessModifier('public');
    static PRIVATE = new AnnotatableDefinitionAccessModifier('private');
    static PROTECTED = new AnnotatableDefinitionAccessModifier('protected');
    static INTERNAL = new AnnotatableDefinitionAccessModifier('internal');

    private _s: string;

    constructor(s) {
        this._s = s;
    }

    toString() {
        return this._s;
    }
}

export class NamespaceDefinition extends AnnotatableDefinition {
    id: Identifier;
    block: Block;

    constructor(id, block) {
        super();
        this.id = id;
        this.block = block;
    }
}

export class NamespaceAliasDefinition extends AnnotatableDefinition {
    id: Identifier;
    expression: Expression;

    constructor(id, expression) {
        super();
        this.id = id;
        this.expression = expression;
    }
}

export class VariableDefinition extends AnnotatableDefinition {
    readOnly: boolean;
    bindings: VariableBinding[];

    constructor(readOnly, bindings) {
        super();
        this.readOnly = readOnly;
        this.bindings = bindings;
    }
}

export class FunctionDefinition extends AnnotatableDefinition {
    id: Identifier;
    generics: null | Generics;
    common: FunctionCommon;

    constructor(id, generics, common) {
        super();
        this.id = id;
        this.generics = generics;
        this.common = common;
    }
}

export class ConstructorDefinition extends AnnotatableDefinition {
    id: Identifier;
    common: FunctionCommon;

    constructor(id, common) {
        super();
        this.id = id;
        this.common = common;
    }
}

export class GetterDefinition extends AnnotatableDefinition {
    id: Identifier;
    common: FunctionCommon;

    constructor(id, common) {
        super();
        this.id = id;
        this.common = common;
    }
}

export class SetterDefinition extends AnnotatableDefinition {
    id: Identifier;
    common: FunctionCommon;

    constructor(id, common) {
        super();
        this.id = id;
        this.common = common;
    }
}

export class ProxyDefinition extends AnnotatableDefinition {
    id: Identifier;
    operator: Operator;
    common: FunctionCommon;

    constructor(id, operator, common) {
        super();
        this.id = id;
        /**
         * Operator.
         * - For `proxy function has()`, this property is set to
         * `Operator.IN`.
         */
        this.operator = operator;
        this.common = common;
    }
}

export class FunctionCommon extends Node {
    usesAwait: boolean;
    usesYield: boolean;
    params: null | VariableBinding[];
    optParams: null | VariableBinding[];
    restParam: null | VariableBinding;
    returnType: null | TypeExpression;
    throwsType: null | TypeExpression;
    body: null | Node;

    constructor(usesAwait, usesYield, params, optParams, restParam, returnType, throwsType, body) {
        super();
        this.usesAwait = usesAwait;
        this.usesYield = usesYield;
        /**
         * List of `VariableBinding`.
         */
        this.params = params;
        /**
         * List of `VariableBinding`.
         */
        this.optParams = optParams;
        /**
         * Optional `VariableBinding`.
         */
        this.restParam = restParam;
        this.returnType = returnType;
        this.throwsType = throwsType;
        this.body = body;
    }
}

export class ClassDefinition extends AnnotatableDefinition {
    id: Identifier;
    isValue: boolean;
    isAlgebraic: boolean;
    generics: null | Generics;
    extendsType: null | TypeExpression;
    implementsList: null | TypeExpression[];
    block: Block;

    constructor(id, isValue, isAlgebraic, generics, extendsType, implementsList, block) {
        super();
        this.id = id;
        this.isValue = isValue;
        this.isAlgebraic = isAlgebraic;
        this.generics = generics;
        this.extendsType = extendsType;
        this.implementsList = implementsList;
        this.block = block;
    }
}

export class InterfaceDefinition extends AnnotatableDefinition {
    id: Identifier;
    generics: null | Generics;
    extendsList: null | TypeExpression[];
    block: Block;

    constructor(id, generics, extendsList, block) {
        super();
        this.id = id;
        this.generics = generics;
        this.extendsList = extendsList;
        this.block = block;
    }
}

export class EnumDefinition extends AnnotatableDefinition {
    id: Identifier;
    isFlags: boolean;
    numericType: null | TypeExpression;
    block: Block;

    constructor(id, isFlags, numericType, block) {
        super();
        this.id = id;
        this.isFlags = isFlags;
        this.numericType = numericType;
        this.block = block;
    }
}

export class TypeDefinition extends AnnotatableDefinition {
    id: Identifier;
    generics: null | Generics;
    type: TypeExpression;

    constructor(id, generics, type) {
        super();
        this.id = id;
        this.generics = generics;
        this.type = type;
    }
}

/**
 * Covers the generic parts of a declaration. This includes both
 * the nodes that declare type parameters and the nodes that specify
 * bounds.
 */
export class Generics extends Node {
    params: GenericTypeParameter[];
    bounds: null | GenericTypeParameterBound[];

    constructor(params) {
        super();
        /**
         * List of `GenericTypeParameter`.
         */
        this.params = params;
    }
}

export class GenericTypeParameter extends Node {
    id: Identifier;

    constructor(id) {
        super();
        this.id = id;
    }
}

export class GenericTypeParameterBound extends Node {
}

/**
 * Node for the clause `where T is B`.
 */
export class GenericTypeParameterIsBound extends GenericTypeParameterBound {
    id: Identifier;
    type: TypeExpression;

    constructor(id, type) {
        super();
        this.id = id;
        this.type = type;
    }
}

export class ExpressionStatement extends Statement {
    expression: Statement;

    constructor(expression) {
        super();
        this.expression = expression;
    }
}

export class EmptyStatement extends Statement {
}

export class Block extends Statement {
    statements: Statement[];

    constructor(statements) {
        super();
        this.statements = statements;
    }
}

export class SuperStatement extends Statement {
    argumentsList: Expression[];

    constructor(argumentsList) {
        super();
        this.argumentsList = argumentsList;
    }
}

export class ImportStatement extends Statement {
    alias: Identifier | null;
    importName: Identifier[];
    wildcard: boolean;
    recursive: boolean;

    constructor(alias, importName, wildcard, recursive) {
        super();
        /**
         * Optional.
         */
        this.alias = alias;
        this.importName = importName;
        this.wildcard = wildcard;
        this.recursive = recursive;
    }
}

export class IfStatement extends Statement {
    test: Expression;
    consequent: Statement;
    alternative: null | Statement;

    constructor(test, consequent, alternative) {
        super();
        this.test = test;
        this.consequent = consequent;
        this.alternative = alternative;
    }
}

export class DoStatement extends Statement {
    body: Statement;
    test: Expression;

    constructor(body, test) {
        super();
        this.body = body;
        this.test = test;
    }
}

export class WhileStatement extends Statement {
    test: Expression;
    body: Statement;

    constructor(test, body) {
        super();
        this.test = test;
        this.body = body;
    }
}

export class BreakStatement extends Statement {
    label: null | string;

    constructor(label) {
        super();
        this.label = label;
    }
}

export class ContinueStatement extends Statement {
    label: null | string;

    constructor(label) {
        super();
        this.label = label;
    }
}

export class ReturnStatement extends Statement {
    expression: Expression;

    constructor(expression) {
        super();
        this.expression = expression;
    }
}

export class ThrowStatement extends Statement {
    expression: Expression;

    constructor(expression) {
        super();
        this.expression = expression;
    }
}

export class TryStatement extends Statement {
    block: Block;
    catchClauses: CatchClause[];
    finallyBlock: null | Block;

    constructor(block, catchClauses, finallyBlock) {
        super();
        this.block = block;
        this.catchClauses = catchClauses;
        this.finallyBlock = finallyBlock;
    }
}

export class CatchClause extends Node {
    pattern: DestructuringPattern;
    block: Block;

    constructor(pattern, block) {
        super();
        this.pattern = pattern;
        this.block = block;
    }
}

export class LabeledStatement extends Statement {
    label: string;
    statement: Statement;

    constructor(label, statement) {
        super();
        this.label = label;
        this.statement = statement;
    }
}

export class ForStatement extends Statement {
    init: null | Expression | SimpleVariableDeclaration;
    test: null | Expression;
    update: null | Expression;
    body: Statement;

    constructor(init, test, update, body) {
        super();
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
}

export class ForInStatement extends Statement {
    iteratesKeys: boolean;
    left: Expression | SimpleVariableDeclaration;
    right: Expression;
    body: Statement;

    constructor(iteratesKeys, left, right, body) {
        super();
        this.iteratesKeys = iteratesKeys;
        this.left = left;
        this.right = right;
        this.body = body;
    }
}

export class SimpleVariableDeclaration extends Node {
    readOnly: boolean;
    bindings: VariableBinding[];

    constructor(readOnly, bindings) {
        super();
        this.readOnly = readOnly;
        this.bindings = bindings;
    }
}

export class SwitchStatement extends Statement {
    discriminant: Expression;
    cases: SwitchCase[];

    constructor(discriminant, cases) {
        super();
        this.discriminant = discriminant;
        this.cases = cases;
    }
}

export class SwitchCase extends Statement {
    test: null | Expression;
    consequent: Statement[];

    constructor(test, consequent) {
        super();
        /**
         * Optional.
         */
        this.test = test;
        this.consequent = consequent;
    }
}

export class SwitchTypeStatement extends Statement {
    discriminant: Expression;
    cases: SwitchTypeCase[];

    constructor(discriminant, cases) {
        super();
        this.discriminant = discriminant;
        this.cases = cases;
    }
}

export class SwitchTypeCase extends Statement {
    pattern: null | DestructuringPattern;
    block: Block;

    constructor(pattern, block) {
        super();
        /**
         * Optional pattern. If `null`, this is a
         * `default` case.
         */
        this.pattern = pattern;
        this.block = block;
    }
}

export class IncludeStatement extends Statement {
    src: string;
    childScript: Script | null;
    childStatements: Statement[];

    constructor(src) {
        super();
        this.src = src;
        this.childScript = null;
        this.childStatements = [];
    }
}

export class UseNamespaceStatement extends Statement {
    expression: Expression;

    constructor(expression) {
        super();
        this.expression = expression;
    }
}

export class UseResourceStatement extends Statement {
    bindings: VariableBinding[];
    block: Block;

    constructor(bindings, block) {
        super();
        this.bindings = bindings;
        this.block = block;
    }
}

export class WithStatement extends Statement {
    object: Expression;
    body: Statement;

    constructor(object, body) {
        super();
        this.object = object;
        this.body = body;
    }
}