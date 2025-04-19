import { NavLink } from "react-router-dom";
import styles from "./navigationLink.module.scss";

type NavigationLinkProps = {
  to: string;
  label: string;
};

export const NavigationLink = ({ to, label }: NavigationLinkProps) => (
  <NavLink to={to} className={styles.link}>
    {label}
  </NavLink>
);
