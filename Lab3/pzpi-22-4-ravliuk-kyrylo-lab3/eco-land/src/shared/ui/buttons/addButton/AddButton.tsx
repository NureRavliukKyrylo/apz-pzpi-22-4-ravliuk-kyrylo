import React from "react";
import styles from "./AddButton.module.scss";

type AddButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

export const AddButton = ({ onClick, children }: AddButtonProps) => {
  return (
    <button className={styles.addButton} onClick={onClick}>
      {children}
    </button>
  );
};
