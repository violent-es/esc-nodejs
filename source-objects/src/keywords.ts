const strictKeywordsByLength = new Map([
    [2, new Set(['as', 'do', 'if', 'in', 'is',])],
    [3, new Set(['for', 'new', 'try', 'use', 'var',])],
    [4, new Set(['case', 'else', 'null', 'this', 'true', 'void', 'with',])],
    [5, new Set(['await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'where', 'while', 'yield',])],
    [6, new Set(['delete', 'import', 'public', 'return', 'switch', 'throws', 'typeof',])],
    [7, new Set(['default', 'extends', 'finally', 'package', 'private',])],
    [8, new Set(['continue', 'function', 'internal',])],
    [9, new Set(['interface', 'protected',])],
    [10, new Set(['implements',])],
]);

export const isStrictKeyword = id =>
    !!(strictKeywordsByLength.get(id.length)?.has(id));