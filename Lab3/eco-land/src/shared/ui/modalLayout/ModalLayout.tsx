import { ReactNode } from "react";
import styles from "./ModalLayout.module.scss";

type ModalLayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const ModalLayout = ({
  isOpen,
  onClose,
  children,
}: ModalLayoutProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};
