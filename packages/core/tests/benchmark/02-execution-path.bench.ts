import { run, bench, group } from 'mitata';
import { 
  simpleBuilder, mediumBuilder, complexBuilder, extremeBuilder, 
  simpleStr, mediumStr, complexStr, extremeStr 
} from './complexities';

const scenarios = [
  { name: 'Simple', builder: simpleBuilder, str: simpleStr },
  { name: 'Medium', builder: mediumBuilder, str: mediumStr },
  { name: 'Complex', builder: complexBuilder, str: complexStr },
  { name: 'Extremely Complex', builder: extremeBuilder, str: extremeStr },
];

for (const { name, builder, str } of scenarios) {
  group(`Execution Path: ${name}`, () => {
    // Generate a repeating string to give the global iterator some work
    const repeatedStr = Array(5).fill(str).join(' ');

    const compiledSingle = builder.compile();
    const compiledGlobal = builder.global().compile();

    bench('Path A: Single Match (Cached)', () => {
      compiledSingle.exec(repeatedStr);
    });

    bench('Path B: Global Iterator (Safe Cloned)', () => {
      // Array.from fully consumes the iterator, measuring the actual RegExp cloning overhead
      // plus the mapMatch iteration loops.
      Array.from(compiledGlobal.exec(repeatedStr));
    });
  });
}

run();
