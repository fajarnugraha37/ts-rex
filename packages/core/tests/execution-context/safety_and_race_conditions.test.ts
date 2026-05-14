import { expect, test, describe } from 'bun:test';
import { rx } from '../../src/index';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('Execution Safety, Edge Cases & Race Conditions', () => {
  describe('toRegExp() Isolation (Negative Cases)', () => {
    test('mutating the RegExp from toRegExp() does not corrupt internal state', () => {
      // Sticky flag makes the regex stateful if not handled correctly
      const compiled = rx().literal('abc').sticky().compile();
      
      // Developer extracts native regex and messes with it
      const externalRegex = compiled.toRegExp();
      externalRegex.lastIndex = 100;
      
      // Execute the builder's exec
      // If internal state was leaked, this would fail because lastIndex would be 100.
      // But because our internal engine resets it, it should pass.
      const result = compiled.exec('abc');
      expect(result.isMatch).toBe(true);
      expect(result.match).toBe('abc');

      // The external regex remains unmodified by our internal execution
      expect(externalRegex.lastIndex).toBe(100);
    });

    test('multiple calls to toRegExp() return distinct instances', () => {
      const compiled = rx().literal('abc').compile();
      const reg1 = compiled.toRegExp();
      const reg2 = compiled.toRegExp();

      expect(reg1).not.toBe(reg2); // Strict equality check
      
      reg1.lastIndex = 5;
      expect(reg2.lastIndex).toBe(0); // reg2 is unaffected
    });
  });

  describe('Race Conditions (Concurrent Execution)', () => {
    test('concurrent executions on a sticky (y) regex do not interfere', async () => {
      const compiled = rx().literal('test').sticky().compile();
      const input = 'test';

      // We simulate an async environment where multiple requests use the same compiled regex
      const runAsyncExec = async (id: number) => {
        // Random jitter to interleave operations
        await delay(Math.random() * 10); 
        const result = compiled.exec(input);
        return { id, isMatch: result.isMatch, match: result.match };
      };

      const promises = Array.from({ length: 50 }, (_, i) => runAsyncExec(i));
      const results = await Promise.all(promises);

      // Every single concurrent execution must succeed.
      // If `lastIndex` was shared and not reset atomically per function closure,
      // subsequent executions would start at index 4 and fail.
      for (const res of results) {
        expect(res.isMatch).toBe(true);
        expect(res.match).toBe('test');
      }
    });

    test('concurrent executions on a global (g) iterator do not interfere', async () => {
      const compiled = rx().capture('num', rx().digit()).global().compile();
      const input = '1 2 3';

      const runAsyncIter = async (id: number) => {
        const iter = compiled.exec(input);
        const matches: string[] = [];
        
        // We pause between yields to maximize the chance of a race condition
        // if the underlying RegExp instance was shared.
        for (const match of iter) {
          matches.push(match.match);
          await delay(Math.random() * 5); 
        }
        return matches;
      };

      const promises = Array.from({ length: 20 }, (_, i) => runAsyncIter(i));
      const results = await Promise.all(promises);

      // Every generator should independently yield ['1', '2', '3']
      for (const res of results) {
        expect(res).toEqual(['1', '2', '3']);
      }
    });

    test('partial consumption of an iterator does not affect subsequent calls', () => {
      const compiled = rx().digit().global().compile();
      const input = '1 2 3 4 5';

      const iter1 = compiled.exec(input);
      // Consume only first 2 items
      expect(iter1.next().value.match).toBe('1');
      expect(iter1.next().value.match).toBe('2');

      // Abandon iter1 and start a new one
      const iter2 = compiled.exec(input);
      
      // iter2 must start fresh from the beginning
      expect(iter2.next().value.match).toBe('1');
      expect(iter2.next().value.match).toBe('2');
      expect(iter2.next().value.match).toBe('3');
    });
  });

  describe('Edge Cases', () => {
    test('executing on an empty string with sticky flag', () => {
      const compiled = rx().literal('a').sticky().compile();
      const result = compiled.exec('');
      
      expect(result.isMatch).toBe(false);
      expect(result.match).toBeNull();
    });

    test('executing with zeroOrMore on empty string', () => {
      const compiled = rx().zeroOrMore(rx().literal('a')).compile();
      const result = compiled.exec('');
      
      // (?:a)* matches an empty string 0 times successfully
      expect(result.isMatch).toBe(true);
      expect(result.match).toBe('');
    });

    test('consecutive execution failure and recovery on sticky regex', () => {
      const compiled = rx().literal('test').sticky().compile();
      
      // 1. Success
      expect(compiled.exec('test').isMatch).toBe(true);
      
      // 2. Fail
      expect(compiled.exec('fail').isMatch).toBe(false);
      
      // 3. Recover / Success again. 
      // This ensures the internal lastIndex is reset even after a failed execution.
      expect(compiled.exec('test').isMatch).toBe(true);
    });
  });
});
