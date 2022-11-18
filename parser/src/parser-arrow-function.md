# Arrow function

- [x] `->` expression
  - [x] `convertExpressionsIntoArrowFunctionParams(expressions)` returns `[params, optParams]`
  - [x] `parseArrowFunctionExpression(params, optParams, restParam)` parses after `->`
  - When parsing, check for precedence: `minPrecedence.valueOf() <= OperatorPrecedence.ASSIGNMENT_OR_CONDITIONAL_OR_YIELD_OR_FUNCTION.valueOf()`
  - [x] Parse on empty `()`
  - [x] Parse on `(...restParam)`
  - [x] Parse on `(a, b, c, ...restParam)`
  - [x] Parse on `(a, b, c) ->`
  - [x] Parse on `a ->`
- [x] `->` type expression