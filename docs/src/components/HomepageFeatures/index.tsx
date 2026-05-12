import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// Lucide Icons
import { Code2, Zap, ShieldCheck, Layers, PackageCheck, GitBranch } from 'lucide-react';

type FeatureItem = {
  title: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Static type inference',
    Icon: Code2,
    description: (
      <>
        Named captures are inferred directly from your builder chain at compile time. No type assertions, no surprises.
      </>
    ),
  },
  {
    title: 'Stateless execution',
    Icon: Zap,
    description: (
      <>
        Every <code>.exec()</code> call creates a fresh RegExp instance, making global-flag iteration safe and free of lastIndex bugs.
      </>
    ),
  },
  {
    title: 'Automatic escaping',
    Icon: ShieldCheck,
    description: (
      <>
        <code>.literal()</code> and <code>.anyOf()</code> auto-escape special characters. You cannot accidentally inject a malformed pattern.
      </>
    ),
  },
  {
    title: 'Deep optionality',
    Icon: Layers,
    description: (
      <>
        Quantifiers like <code>.optional()</code> automatically mark inner capture types as <code>string | undefined</code> in the result.
      </>
    ),
  },
  {
    title: 'Zero dependencies',
    Icon: PackageCheck,
    description: (
      <>
        Built entirely on standard TypeScript and native RegExp. Nothing extra is installed at runtime.
      </>
    ),
  },
  {
    title: 'Immutable builder',
    Icon: GitBranch,
    description: (
      <>
        Every method call returns a new RegexBuilder. You can safely branch a base pattern into multiple variations.
      </>
    ),
  },
];

function Feature({title, Icon, description}: FeatureItem) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIconWrapper}>
        <Icon className={styles.featureSvg} strokeWidth={2} />
      </div>
      <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.featuresSection}>
      {/* Background ambient glows */}
      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />
      
      <div className={styles.container}>
        <div className={styles.featureGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
