# Regex Dictionary to Builder API Mapping

This document maps standard Regular Expression syntax (tokens, anchors, character classes, etc.) to the proposed typesafe fluent builder API contracts.

### 1. Flags (Execution Context)
*Flags modify the execution context and return types. They must be tracked via the `TFlags` generic.*

| regex keyword / dictionary | category | mapping function or contracts | description | status |
| :--- | :--- | :--- | :--- | :--- |
| `g` | Flags | `.global()` | Global match. Changes execution return type to `IterableIterator`. | ⏳ Planned |
| `i` | Flags | `.ignoreCase()` | Case-insensitive match. | ⏳ Planned |
| `m` | Flags | `.multiline()` | Causes `^` and `$` to match the begin/end of each line. | ⏳ Planned |
| `s` | Flags | `.dotAll()` | Allows `.` to match newline characters. | ⏳ Planned |
| `u` | Flags | `.unicode()` | Treats pattern as a sequence of Unicode code points. | ⏳ Planned |
| `v` | Flags | `.unicodeSets()` | Upgrades `u` flag. Enables set operations in char classes and string properties (ES2024). | ⏳ Planned |
| `y` | Flags | `.sticky()` | Matches only from the index indicated by the `lastIndex` property. | ⏳ Planned |
| `d` | Flags | `.withIndices()` | Adds start/end indices. Mutates generic `TFlags['indices'] = true`. | ⏳ Planned |

### 2. Assertions / Boundaries

| regex keyword / dictionary | category | mapping function or contracts | description | status |
| :--- | :--- | :--- | :--- | :--- |
| `^` | Boundaries | `.startOfInput()` | Matches the beginning of the input. | ⏳ Planned |
| `$` | Boundaries | `.endOfInput()` | Matches the end of the input. | ⏳ Planned |
| `\b` | Boundaries | `.wordBoundary()` | Matches a word boundary. | ⏳ Planned |
| `\B` | Boundaries | `.nonWordBoundary()` | Matches a non-word boundary. | ⏳ Planned |
| `x(?=y)` | Lookarounds| `.lookahead(builder)` | Matches "x" only if "x" is followed by "y". | ⏳ Planned |
| `x(?!y)` | Lookarounds| `.negativeLookahead(builder)` | Matches "x" only if "x" is not followed by "y". | ⏳ Planned |
| `(?<=y)x` | Lookarounds| `.lookbehind(builder)` | Matches "x" only if "x" is preceded by "y". | ⏳ Planned |
| `(?<!y)x` | Lookarounds| `.negativeLookbehind(builder)` | Matches "x" only if "x" is not preceded by "y". | ⏳ Planned |

### 3. Character Classes & Control Characters

| regex keyword / dictionary | category | mapping function or contracts | description | status |
| :--- | :--- | :--- | :--- | :--- |
| `.` | Character Classes | `rx.anyChar()` | Matches any single character except line terminators. | ⏳ Planned |
| `\d` | Character Classes | `rx.digit()` | Matches any digit (0-9). | ⏳ Planned |
| `\D` | Character Classes | `rx.notDigit()` | Matches any character that is not a digit. | ⏳ Planned |
| `\w` | Character Classes | `rx.wordChar()` | Matches any alphanumeric character from the basic Latin alphabet. | ⏳ Planned |
| `\W` | Character Classes | `rx.notWordChar()` | Matches any character that is not a word character. | ⏳ Planned |
| `\s` | Character Classes | `rx.whitespace()` | Matches a single white space character. | ⏳ Planned |
| `\S` | Character Classes | `rx.notWhitespace()` | Matches a single character other than white space. | ⏳ Planned |
| `[abc]` | Character Classes | `rx.anyOf('abc')` | Matches any one of the enclosed characters. | ⏳ Planned |
| `[^abc]` | Character Classes | `rx.noneOf('abc')` | Matches anything that is not enclosed. | ⏳ Planned |
| `[a-z]` | Character Classes | `rx.range('a', 'z')` | Matches a character in the specified range. | ⏳ Planned |
| `\xNN` | Char Classes / Escapes | `rx.hex('NN')` | Matches a character by its 2-digit hexadecimal code. | ⏳ Planned |
| `\uNNNN` | Char Classes / Escapes | `rx.unicodeChar('NNNN')` | Matches a character by its 4-digit Unicode hex value. | ⏳ Planned |
| `\u{NNNN}`| Char Classes / Escapes | `rx.unicodeCodePoint('NNNN')`| Matches a Unicode code point (requires `u` or `v` flag). | ⏳ Planned |
| `\p{P}` | Unicode Escapes | `rx.unicodeProperty('...')` | Matches a character based on its Unicode category. | ⏳ Planned |
| `\P{P}` | Unicode Escapes | `rx.notUnicodeProperty('...')` | Matches a character not in the specified Unicode category. | ⏳ Planned |
| `\0` | Control Chars | `rx.nullChar()` | Matches a NUL character (U+0000). | ⏳ Planned |
| `\n` | Control Chars | `rx.newline()` | Matches a line feed. | ⏳ Planned |
| `\r` | Control Chars | `rx.carriageReturn()` | Matches a carriage return. | ⏳ Planned |
| `\t` | Control Chars | `rx.tab()` | Matches a horizontal tab. | ⏳ Planned |
| `\v` | Control Chars | `rx.verticalTab()` | Matches a vertical tab (U+000B). | ⏳ Planned |
| `\f` | Control Chars | `rx.formFeed()` | Matches a form feed (U+000C). | ⏳ Planned |
| `\cX` | Control Chars | `rx.controlChar('X')` | Matches a control character (e.g., `\cM` for Ctrl-M). | ⏳ Planned |

### 4. Quantifiers
*Note: Quantifiers that encompass capturing groups MUST be used as wrapper methods to safely map optionality at the type level without crashing the compiler.*

| regex keyword / dictionary | category | mapping function or contracts | description | status |
| :--- | :--- | :--- | :--- | :--- |
| `*` | Quantifiers | `.zeroOrMore(builder?)` | Matches 0 or more times. When wrapping a builder, maps nested captures to `Partial`. | ⏳ Planned |
| `+` | Quantifiers | `.oneOrMore(builder?)` | Matches 1 or more times. | ⏳ Planned |
| `?` | Quantifiers | `.optional(builder?)` | Matches 0 or 1 times. When wrapping a builder, maps nested captures to `Partial`. | ⏳ Planned |
| `{n}` | Quantifiers | `.times(n, builder?)` | Matches exactly "n" occurrences. | ⏳ Planned |
| `{n,}` | Quantifiers | `.atLeast(n, builder?)`| Matches at least "n" occurrences. | ⏳ Planned |
| `{n,m}` | Quantifiers | `.between(n, m, builder?)` | Matches at least "n" and at most "m" occurrences. | ⏳ Planned |
| `*?`, `+?`, `??`, `{n,m}?` | Lazy Quantifiers| `.lazy()` | Modifies the preceding quantifier to match the minimum number of times. | ⏳ Planned |

### 5. Groups & Backreferences
*Note: Anonymous indexed capturing groups `(x)` are intentionally omitted to enforce strict named object returns (`Record<string, string>`).*

| regex keyword / dictionary | category | mapping function or contracts | description | status |
| :--- | :--- | :--- | :--- | :--- |
| `(?:x)` | Groups | `.group(builder)` | Matches "x" but does not remember the match (non-capturing group). | ⏳ Planned |
| `(?<Name>x)` | Groups | `.capture('Name', builder)` | Matches "x" and stores it as a named group. | ⏳ Planned |
| `\k<Name>` | Backreferences | `.matchPrevious('Name')` | Matches exact text captured previously. Compiler verifies `Name extends keyof TGroups`. | ⏳ Planned |

### 6. Logic & Syntax

| regex keyword / dictionary | category | mapping function or contracts | description | status |
| :--- | :--- | :--- | :--- | :--- |
| `x\|y` | Disjunction | `.or(builder)`| Matches either "x" or "y" using a chainable method to avoid TS variadic recursion limits. | ⏳ Planned |
| `\` | Escaping | `rx.literal(str)` | Escapes string input to match characters literally. | ⏳ Planned |