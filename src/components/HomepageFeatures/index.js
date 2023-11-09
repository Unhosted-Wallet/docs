import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/E-Wallet-bro.svg').default,
    description: (
      <>
        Unhosted Smart Accounts can perform intricate logic and automated transactions, providing a programmability level absent in EOAs.
      </>
    ),
  },
  {
    title: 'Seamless Connectivity',
    Svg: require('@site/static/img/NFT-bro.svg').default,
    description: (
      <>
        Unhosted Smart Accounts facilitate direct interaction with other smart contracts, unlocking a realm of possibilities for decentralized applications and services.
      </>
    ),
  },
  {
    title: 'Powered by Biconomy',
    Svg: require('@site/static/img/Programmer-bro.svg').default,
    description: (
      <>
        Tailor your wallet by creating custom modules through Biconomy's modular design or employing Unhosted handlers to automate your unique strategies.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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
