import type ModelCore from './model-core';
import type Symbol from './symbol';
import * as Issues from './issues';
import * as TypeSystem from './type-system';
import {NameAndTypePair} from './name-and-type-pair';

export default class Factory {
    private modelCore: ModelCore;

    constructor(core:ModelCore) {
        this.modelCore = core;
    }

    ambiguousReferenceIssue(name: string, base: Symbol | null): Symbol {
        let r = new Issues.AmbiguousReferenceIssue(name, base);
        r.modelCore = this.modelCore;
        return r;
    }

    alias(name: string, to: Symbol): Symbol {
        let r = new Alias(name, to);
        r.modelCore = this.modelCore;
        return r;
    }

    instanceDelegate(associatedType: Symbol): Symbol {
        let r = new TypeSystem.InstanceDelegate(associatedType);
        r.modelCore = this.modelCore;
        return r;
    }

    anyType(): Symbol {
        if (this.modelCore.anyType != null) {
            return this.modelCore.anyType;
        }
        let r = new TypeSystem.AnyType;
        r.modelCore = this.modelCore;
        this.modelCore.anyType = r;
        return r;
    }

    undefinedType(): Symbol {
        if (this.modelCore.undefinedType != null) {
            return this.modelCore.undefinedType;
        }
        let r = new TypeSystem.UndefinedType;
        r.modelCore = this.modelCore;
        this.modelCore.undefinedType = r;
        return r;
    }

    nullType(): Symbol {
        if (this.modelCore.nullType != null) {
            return this.modelCore.nullType;
        }
        let r = new TypeSystem.NullType;
        r.modelCore = this.modelCore;
        this.modelCore.nullType = r;
        return r;
    }

    classType(name: string, isFinal: boolean = false, isValue: boolean = false): Symbol {
        let r = new TypeSystem.ClassType(name, isFinal || isValue, isValue);
        r.modelCore = this.modelCore;
        r.delegate = this.instanceDelegate(r);
        return r;
    }

    enumType(name: string, isFlags: boolean = false, reprType: Symbol = null): Symbol {
        let r = new TypeSystem.EnumType(name, isFlags, reprType || this.modelCore.numberType);
        r.modelCore = this.modelCore;
        r.delegate = this.instanceDelegate(r);
        return r;
    }

    interfaceType(name: string): Symbol {
        let r = new TypeSystem.InterfaceType(name);
        r.modelCore = this.modelCore;
        r.delegate = this.instanceDelegate(r);
        return r;
    }

    functionType(requiredParams: NameAndTypePair[] | null, optParams: NameAndTypePair[] | null, restParam: NameAndTypePair | null, returnType: Symbol): Symbol {
        return this.modelCore.internFunctionType(requiredParams, optParams, restParam, returnType);
    }

    tupleType(types: Symbol[]): Symbol {
        return this.modelCore.internTupleType(types);
    }

    recordType(props: NameAndTypePair[]): Symbol {
        return this.modelCore.internRecordType(props);
    }

    unionType(types: Symbol[]): Symbol {
        return this.modelCore.internUnionType(types);
    }

    instantiatedType(origin: Symbol, argumentTypes: Symbol[]): Symbol {
        return this.modelCore.internInstantiatedType(origin, argumentTypes);
    }

    typeParameter(name: string): Symbol {
        let r = new TypeSystem.TypeParameter(name);
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }

    x(): Symbol {
        let r = new T();
        r.modelCore = this.modelCore;
        return r;
    }
}