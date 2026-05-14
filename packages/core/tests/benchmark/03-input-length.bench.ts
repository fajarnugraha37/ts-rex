import { run, bench, group } from 'mitata';
import { rx } from '../../src/index';

// We must use a non-anchored regex to test payload length impact
// so it doesn't fail instantly on the first character.
const emailExtractor = rx()
  .capture('user', rx().oneOrMore(rx().wordChar()))
  .literal('@')
  .capture('domain', rx().oneOrMore(rx().wordChar()))
  .literal('.')
  .capture('tld', rx().oneOrMore(rx().wordChar()))
  .compile();

const baseStr = 'test@example.com';
const shortStr = baseStr;
const mediumLenStr = ' '.repeat(1000) + baseStr; // 1000 spaces before match
const longStr = ' '.repeat(10000) + baseStr; // 10000 spaces before match

group('Payload Length Impact (Medium Complexity)', () => {
  bench('Short String (16 chars)', () => {
    emailExtractor.exec(shortStr);
  });

  bench('Medium String (1,000 chars prefix)', () => {
    emailExtractor.exec(mediumLenStr);
  });

  bench('Long String (10,000 chars prefix)', () => {
    emailExtractor.exec(longStr);
  });
});

run();
