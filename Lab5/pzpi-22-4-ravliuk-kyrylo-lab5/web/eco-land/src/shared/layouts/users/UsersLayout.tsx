import React from "react";
import styles from "./UsersLayout.module.scss";

type Props = {
  children: React.ReactNode;
};

const UsersLayout = ({ children }: Props) => {
  return <div className={styles.wrapper}>{children}</div>;
};

export default UsersLayout;
