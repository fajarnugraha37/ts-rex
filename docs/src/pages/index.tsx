import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <Heading as="h1" className={styles.heroTitle}>
          <span className={styles.heroTitleGradient}>Type-Safe</span> Regex
          <br/>without the headache.
        </Heading>
        <p className={styles.heroSubtitle}>
          Drizzle-inspired, fluent-API Regex builder for modern TypeScript. <br/>
          Automatically infers named capture groups, ensures stateless execution, and compiles to native RegExp.
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx("button button--primary button--lg", styles.primaryBtn)}
            to="/docs/intro">
            Read the Docs
          </Link>
          <a
            className={clsx("button button--outline button--secondary button--lg margin-left--md", styles.secondaryBtn)}
            href="https://github.com/fajarnugraha37/ts-rex"
            target="_blank"
            rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Home | ${siteConfig.title}`}
      description="A TypeScript library for constructing regular expressions using a fluent builder API. Compile-time type safety for capturing groups.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
