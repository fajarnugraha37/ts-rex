import { rx } from '../../src/index';

// 1. Simple
export const simpleBuilder = rx().literal('hello');
export const simpleStr = 'hello world';
export const simpleNative = /hello/;

// 2. Medium (Email-like)
export const mediumBuilder = rx()
  .startOfInput()
  .capture('user', rx().oneOrMore(rx().wordChar()))
  .literal('@')
  .capture('domain', rx().oneOrMore(rx().wordChar()))
  .literal('.')
  .capture('tld', rx().oneOrMore(rx().wordChar()))
  .endOfInput();
export const mediumStr = 'test@example.com';
export const mediumNative = /^(?<user>\w+)@(?<domain>\w+)\.(?<tld>\w+)$/;

// 3. Complex (URL Parser)
export const complexBuilder = rx()
  .startOfInput()
  .capture('protocol', rx().literal('http').optional(rx().literal('s')))
  .literal('://')
  .capture('domain', rx().oneOrMore(rx().anyOf('a-z0-9.-')))
  .optional(
    rx().group(rx().literal(':').capture('port', rx().oneOrMore(rx().digit())))
  )
  .capture('path', rx().zeroOrMore(rx().anyChar()))
  .endOfInput();
export const complexStr = 'https://sub.example.com:8080/path/to/resource';
export const complexNative = /^(?<protocol>https?):\/\/(?<domain>[a-z0-9.-]+)(?::(?<port>\d+))?(?<path>.*)$/;

// 4. Extremely Complex (Log Parser with Alternation and Lookarounds)
export const extremeBuilder = rx()
  .startOfInput()
  .literal('[')
  .capture('timestamp', rx().oneOrMore(rx().noneOf(']')))
  .literal('] ')
  // Mutual exclusivity via alternation
  .capture('level', rx().literal('INFO').or(rx().literal('WARN')).or(rx().literal('ERROR')))
  .literal(': ')
  // Lookaround assertion
  .lookahead(rx().literal('User'))
  .capture('message', rx().oneOrMore(rx().anyChar()))
  .endOfInput();
export const extremeStr = '[2024-05-13T10:00:00Z] ERROR: User failed to login due to timeout';
// Note: Hand-writing the native version to match exactly what the builder outputs for fair comparison
export const extremeNative = /^\[(?<timestamp>[^\]]+)\] (?<level>(?:(?:INFO|WARN)|ERROR)): (?=User)(?<message>.*)$/;

// Helper to simulate V1 (Pre-Optimization) execution where native regex was instantiated per-call
export function createV1Executor(builder: ReturnType<typeof rx> | any) {
  const compiled = builder.compile();
  const pattern = compiled.pattern;
  const flags = compiled.toRegExp().flags;
  return (str: string) => {
    // V1 explicitly re-creates the RegExp instance
    const instance = new RegExp(pattern, flags);
    const mapMatch = (match: any) => ({ isMatch: true, ...match.groups, match: match[0] });
    const match = instance.exec(str);
    return match ? mapMatch(match) : { isMatch: false, match: null };
  };
}
