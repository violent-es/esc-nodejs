import type Span from './span';

/**
 * Comment. The `content` does not include the delimiters `//`,
 * `/*` and `*` followed by `/`.
 */
export default class Comment {
    multiLine: boolean;
    content: string;
    span: Span;

    constructor(multiLine, content, span) {
        this.multiLine = multiLine;
        this.content = content;
        this.span = span;
    }
}