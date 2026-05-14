import { rx } from "../../dist";

simple();
capturing();
globalIteration();
matchIndices();
alternationAndOptionality();
urlParser();

function simple() {
  console.log("--- Simple Example ---");
  const literal = rx().literal("test").nonWordBoundary().compile();
  const literalResult = literal.exec("testing");

  if (literalResult.isMatch) {
    console.log(literalResult.match);
  }

  const capture = rx()
    .capture("foo", rx().literal("a"))
    .withIndices()
    .compile();
  const captureResult = capture.exec("a");

  if (captureResult.isMatch) {
    console.log(captureResult.match);
    console.log(captureResult.foo);
    console.log(captureResult.indices);
  }
}

function capturing() {
  console.log("--- Capturing Groups Example ---");
  // Build a pattern
  const pattern = rx()
    .startOfInput()
    .capture("firstName", rx().oneOrMore(rx().wordChar()))
    .whitespace()
    .capture("lastName", rx().oneOrMore(rx().wordChar()))
    .endOfInput()
    .compile();

  // Execute the pattern
  const result = pattern.exec("John Doe");

  if (result.isMatch) {
    // Types are fully inferred based on the captures defined above
    console.log(result.firstName); // "John"
    console.log(result.lastName); // "Doe"
    console.log(result.match); // "John Doe" (The full match)
  }
}

function globalIteration() {
  console.log("--- Global Iteration Example ---");
  const pattern = rx()
    .capture("num", rx().oneOrMore(rx().digit()))
    .global()
    .compile();

  const results = pattern.exec("I have 3 apples and 42 bananas");

  for (const result of results) {
    console.log(result.num); // "3", "42"
  }
}

function matchIndices() {
  console.log("--- Match Indices Example ---");
  const pattern = rx().capture("val", rx().wordChar()).withIndices().compile();

  const result = pattern.exec("a");

  if (result.isMatch) {
    console.log(result.indices.match); // [0, 1]
    console.log(result.indices.val); // [0, 1]
  }
}

function alternationAndOptionality() {
  console.log("--- Alternation and Optionality Example ---");
  const pattern = rx()
    .capture("a", rx().literal("A"))
    .or(rx().capture("b", rx().literal("B")))
    .compile();

  const result = pattern.exec("A");

  if (result.isMatch) {
    // TypeScript enforces that either 'a' is a string and 'b' is undefined, or vice versa.
    console.log(result.a);
  }
}

function urlParser() {
  console.log("--- URL Parser Example ---");
  const protocol = rx().capture('protocol', rx().literal('http').optional(rx().literal('s')));

  const alphanumeric = rx()
    .range('a', 'z')
    .or(rx().range('A', 'Z'))
    .or(rx().range('0', '9'));

  const passwordChars = alphanumeric.or(rx().anyOf('!@#$%^&*'));

  const auth = rx().capture(
    'auth',
    rx()
      .capture('username', rx().oneOrMore(rx().wordChar()))
      .literal(':')
      .capture('password', rx().oneOrMore(passwordChars))
      .literal('@')
  );

  const domainChars = rx().range('a', 'z').or(rx().range('0', '9')).or(rx().anyOf('.-'));

  const urlParser = rx()
    .startOfInput()
    .group(protocol)
    .literal('://')
    .optional(auth)
    .capture('domain', rx().oneOrMore(domainChars))
    .optional(
      rx()
        .literal(':')
        .capture('port', rx().oneOrMore(rx().digit()))
    )
    .optional(
      rx()
        .literal('/')
        .capture('path', rx().zeroOrMore(rx().notWhitespace()))
    )
    .endOfInput()
    .compile();

  console.log(urlParser.pattern);
  const parsed = urlParser.exec('https://admin:secret123@api.example.com:8080/v1/users');
  console.log(parsed);
}