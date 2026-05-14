import type { CompiledRegex, MatchResult } from './types';

export function hydrateRegex<
  TCaptures extends Record<string, unknown> = any,
  TFlags extends Record<string, unknown> = any
>(
  pattern: string,
  flags: string,
  groupNames: string[],
  hasIndices: boolean,
  isGlobal: boolean,
  isSticky: boolean,
  isUnicode: boolean
): CompiledRegex<TCaptures, TFlags> {
  const internalNative = new RegExp(pattern, flags);
  const isSimpleFastPath = groupNames.length === 0 && !hasIndices;

  // Pre-compile the execution route
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let execFn: (str: string) => any;

  if (isSimpleFastPath) {
    // FAST PATH: No capture groups, no indices. Return a simple POJO.
    if (isGlobal) {
      execFn = (str: string) => {
        return (function* () {
          const iterInstance = new RegExp(pattern, flags);
          let match: RegExpExecArray | null;
          while ((match = iterInstance.exec(str)) !== null) {
            yield { isMatch: true, match: match[0] };
            // Global zero-length match guard
            if (match[0].length === 0) {
              if (isUnicode && iterInstance.lastIndex < str.length) {
                // Advance correctly for unicode (handle surrogate pairs)
                iterInstance.lastIndex += str.codePointAt(iterInstance.lastIndex)! > 0xffff ? 2 : 1;
              } else {
                iterInstance.lastIndex++;
              }
            }
          }
        })();
      };
    } else if (isSticky) {
      execFn = (str: string) => {
        internalNative.lastIndex = 0;
        const match = internalNative.exec(str);
        internalNative.lastIndex = 0;
        return match ? { isMatch: true, match: match[0] } : { isMatch: false, match: null };
      };
    } else {
      execFn = (str: string) => {
        const match = internalNative.exec(str);
        return match ? { isMatch: true, match: match[0] } : { isMatch: false, match: null };
      };
    }
  } else {
    // COMPLEX PATH: Requires capture group mapping and/or indices.
    
    // We use a constructor function instead of `class` to dynamically attach
    // properties as enumerables on the instance so they survive `Object.keys()` and `...spread`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function MatchResultClass(this: any, raw: RegExpExecArray | null) {
      if (raw !== null) {
        this.isMatch = true;
        this.match = raw[0];
        
        // Eager assignment is significantly faster than Object.defineProperty for lazy getters
        // on the hot path, and correctly populates own enumerable properties for spread/JSON.
        if (raw.groups) {
          for (let i = 0; i < groupNames.length; i++) {
            const name = groupNames[i];
            this[name] = raw.groups[name];
          }
        } else {
           for (let i = 0; i < groupNames.length; i++) {
            this[groupNames[i]] = undefined;
          }
        }
      } else {
        this.isMatch = false;
        this.match = null;

        for (let i = 0; i < groupNames.length; i++) {
          this[groupNames[i]] = undefined;
        }
      }

      if (hasIndices) {
        // Cache the indices object upon first access to avoid repeated allocations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let cachedIndices: any = undefined;
        Object.defineProperty(this, 'indices', {
          get() {
            if (raw === null) return undefined;
            if (cachedIndices !== undefined) return cachedIndices;
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const idx = (raw as any).indices;
            if (!idx) return undefined;
            
            // Avoid object spread, use manual assignment based on precomputed names
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = { match: idx[0] };
            if (idx.groups) {
              for (let i = 0; i < groupNames.length; i++) {
                const gn = groupNames[i];
                if (idx.groups[gn] !== undefined) {
                  result[gn] = idx.groups[gn];
                }
              }
            }
            cachedIndices = result;
            return cachedIndices;
          },
          enumerable: true
        });
      }
    }

    if (isGlobal) {
      execFn = (str: string) => {
        return (function* () {
          const iterInstance = new RegExp(pattern, flags);
          let match: RegExpExecArray | null;
          while ((match = iterInstance.exec(str)) !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yield new (MatchResultClass as any)(match);
            
            // Global zero-length match guard
            if (match[0].length === 0) {
              if (isUnicode && iterInstance.lastIndex < str.length) {
                iterInstance.lastIndex += str.codePointAt(iterInstance.lastIndex)! > 0xffff ? 2 : 1;
              } else {
                iterInstance.lastIndex++;
              }
            }
          }
        })();
      };
    } else if (isSticky) {
      execFn = (str: string) => {
        internalNative.lastIndex = 0;
        const match = internalNative.exec(str);
        internalNative.lastIndex = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new (MatchResultClass as any)(match);
      };
    } else {
      execFn = (str: string) => {
        const match = internalNative.exec(str);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new (MatchResultClass as any)(match);
      };
    }
  }

  return {
    pattern,
    toRegExp: () => new RegExp(pattern, flags),
    exec: execFn,
  };
}