import styles from "./Logo.module.scss";

type LogoProps = {
  label: string;
};

export const Logo = ({ label }: LogoProps) => (
  <div className={styles.logo}>
    <span className={styles.icon}></span>
    {label}
  </div>
);
