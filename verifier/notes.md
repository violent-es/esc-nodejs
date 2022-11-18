# Verifier notes

- [ ] Prohibit writeable fields for `[Value]` classes.
- [ ] Prohibit use of `void` as type expression except as a function return type expression. Prohibit for getter to return `void` as well.
- [ ] Return paths: do not try determining whether all paths from a function return value without knowing what throws error. When another function that throws error is called by a function, it does not need a last return statement, for example.
```
function f() throws Error {
    anotherFunctionThatThrows();
}
```