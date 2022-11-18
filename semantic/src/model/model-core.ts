import Factory from './factory';

export default class ModelCore {
    public factory: Factory | null = null;

    constructor() {
        this.factory = new Factory(this);
    }
}