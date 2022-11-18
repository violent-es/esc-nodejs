import type {Problem} from 'com.violentes.esc.source-objects';

export default class ParseError extends Error {
    problem: Problem;

    constructor(problem) {
        super();
        this.problem = problem;
    }
}