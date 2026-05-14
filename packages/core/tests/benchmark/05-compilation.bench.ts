import { run, bench, group } from 'mitata';
import { 
  simpleBuilder, mediumBuilder, complexBuilder, extremeBuilder,
} from './complexities';

const scenarios = [
  { name: 'Simple', builder: simpleBuilder, nativeStr: 'hello', nativeFlags: '' },
  { name: 'Medium', builder: mediumBuilder, nativeStr: '^(?<user>\\w+)@(?<domain>\\w+)\\.(?<tld>\\w+)$', nativeFlags: '' },
  { name: 'Complex', builder: complexBuilder, nativeStr: '^(?<protocol>https?):\\/\\/(?<domain>[a-z0-9.-]+)(?::(?<port>\\d+))?(?<path>.*)$', nativeFlags: '' },
  { name: 'Extremely Complex', builder: extremeBuilder, nativeStr: '^\\[(?<timestamp>[^\\]]+)\\] (?<level>(?:(?:INFO|WARN)|ERROR)): (?=User)(?<message>.*)$', nativeFlags: '' },
];

group('Compilation Overhead (AST to Native RegExp)', () => {
  for (const { name, builder, nativeStr, nativeFlags } of scenarios) {
    bench(`Builder Compile: ${name}`, () => {
      // Measures the time to traverse the AST, concatenate strings, map flags, and instantiate RegExp
      builder.compile();
    });

    bench(`Native Baseline: ${name}`, () => {
      // The absolute baseline: just creating a RegExp from an equivalent pre-built string
      new RegExp(nativeStr, nativeFlags);
    });
  }
});

run();
