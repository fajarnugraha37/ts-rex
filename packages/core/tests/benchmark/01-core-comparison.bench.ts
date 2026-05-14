import { run, bench, group } from 'mitata';
import { 
  simpleBuilder, simpleStr, simpleNative,
  mediumBuilder, mediumStr, mediumNative,
  complexBuilder, complexStr, complexNative,
  extremeBuilder, extremeStr, extremeNative,
  createV1Executor
} from './complexities';

const scenarios = [
  { name: 'Simple', builder: simpleBuilder, str: simpleStr, native: simpleNative },
  { name: 'Medium', builder: mediumBuilder, str: mediumStr, native: mediumNative },
  { name: 'Complex', builder: complexBuilder, str: complexStr, native: complexNative },
  { name: 'Extremely Complex', builder: extremeBuilder, str: extremeStr, native: extremeNative },
];

for (const { name, builder, str, native } of scenarios) {
  group(`Core Comparison: ${name}`, () => {
    const v1Exec = createV1Executor(builder);
    const compiled = builder.compile();

    bench('V1 (Pre-Optimization, New RegExp)', () => {
      v1Exec(str);
    });

    bench('V2 (Current, Cached RegExp)', () => {
      compiled.exec(str);
    });

    bench('Native (Raw RegExp, Theoretical Limit)', () => {
      // Must manually reset lastIndex to mirror our stateless internal behavior
      native.lastIndex = 0;
      native.exec(str);
    });
  });
}

run();
