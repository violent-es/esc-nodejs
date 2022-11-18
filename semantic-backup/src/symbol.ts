import {Operator} from 'com.violentes.esc.source-objects';
import {Byte, Short, Int, Long} from './numeric-types';

export type RestParameter = {name: string, type: Symbol};

export class Symbol {
    pool: null | SymbolPool = null;

    get isTargetAndValuePair(): boolean { return false; }
    get isUndefinedConstant(): boolean { return false; }
    get isNullConstant(): boolean { return false; }
    get isStringConstant(): boolean { return false; }
    get isBooleanConstant(): boolean { return false; }
    get isNumberConstant(): boolean { return false; }
    get isDecimalConstant(): boolean { return false; }
    get isByteConstant(): boolean { return false; }
    get isShortConstant(): boolean { return false; }
    get isIntConstant(): boolean { return false; }
    get isLongConstant(): boolean { return false; }
    get isBigIntConstant(): boolean { return false; }
    get isConversionValue(): boolean { return false; }
    get isReferenceValue(): boolean { return false; }
    get isReferenceValueOfPossiblyUndefinedObject(): boolean { return false; }
    get isReferenceValueOfPossiblyNullObject(): boolean { return false; }
    get isReferenceValueOfPossiblyUndefinedOrNullObject(): boolean { return false; }
    get isThisObject(): boolean { return false; }
    get isTypeStaticThisObject(): boolean { return false; }
    get isTypeStaticReferenceValue(): boolean { return false; }
    get isIndexReferenceValue(): boolean { return false; }
    get isDynamicReferenceValue(): boolean { return false; }
    get isFunctionExpValue(): boolean { return false; }
    get isAlias(): boolean { return false; }
    get isDelegate(): boolean { return false; }
    get isType(): boolean { return false; }
    get isAnyType(): boolean { return false; }
    get isUndefinedType(): boolean { return false; }
    get isNullType(): boolean { return false; }
    get isClassType(): boolean { return false; }
    get isEnumType(): boolean { return false; }
    get isInterfaceType(): boolean { return false; }
    get isTupleType(): boolean { return false; }
    get isRecordType(): boolean { return false; }
    get isUnionType(): boolean { return false; }
    get isFunctionType(): boolean { return false; }
    get isInstantiatedType(): boolean { return false; }
    get isTypeParameterType(): boolean { return false; }
    get isFrame(): boolean { return false; }
    get isActivation(): boolean { return false; }
    get isClassFrame(): boolean { return false; }
    get isEnumFrame(): boolean { return false; }
    get isInterfaceFrame(): boolean { return false; }
    get isNamespaceFrame(): boolean { return false; }
    get isPackageFrame(): boolean { return false; }
    get isWithFrame(): boolean { return false; }
    get isNamespace(): boolean { return false; }
    get isPackage(): boolean { return false; }
    get isVariableSlot(): boolean { return false; }
    get isVirtualSlot(): boolean { return false; }
    get isMethodSlot(): boolean { return false; }
    get isAmbiguousReferenceError(): boolean { return false; }

    get isInstantiated(): boolean { return false; }

    get fullName(): string {
        let p = this.parentDefinition;
        return (p == null ? '' : p.fullName + '.') + this.name;
    }

    get parentDefinition(): null | Symbol {
        return null;
    }

    get originalDefinition(): null | Symbol {
        return null;
    }

    get numericType(): null | Symbol {
        return null;
    }

    get wrapsType(): null | Symbol {
        return null;
    }

    get associatedType(): null | Symbol {
        return null;
    }

    get aliasedSymbol(): null | Symbol {
        return null;
    }

    get subpackages(): Map<string, Symbol> {
        return new Map;
    }

    get name(): string {
        return '';
    }

    get names(): null | Names {
        return null;
    }

    get proxies(): Map<Operator, Symbol> {
        return new Map;
    }

    get includesUndefined(): boolean {
        return false;
    }

    get includesNull(): boolean {
        return false;
    }

    get staticType(): null | Symbol {
        return null;
    }

    get initValue(): null | Symbol {
        return null;
    }

    get readOnly(): boolean {
        return true;
    }

    get writeOnly(): boolean {
        return false;
    }

    get superType(): null | Symbol {
        return null;
    }

    get superTypes(): Symbol[] {
        return [];
    }

    get isValueClass(): boolean {
        return false;
    }

    get isAlgebraicClass(): boolean {
        return false;
    }

    get isFlagsEnum(): boolean {
        return false;
    }

    get enumVariants(): Map<string, any> {
        return new Map;
    }

    get implementsInterfaces(): null | Symbol[] {
        return null;
    }

    get constructorDefinition(): null | Symbol {
        return null;
    }

    get typeStaticThisType(): null | Symbol {
        return null;
    }

    get typeParameters(): null | Symbol[] {
        return null;
    }

    get argumentTypes(): null | Symbol[] {
        return null;
    }

    get tupleElementTypes(): Symbol[] {
        return [];
    }

    get unionMemberTypes(): Symbol[] {
        return [];
    }

    get functionRequiredParameters(): null | Names {
        return null;
    }

    get functionOptParameters(): null | Names {
        return null;
    }

    get functionRestParameter(): null | RestParameter {
        return null;
    }

    get functionReturnType(): null | Symbol {
        return null;
    }

    get functionThrowsType(): null | Symbol {
        return null;
    }

    get shadowFrame(): null | Symbol {
        return null;
    }

    get getter(): null | Symbol {
        return null;
    }

    set getter(v: Symbol) {
    }

    get setter(): null | Symbol {
        return null;
    }

    set setter(v: Symbol) {
    }

    get usesYield(): boolean {
        return false;
    }

    set usesYield(v: boolean) {
    }

    get usesAwait(): boolean {
        return false;
    }

    set usesAwait(v: boolean) {
    }

    get hasOverrideModifier(): boolean {
        return false;
    }

    set hasOverrideModifier(v: boolean) {
    }

    get isFinal(): boolean {
        return false;
    }

    set isFinal(v: boolean) {
    }

    get isNative(): boolean {
        return false;
    }

    set isNative(v: boolean) {
    }

    get numberValue(): number {
        return 0;
    }

    get byteValue(): Byte {
        return new Byte(0);
    }

    get shortValue(): Short {
        return new Short(0);
    }

    get intValue(): Int {
        return new Int(0);
    }

    get longValue(): Long {
        return new Long(0n);
    }

    get bigIntValue(): bigint {
        return 0n;
    }

    get stringValue(): string {
        return '';
    }

    get booleanValue(): boolean {
        return false;
    }

    get partOfAlgebraicType(): null | Symbol {
        return null;
    }

    get algebraicTypeVariants(): Symbol[] {
        return [];
    }

    get propertyDefinedByType(): null | Symbol {
        return null;
    }

    get conversionTargetType(): Symbol {
        return null;
    }

    get conversionFromTo(): null | ConversionFromTo {
        return null;
    }

    get conversionIsExplicit(): boolean {
        return false;
    }

    get conversionIsOptional(): boolean {
        return false;
    }

    get defaultValue(): null | Symbol {
        return null;
    }

    get base(): null | Symbol {
        return null;
    }

    set base(v: null | Symbol) {
    }

    get property(): Symbol | null {
        return null;
    }

    get openedNamespaces(): Set<Symbol> {
        return new Set;
    }

    get extendedLifeVariables(): Set<Symbol> {
        return new Set;
    }

    isSubtypeOf(type: Symbol): boolean {
        return false;
    }

    replaceTypeParameters(newMapping: Map<Symbol, Symbol>): Symbol {
        return this;
    }

    resolveName(name: string): null | Symbol {
        return null;
    }

    resolveOrInheritName(name: string): null | Symbol {
        return null;
    }

    resolveOrInheritProxy(operator: Operator): null | Symbol {
        return null;
    }
}

export class SymbolPool {
    public globalPackage: Symbol | null = null;
    public anyType: Symbol | null = null;
    public undefinedType: Symbol | null = null;
    public nullType: Symbol | null = null;
    public objectType: Symbol | null = null;
    public stringType: Symbol | null = null;
    public booleanType: Symbol | null = null;
    public numberType: Symbol | null = null;
    public decimalType: Symbol | null = null;
    public byteType: Symbol | null = null;
    public shortType: Symbol | null = null;
    public intType: Symbol | null = null;
    public longType: Symbol | null = null;
    public bigIntType: Symbol | null = null;
    public iteratorType: Symbol | null = null;
    public functionType: Symbol | null = null;
    public arrayType: Symbol | null = null;
    public mapType: Symbol | null = null;
    public setType: Symbol | null = null;
    public promiseType: Symbol | null = null;
    public generatorType: Symbol | null = null;
    public classType: Symbol | null = null;
    public byteArrayType: Symbol | null = null;
    public regExpType: Symbol | null = null;
    public metaDataType: Symbol | null = null;
    public boxedType: Symbol | null = null;
    public xmlContainerType: Symbol | null = null;
    public iDisposableType: Symbol | null = null;

    constructor() {
    }
}

export class SymbolFactory {
    private pool: SymbolPool;

    constructor(pool: SymbolPool) {
        this.pool = pool;
    }

    createTargetAndValuePair(target: Symbol, value: Symbol | null): Symbol {
        let r = new TargetAndValuePair(target, value);
        r.pool = this.pool;
        return r;
    }

    createUndefinedConstant(type: Symbol | null = null): Symbol {
        let r = new UndefinedConstant;
        r.pool = this.pool;
        r.staticType = type || this.pool.undefinedType;
        return r;
    }

    createNullConstant(type: Symbol | null = null): Symbol {
        let r = new NullConstant;
        r.pool = this.pool;
        r.staticType = type || this.pool.nullType;
        return r;
    }

    createStringConstant(value: string, type: Symbol | null = null): Symbol {
        let r = new StringConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.stringType;
        return r;
    }

    createBooleanConstant(value: boolean, type: Symbol | null = null): Symbol {
        let r = new BooleanConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.booleanType;
        return r;
    }

    createNumberConstant(value: number, type: Symbol | null = null): Symbol {
        let r = new NumberConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.numberType;
        return r;
    }

    createByteConstant(value: Byte, type: Symbol | null = null): Symbol {
        let r = new ByteConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.byteType;
        return r;
    }

    createShortConstant(value: Short, type: Symbol | null = null): Symbol {
        let r = new ShortConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.shortType;
        return r;
    }

    createIntConstant(value: Int, type: Symbol | null = null): Symbol {
        let r = new IntConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.intType;
        return r;
    }

    createLongConstant(value: Long, type: Symbol | null = null): Symbol {
        let r = new LongConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.longType;
        return r;
    }

    createBigIntConstant(value: bigint, type: Symbol | null = null): Symbol {
        let r = new BigIntConstant(value);
        r.pool = this.pool;
        r.staticType = type || this.pool.bigIntType;
        return r;
    }

    createConversionValue(conversionFromTo: ConversionFromTo, conversionIsExplicit: boolean, conversionIsOptional: boolean, conversionTargetType: Symbol, type: Symbol): Symbol {
        let r = new ConversionValue(conversionFromTo, conversionIsExplicit, conversionIsOptional, conversionTargetType);
        r.pool = this.pool;
        r.staticType = type;
        return r;
    }

    createReferenceValue(base: Symbol, property: Symbol, propertyDefinedByType: Symbol, type: Symbol | null = null): Symbol {
        if (property.isType || property.isNamespace)
            return property;
        let r = new ReferenceValue(base, property, propertyDefinedByType);
        r.pool = this.pool;
        r.staticType = type || property.staticType;
        return r;
    }

    createReferenceValueOfPossiblyUndefinedObject(base: Symbol, property: Symbol, propertyDefinedByType: Symbol, type: Symbol | null = null): Symbol {
        let r = new ReferenceValueOfPossiblyUndefinedObject(base, property, propertyDefinedByType);
        r.pool = this.pool;
        r.staticType = type || property.staticType;
        return r;
    }

    createReferenceValueOfPossiblyNullObject(base: Symbol, property: Symbol, propertyDefinedByType: Symbol, type: Symbol | null = null): Symbol {
        let r = new ReferenceValueOfPossiblyNullObject(base, property, propertyDefinedByType);
        r.pool = this.pool;
        r.staticType = type || property.staticType;
        return r;
    }

    createReferenceValueOfPossiblyUndefinedOrNullObject(base: Symbol, property: Symbol, propertyDefinedByType: Symbol, type: Symbol | null = null): Symbol {
        let r = new ReferenceValueOfPossiblyUndefinedOrNullObject(base, property, propertyDefinedByType);
        r.pool = this.pool;
        r.staticType = type || property.staticType;
        return r;
    }

    createThisObject(type: Symbol): Symbol {
        let r = new ThisObject;
        r.pool = this.pool;
        r.staticType = type;
        return r;
    }

    createTypeStaticThisObject(type: Symbol): Symbol {
        let r = new TypeStaticThisObject(type);
        r.pool = this.pool;
        r.staticType = this.pool.classType;
        return r;
    }

    f(type: Symbol | null = null): Symbol {
        let r = new T;
        r.pool = this.pool;
        r.staticType = type || this.pool.xType;
        return r;
    }

    f(type: Symbol | null = null): Symbol {
        let r = new T;
        r.pool = this.pool;
        r.staticType = type || this.pool.xType;
        return r;
    }

    f(type: Symbol | null = null): Symbol {
        let r = new T;
        r.pool = this.pool;
        r.staticType = type || this.pool.xType;
        return r;
    }

    f(type: Symbol | null = null): Symbol {
        let r = new T;
        r.pool = this.pool;
        r.staticType = type || this.pool.xType;
        return r;
    }

    f(type: Symbol | null = null): Symbol {
        let r = new T;
        r.pool = this.pool;
        r.staticType = type || this.pool.xType;
        return r;
    }

    f(type: Symbol | null = null): Symbol {
        let r = new T;
        r.pool = this.pool;
        r.staticType = type || this.pool.xType;
        return r;
    }

    f(type: Symbol | null = null): Symbol {
        let r = new T;
        r.pool = this.pool;
        r.staticType = type || this.pool.xType;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }

    f(): Symbol {
        let r = new T;
        r.pool = this.pool;
        return r;
    }
}