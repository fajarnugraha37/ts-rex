import { createUnplugin } from 'unplugin';
import MagicString from 'magic-string';
import { parse } from '@babel/parser';
import { walk } from 'estree-walker';
import { rx } from '@fajarnugraha37/ts-rex';

export interface TsRexPluginOptions {
  strict?: boolean;
}

export const unplugin = createUnplugin<TsRexPluginOptions | undefined>((options) => {
  return {
    name: 'unplugin-ts-rex',
    
    transformInclude(id) {
      return /\.[jt]sx?$/.test(id) && !id.includes('node_modules');
    },

    transform(code, id) {
      if (!code.includes('rx') && !code.includes('compile') && !code.includes('ts-rex')) {
        return null;
      }

      let ast;
      try {
        ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx', 'estree'],
        });
      } catch (e) {
        return null; 
      }

      const s = new MagicString(code);
      let isTransformed = false;
      let needsImport = false;

      // Data Flow Analysis: Track aliases for the `rx` function and the module namespace
      const rxAliases = new Set<string>();
      const moduleAliases = new Set<string>();

      // Default fallback
      rxAliases.add('rx');

      // First pass: Track imports and assignments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      walk(ast as any, {
        enter(node: any) {
          // 1. ES Modules Imports
          if (node.type === 'ImportDeclaration') {
            if (node.source.value === '@fajarnugraha37/ts-rex') {
              for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportSpecifier') {
                  if (specifier.imported?.name === 'rx' || specifier.imported?.value === 'rx') {
                    rxAliases.add(specifier.local.name);
                  }
                } else if (specifier.type === 'ImportNamespaceSpecifier' || specifier.type === 'ImportDefaultSpecifier') {
                  moduleAliases.add(specifier.local.name);
                }
              }
            }
          } 
          // 2. CommonJS Requires & Variable Reassignments
          else if (node.type === 'VariableDeclarator') {
            // Check for require()
            if (
              node.init &&
              node.init.type === 'CallExpression' &&
              node.init.callee?.name === 'require' &&
              node.init.arguments[0]?.value === '@fajarnugraha37/ts-rex'
            ) {
              if (node.id.type === 'ObjectPattern') {
                // const { rx: myRx } = require('ts-rex')
                for (const prop of node.id.properties) {
                  if (prop.key?.name === 'rx') {
                    rxAliases.add(prop.value?.name || 'rx');
                  }
                }
              } else if (node.id.type === 'Identifier') {
                // const rex = require('ts-rex')
                moduleAliases.add(node.id.name);
              }
            }

            // Check for variable reassignments (e.g., const r = rx;)
            if (node.init && node.id.type === 'Identifier') {
              if (node.init.type === 'Identifier') {
                if (rxAliases.has(node.init.name)) {
                  rxAliases.add(node.id.name);
                } else if (moduleAliases.has(node.init.name)) {
                  moduleAliases.add(node.id.name);
                }
              } 
              // Check for namespace member assignments (e.g., const rFunc = rex.rx;)
              else if (node.init.type === 'MemberExpression') {
                if (node.init.object?.type === 'Identifier' && moduleAliases.has(node.init.object.name)) {
                  if (node.init.property?.type === 'Identifier' && node.init.property.name === 'rx') {
                    rxAliases.add(node.id.name);
                  }
                }
              }
            }
          }
        }
      });

      const rxAliasArr = Array.from(rxAliases);
      const modAliasArr = Array.from(moduleAliases);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      walk(ast as any, {
        enter(node: any) {
          if (
            node.type === 'CallExpression' &&
            node.callee.type === 'MemberExpression' &&
            node.callee.property.type === 'Identifier' &&
            node.callee.property.name === 'compile'
          ) {
            
            const snippet = code.slice(node.start, node.end);
            
            // Check if snippet starts with any known direct alias (e.g. myRx()...)
            // or any namespace alias (e.g. rex.rx()...)
            const isDirectMatch = rxAliasArr.some(alias => snippet.startsWith(`${alias}(`) || snippet.includes(`.${alias}(`) || snippet.includes(`${alias}.`));
            const isNamespaceMatch = modAliasArr.some(alias => snippet.startsWith(`${alias}.`) || snippet.includes(`.${alias}.`));

            if (isDirectMatch || isNamespaceMatch) {
              const builderSnippet = snippet.replace(/\.compile\(\)\s*$/, '');
              
              try {
                // --- STATIC EVALUATION SANDBOX ---
                const paramNames = [...rxAliasArr, ...modAliasArr];
                const paramValues = [
                  ...rxAliasArr.map(() => rx),
                  ...modAliasArr.map(() => ({ rx }))
                ];

                // eslint-disable-next-line no-new-func
                const fn = new Function(...paramNames, `return ${builderSnippet};`);
                const builder = fn(...paramValues);
                
                const pattern = builder._buildPattern(builder.chunks);
                const flags = builder._getFlagsString();
                const groupNames = Array.from(new Set(builder._extractCaptureNames(builder.chunks)));
                const hasIndices = builder._flags.hasIndices === true;
                const isGlobal = builder._flags.global === true;
                const isSticky = builder._flags.sticky === true;
                const isUnicode = builder._flags.unicode === true || builder._flags.unicodeSets === true;

                const hydrateCall = `__tsRexHydrate(
  ${JSON.stringify(pattern)},
  ${JSON.stringify(flags)},
  ${JSON.stringify(groupNames)},
  ${hasIndices},
  ${isGlobal},
  ${isSticky},
  ${isUnicode}
)`;

                s.overwrite(node.start, node.end, hydrateCall);
                isTransformed = true;
                needsImport = true;
                this.skip();
              } catch (e) {
                if (options?.strict) {
                  throw new Error(`[unplugin-ts-rex] Failed to statically evaluate regex chain in ${id}:\n${snippet}\nReason: ${(e as Error).message}`);
                }
              }
            }
          }
        }
      });

      if (!isTransformed) {
        return null;
      }

      if (needsImport) {
        s.prepend(`import { hydrateRegex as __tsRexHydrate } from '@fajarnugraha37/ts-rex';\n`);
      }

      return {
        code: s.toString(),
        map: s.generateMap({ source: id, includeContent: true }),
      };
    },
  };
});
