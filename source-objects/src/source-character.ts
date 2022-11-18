// for now not all Unicode characters are supported,
// but it is easy to support them:
// https://github.com/matheusdiasdesouzads/unicode-general-category
const SourceCharacter = {
    lineTerminatorsRegex: /\r\n?/g,
    isWhitespace(ch) {
        if (ch == 0x20 || ch == 0x09 || ch == 0x0b || ch == 0x0c || ch == 0xa0)
            return true;
        // return GeneralCategory.from(ch) == GeneralCategory.SPACE_SEPARATOR;
        return false;
    },
    isLineTerminator(ch) {
        return ch == 0x0a || ch == 0x0d || ch == 0x2028 || ch == 0x2029;
    },
    isBinDigit(ch) {
        return ch == 0x30 || ch == 0x31;
    },
    isDecDigit(ch) {
        return ch >= 0x30 && ch <= 0x39;
    },
    hexDigitMV(ch) {
        return SourceCharacter.isDecDigit(ch) ? ch - 0x30
            : SourceCharacter.isHexUL(ch) ? ch - 0x41 + 10
            : SourceCharacter.isHexLL(ch) ? ch - 0x61 + 10
            : -1;
    },
    isHexDigit(ch) {
        return SourceCharacter.isDecDigit(ch) || SourceCharacter.isHexUL(ch) || SourceCharacter.isHexLL(ch);
    },
    isHexUL(ch) {
        return ch >= 0x41 && ch <= 0x46;
    },
    isHexLL(ch) {
        return ch >= 0x61 && ch <= 0x66;
    },
    isIdentifierStart(ch) {
        if ((ch >= 0x41 && ch <= 0x5a) || (ch >= 0x61 && ch <= 0x7a)
        ||   ch == 0x5f || ch == 0x24)
            return true;
        /*
        let category = GeneralCategory.from(ch);
        return category.isLetter
            || category == GeneralCategory.LETTER_NUMBER;
        */
        return false;
    },
    isIdentifierPart(ch) {
        if ((ch >= 0x41 && ch <= 0x5a) || (ch >= 0x61 && ch <= 0x7a)
        ||   ch == 0x5f || ch == 0x24 || SourceCharacter.isDecDigit(ch))
            return true;
        /*
        let category = GeneralCategory.from(ch);
        return category.isLetter
            || category == GeneralCategory.LETTER_NUMBER
            || category == GeneralCategory.NONSPACING_MARK
            || category == GeneralCategory.SPACING_COMBINING_MARK
            || category == GeneralCategory.CONNECTOR_PUNCTUATION
            || category == GeneralCategory.DECIMAL_DIGIT_NUMBER;
        */
        return false;
    },
};

export default SourceCharacter;