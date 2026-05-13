import { run, bench, group } from 'mitata';
import { rx } from '../../src/index';

// A somewhat complex, unanchored regex so failure is expensive
const searchRegex = rx()
  .literal('START_')
  .capture('id', rx().times(5, rx().digit()))
  .literal('_END')
  .compile();

const earlyMatch = 'START_12345_END' + ' '.repeat(10000);
const lateMatch = ' '.repeat(10000) + 'START_12345_END';
const failMatch = ' '.repeat(10000) + 'START_1234X_END'; // Almost matches at the end but fails

group('Match Position & Failure (10,000 char payload)', () => {
  bench('Early Match', () => {
    searchRegex.exec(earlyMatch);
  });

  bench('Late Match', () => {
    searchRegex.exec(lateMatch);
  });

  bench('Fail Match (Near miss at end)', () => {
    searchRegex.exec(failMatch);
  });
});

run();
