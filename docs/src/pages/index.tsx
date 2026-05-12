import type {ReactNode} from 'react';
import React, { useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import { Copy, Check, Terminal } from 'lucide-react';
import styles from './index.module.css';

// --------------------------------------------------------
// Copywriting Constants
// --------------------------------------------------------

const INSTALL_CMD = "bun add @fajarnugraha37/ts-rex";

const CODE_BENTO_1 = `const reg = rx()
  .capture('id', rx().digit())
  .compile();

// result.id is strictly inferred as string!
const result = reg.exec('5');`;

const CODE_BENTO_2 = `// Safely compiles to [a\\-z], NOT a range!
rx().anyOf('a-z');

// Correct, type-safe composition:
rx().range('a', 'z');`;

const CODE_BENTO_3 = `// Global match returns an IterableIterator
const matches = pattern.global().compile();

// LastIndex will never leak! Completely stateless.
for (const match of matches.exec('...')) {}`;

const CODE_BENTO_4 = `// No heavy JS engines, just pure standard RegExp.
const nativeRegex = rx().literal('fast').compile().native;

nativeRegex.test('fast'); // true`;

const CODE_DEEP_1 = `import { rx } from '@fajarnugraha37/ts-rex';

const b = rx()
  .capture('a', rx().literal('A'))
  .or(rx().capture('b', rx().literal('B')))
  .compile();

const result = b.exec('A');
if (result.isMatch) {
  // TS enforces mutual exclusivity
  // If 'a' exists, 'b' is undefined, and vice versa.
  console.log(result.a); 
}`;

const CODE_DEEP_2 = `const domainChars = rx()
  .range('a', 'z')
  .or(rx().range('0', '9'))
  .or(rx().anyOf('.-'));

const urlParser = rx()
  .startOfInput()
  .literal('https://')
  // Pass the composed class cleanly
  .capture('domain', rx().oneOrMore(domainChars)) 
  .endOfInput()
  .compile();`;

const CODE_DEEP_3 = `// Inject ES2024 'v' flag and 'd' indices flag
const b = rx()
  .capture('val', rx().unicodeProperty('Emoji'))
  .unicodeSets()
  .withIndices()
  .compile();

const result = b.exec('🔥');
// Automatically maps match.indices back to the result!
console.log(result.indices.val); // [0, 2]`;

// --------------------------------------------------------
// Components
// --------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={styles.btnInstall} onClick={handleCopy} aria-label="Copy install command">
      <Terminal size={18} opacity={0.6} />
      <span>{text}</span>
      {copied ? <Check size={16} color="var(--ifm-color-success)" /> : <Copy size={16} opacity={0.6} />}
    </button>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Type-Safe Regex"
      description="Drizzle-inspired, fluent-API Regex builder for modern TypeScript.">
      
      <div className={styles.landingPage}>
        {/* Ambient Glows */}
        <div className={clsx(styles.glowOrb, styles.glowTop)} />
        <div className={clsx(styles.glowOrb, styles.glowRight)} />

        {/* 1. Hero Section */}
        <section className={styles.hero}>
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <span className={styles.heroEyebrow}>Zero dependencies. 100% Type-Safe.</span>
            <h1 className={styles.heroTitle}>
              Type-Safe Regex <br/>
              <span className={styles.heroTitleGradient}>without the headache.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Drizzle-inspired, fluent-API Regex builder for modern TypeScript. Automatically infers named capture groups, ensures stateless execution, and compiles to native RegExp.
            </p>
            <div className={styles.heroActions}>
              <Link className={clsx("button button--lg", styles.btnPrimary)} to="/docs/intro">
                Read the Docs
              </Link>
              <CopyButton text={INSTALL_CMD} />
            </div>
          </div>
        </section>

        {/* 2. Core Principle Bento Grid */}
        <section className={styles.section}>
          <div className="text--center margin-bottom--xl">
            <span className={styles.sectionEyebrow}>Show, Don't Tell</span>
            <h2 className={styles.sectionTitle}>If it compiles, it matches.</h2>
            <p className={styles.sectionDesc} style={{ margin: '0 auto' }}>
              We believe regular expressions shouldn't feel like deciphering an ancient language. We bring the safety of modern ORMs to your regex engine.
            </p>
          </div>

          <div className={styles.bentoGrid}>
            <div className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <h3 className={styles.bentoTitle}>Static Type Inference</h3>
                <p className={styles.bentoDesc}>Named captures instantly become strongly-typed objects. No more <code>as string</code>.</p>
              </div>
              <div className={styles.bentoCode}>
                <CodeBlock language="typescript">{CODE_BENTO_1}</CodeBlock>
              </div>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <h3 className={styles.bentoTitle}>Automatic Escaping</h3>
                <p className={styles.bentoDesc}>We auto-escape special characters. You literally cannot inject a malformed string.</p>
              </div>
              <div className={styles.bentoCode}>
                <CodeBlock language="typescript">{CODE_BENTO_2}</CodeBlock>
              </div>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <h3 className={styles.bentoTitle}>Stateless Execution</h3>
                <p className={styles.bentoDesc}>Global regex iteration in JS is notoriously buggy. We instantiate fresh wrappers natively.</p>
              </div>
              <div className={styles.bentoCode}>
                <CodeBlock language="typescript">{CODE_BENTO_3}</CodeBlock>
              </div>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <h3 className={styles.bentoTitle}>Zero Dependencies</h3>
                <p className={styles.bentoDesc}>No heavy runtime bloat. TS-Rex compiles down to pure, native JavaScript RegExp.</p>
              </div>
              <div className={styles.bentoCode}>
                <CodeBlock language="typescript">{CODE_BENTO_4}</CodeBlock>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Deep Dive Sections */}
        <section className={styles.section}>
          <div className={styles.deepDive}>
            
            {/* Deep Dive 1: Hype Feature */}
            <div className={styles.deepDiveRow}>
              <div className={styles.deepDiveText}>
                <span className={styles.sectionEyebrow}>Our most powerful feature</span>
                <h3 className={styles.deepDiveTitle}>Deep Optionality & Union Types</h3>
                <p className={styles.deepDiveDesc}>
                  Regex union types and optional groups are incredibly hard to type correctly. We built a meta-programming engine that traverses your AST at compile time to apply <code>Partial&lt;T&gt;</code> and Union types automatically.
                  <br/><br/>
                  Wrap any capture in <code>.optional()</code> or <code>.or()</code>, and TypeScript instantly knows those variables might be undefined.
                </p>
              </div>
              <div className={styles.deepDiveCode}>
                <CodeBlock language="typescript">{CODE_DEEP_1}</CodeBlock>
              </div>
            </div>

            {/* Deep Dive 2 */}
            <div className={clsx(styles.deepDiveRow, styles.reverse)}>
              <div className={styles.deepDiveText}>
                <span className={styles.sectionEyebrow}>Modular Architecture</span>
                <h3 className={styles.deepDiveTitle}>Advanced Composition</h3>
                <p className={styles.deepDiveDesc}>
                  Monolithic regex strings are impossible to read or review in Pull Requests. TS-Rex lets you compose massive parsers out of tiny, unit-testable blocks. Combine and reuse patterns endlessly.
                </p>
              </div>
              <div className={styles.deepDiveCode}>
                <CodeBlock language="typescript">{CODE_DEEP_2}</CodeBlock>
              </div>
            </div>

            {/* Deep Dive 3 */}
            <div className={styles.deepDiveRow}>
              <div className={styles.deepDiveText}>
                <span className={styles.sectionEyebrow}>Bleeding Edge</span>
                <h3 className={styles.deepDiveTitle}>Modern ES2024 Support</h3>
                <p className={styles.deepDiveDesc}>
                  We fully support the newest ECMAScript regex features natively. Use the <code>v</code> flag for Unicode Sets and the <code>d</code> flag for Match Indices. TS-Rex will automatically type and extract the runtime index tuples for you!
                </p>
              </div>
              <div className={styles.deepDiveCode}>
                <CodeBlock language="typescript">{CODE_DEEP_3}</CodeBlock>
              </div>
            </div>

          </div>
        </section>

        {/* 4. Integrations */}
        <section className={styles.section}>
          <div className="text--center">
            <h2 className={styles.sectionTitle}>Ecosystem Ready</h2>
            <p className={styles.sectionDesc} style={{ margin: '0 auto 2rem auto' }}>
              Tested on the edge. Built to integrate anywhere.
            </p>
            <div className={styles.integrationGrid} style={{ justifyContent: 'center' }}>
              <div className={styles.integrationPill}>🟢 Bun Native</div>
              <div className={styles.integrationPill}>⚡ tsup Bundled</div>
              <div className={styles.integrationPill}>🦕 Deno Compatible</div>
              <div className={styles.integrationPill}>📦 ESM & CJS</div>
              <div className={styles.integrationPill}>✅ 100% Test Coverage</div>
            </div>
          </div>
        </section>

        {/* 5. Final CTA */}
        <section className={styles.footerCta}>
          <h2 className={styles.footerTitle}>Stop guessing your Regex.</h2>
          <p className={styles.sectionDesc} style={{ margin: '0 auto 2rem auto' }}>
            Experience the magic of static type inference and immutable pattern building.
          </p>
          <Link className={clsx("button button--lg", styles.btnPrimary)} to="/docs/intro">
            Get Started with TS-Rex
          </Link>
        </section>

      </div>
    </Layout>
  );
}
