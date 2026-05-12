import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Static type inference',
    Svg: require('@site/static/img/type-inference.svg').default,
    description: (
      <>
        Named captures are inferred directly from your builder chain at compile time. No type assertions, no as string, no surprises.
      </>
    ),
  },
  {
    title: 'Stateless execution',
    Svg: require('@site/static/img/stateless.svg').default,
    description: (
      <>
        Every .exec() call creates a fresh RegExp instance, making global-flag iteration safe and free of lastIndex bugs.
      </>
    ),
  },
  {
    title: 'Automatic escaping',
    Svg: require('@site/static/img/escaping.svg').default,
    description: (
      <>
        .literal() and .anyOf() auto-escape special characters. You cannot accidentally inject a malformed pattern through these methods.
      </>
    ),
  },
  {
    title: 'Deep optionality',
    Svg: require('@site/static/img/optionality.svg').default,
    description: (
      <>
        Quantifiers like .optional() and .zeroOrMore() automatically mark inner capture types as string | undefined in the result.
      </>
    ),
  },
  {
    title: 'Zero dependencies',
    Svg: require('@site/static/img/dependencies.svg').default,
    description: (
      <>
        Built entirely on standard TypeScript and native RegExp. Nothing extra is installed at runtime.
      </>
    ),
  },
  {
    title: 'Immutable builder',
    Svg: require('@site/static/img/immutability.svg').default,
    description: (
      <>
        Every method call returns a new RegexBuilder instance. You can safely branch a base pattern into multiple variations without side effects.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center">
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
