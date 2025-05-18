import React from "react";
import styles from "./LoginLayout.module.scss";
type Props = {
  children: React.ReactNode;
};

const LoginLayout = ({ children }: Props) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>{children}</div>
    </div>
  );
};

export default LoginLayout;
