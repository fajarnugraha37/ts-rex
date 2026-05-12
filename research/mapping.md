# Regex Dictionary to Builder API Mapping

This document maps standard Regular Expression syntax (tokens, anchors, character classes, etc.) to the proposed typesafe fluent builder API contracts.

### 1. Flags (Execution Context)
*Flags modify the execution context and return types. They must be tracked via the `TFlags` generic.*

| regex keyword / dictionary | category | mapping function or contracts | description | status | testing | special notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `g` | Flags | `.global()` | Global match. Changes execution return type to `IterableIterator`. | ✅ Implemented | ✅ Done | Stateless execution via fresh instance |
| `i` | Flags | `.ignoreCase()` | Case-insensitive match. | ✅ Implemented | ✅ Done | |
| `m` | Flags | `.multiline()` | Causes `^` and `$` to match the begin/end of each line. | ✅ Implemented | ✅ Done | |
| `s` | Flags | `.dotAll()` | Allows `.` to match newline characters. | ✅ Implemented | ✅ Done | |
| `u` | Flags | `.unicode()` | Treats pattern as a sequence of Unicode code points. | ✅ Implemented | ✅ Done | |
| `v` | Flags | `.unicodeSets()` | Upgrades `u` flag. Enables set operations in char classes and string properties (ES2024). | ✅ Implemented | ⚠️ Partial | Requires ES2024 runtime for full execution |
| `y` | Flags | `.sticky()` | Matches only from the index indicated by the `lastIndex` property. | ✅ Implemented | ✅ Done | Stateless execution via fresh instance |
| `d` | Flags | `.withIndices()` | Adds start/end indices. Mutates generic `TFlags['indices'] = true`. | ✅ Implemented | ✅ Done | Injects `indices` into the `.exec()` return object |

### 2. Assertions / Boundaries

| regex keyword / dictionary | category | mapping function or contracts | description | status | testing | special notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `^` | Boundaries | `.startOfInput()` | Matches the beginning of the input. | ✅ Implemented | ✅ Done | |
| `$` | Boundaries | `.endOfInput()` | Matches the end of the input. | ✅ Implemented | ✅ Done | |
| `\b` | Boundaries | `.wordBoundary()` | Matches a word boundary. | ✅ Implemented | ✅ Done | |
| `\B` | Boundaries | `.nonWordBoundary()` | Matches a non-word boundary. | ✅ Implemented | ✅ Done | |
| `x(?=y)` | Lookarounds| `.lookahead(builder)` | Matches "x" only if "x" is followed by "y". | ✅ Implemented | ✅ Done | Supports nested captures |
| `x(?!y)` | Lookarounds| `.negativeLookahead(builder)` | Matches "x" only if "x" is not followed by "y". | ✅ Implemented | ✅ Done | |
| `(?<=y)x` | Lookarounds| `.lookbehind(builder)` | Matches "x" only if "x" is preceded by "y". | ✅ Implemented | ✅ Done | |
| `(?<!y)x` | Lookarounds| `.negativeLookbehind(builder)` | Matches "x" only if "x" is not preceded by "y". | ✅ Implemented | ✅ Done | |

### 3. Character Classes & Control Characters

| regex keyword / dictionary | category | mapping function or contracts | description | status | testing | special notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `.` | Character Classes | `rx.anyChar()` | Matches any single character except line terminators. | ✅ Implemented | ✅ Done | |
| `\d` | Character Classes | `rx.digit()` | Matches any digit (0-9). | ✅ Implemented | ✅ Done | |
| `\D` | Character Classes | `rx.notDigit()` | Matches any character that is not a digit. | ✅ Implemented | ✅ Done | |
| `\w` | Character Classes | `rx.wordChar()` | Matches any alphanumeric character from the basic Latin alphabet. | ✅ Implemented | ✅ Done | |
| `\W` | Character Classes | `rx.notWordChar()` | Matches any character that is not a word character. | ✅ Implemented | ✅ Done | |
| `\s` | Character Classes | `rx.whitespace()` | Matches a single white space character. | ✅ Implemented | ✅ Done | |
| `\S` | Character Classes | `rx.notWhitespace()` | Matches a single character other than white space. | ✅ Implemented | ✅ Done | |
| `[abc]` | Character Classes | `rx.anyOf('abc')` | Matches any one of the enclosed characters. | ✅ Implemented | ✅ Done | Automatic internal escaping |
| `[^abc]` | Character Classes | `rx.noneOf('abc')` | Matches anything that is not enclosed. | ✅ Implemented | ✅ Done | Automatic internal escaping |
| `[a-z]` | Character Classes | `rx.range('a', 'z')` | Matches a character in the specified range. | ✅ Implemented | ✅ Done | Validates single-char boundaries |
| `\xNN` | Char Classes / Escapes | `rx.hex('NN')` | Matches a character by its 2-digit hexadecimal code. | ✅ Implemented | ✅ Done | Validates hex format |
| `\uNNNN` | Char Classes / Escapes | `rx.unicodeChar('NNNN')` | Matches a character by its 4-digit Unicode hex value. | ✅ Implemented | ✅ Done | Validates hex format |
| `\u{NNNN}`| Char Classes / Escapes | `rx.unicodeCodePoint('NNNN')`| Matches a Unicode code point (requires `u` or `v` flag). | ✅ Implemented | ✅ Done | Supports up to 6-digit hex |
| `\p{P}` | Unicode Escapes | `rx.unicodeProperty('...')` | Matches a character based on its Unicode category. | ✅ Implemented | ✅ Done | Requires `u` or `v` flag at runtime |
| `\P{P}` | Unicode Escapes | `rx.notUnicodeProperty('...')` | Matches a character not in the specified Unicode category. | ✅ Implemented | ✅ Done | |
| `\0` | Control Chars | `rx.nullChar()` | Matches a NUL character (U+0000). | ✅ Implemented | ✅ Done | |
| `\n` | Control Chars | `rx.newline()` | Matches a line feed. | ✅ Implemented | ✅ Done | |
| `\r` | Control Chars | `rx.carriageReturn()` | Matches a carriage return. | ✅ Implemented | ✅ Done | |
| `\t` | Control Chars | `rx.tab()` | Matches a horizontal tab. | ✅ Implemented | ✅ Done | |
| `\v` | Control Chars | `rx.verticalTab()` | Matches a vertical tab (U+000B). | ✅ Implemented | ✅ Done | |
| `\f` | Control Chars | `rx.formFeed()` | Matches a form feed (U+000C). | ✅ Implemented | ✅ Done | |
| `\cX` | Control Chars | `rx.controlChar('X')` | Matches a control character (e.g., `\cM` for Ctrl-M). | ✅ Implemented | ✅ Done | Case-insensitive input mapping |

### 4. Quantifiers
*Note: Quantifiers that encompass capturing groups MUST be used as wrapper methods to safely map optionality at the type level without crashing the compiler.*

| regex keyword / dictionary | category | mapping function or contracts | description | status | testing | special notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `*` | Quantifiers | `.zeroOrMore(builder?)` | Matches 0 or more times. When wrapping a builder, maps nested captures to `Partial`. | ✅ Implemented | ✅ Done | Deep type optionality mapping |
| `+` | Quantifiers | `.oneOrMore(builder?)` | Matches 1 or more times. | ✅ Implemented | ✅ Done | |
| `?` | Quantifiers | `.optional(builder?)` | Matches 0 or 1 times. When wrapping a builder, maps nested captures to `Partial`. | ✅ Implemented | ✅ Done | Deep type optionality mapping |
| `{n}` | Quantifiers | `.times(n, builder?)` | Matches exactly "n" occurrences. | ✅ Implemented | ✅ Done | |
| `{n,}` | Quantifiers | `.atLeast(n, builder?)`| Matches at least "n" occurrences. | ✅ Implemented | ✅ Done | |
| `{n,m}` | Quantifiers | `.between(n, m, builder?)` | Matches at least "n" and at most "m" occurrences. | ✅ Implemented | ✅ Done | Validates min <= max |
| `*?`, `+?`, `??`, `{n,m}?` | Lazy Quantifiers| `.lazy()` | Modifies the preceding quantifier to match the minimum number of times. | ✅ Implemented | ✅ Done | Validates position in chain |

### 5. Groups & Backreferences
*Note: Anonymous indexed capturing groups `(x)` are intentionally omitted to enforce strict named object returns (`Record<string, string>`).*

| regex keyword / dictionary | category | mapping function or contracts | description | status | testing | special notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `(?:x)` | Groups | `.group(builder)` | Matches "x" but does not remember the match (non-capturing group). | ✅ Implemented | ✅ Done | |
| `(?<Name>x)` | Groups | `.capture('Name', builder)` | Matches "x" and stores it as a named group. | ✅ Implemented | ✅ Done | Validates name identifier |
| `\k<Name>` | Backreferences | `.matchPrevious('Name')` | Matches exact text captured previously. Compiler verifies `Name extends keyof TGroups`. | ✅ Implemented | ✅ Done | Strict name existence check |

### 6. Logic & Syntax

| regex keyword / dictionary | category | mapping function or contracts | description | status | testing | special notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `x\|y` | Disjunction | `.or(builder)`| Matches either "x" or "y" using a chainable method to avoid TS variadic recursion limits. | ✅ Implemented | ✅ Done | Union type mapping for captures |
| `\` | Escaping | `rx.literal(str)` | Escapes string input to match characters literally. | ✅ Implemented | ✅ Done | Robust escaping for special chars |
