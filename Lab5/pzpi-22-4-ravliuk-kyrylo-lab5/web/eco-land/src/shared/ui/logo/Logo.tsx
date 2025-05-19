import { NavLink } from "react-router-dom";
import styles from "./Logo.module.scss";

type LogoProps = {
  label: string;
  to: string;
};

export const Logo = ({ label, to }: LogoProps) => (
  <NavLink to={to} className={styles.link}>
    <div className={styles.logo}>
      <span className={styles.icon}></span>
      {label}
    </div>
  </NavLink>
);
