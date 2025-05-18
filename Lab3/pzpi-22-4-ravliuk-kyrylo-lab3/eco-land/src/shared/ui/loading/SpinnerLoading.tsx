import styles from "./SpinnerLoading.module.scss";

type SpinnerProps = {
  centered?: boolean;
  overlay?: boolean;
};

export const SpinnerLoading = ({
  centered = false,
  overlay = false,
}: SpinnerProps) => {
  const classNames = [
    styles.spinnerWrapper,
    centered && styles.centered,
    overlay && styles.overlay,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div className={styles.spinner}></div>
    </div>
  );
};
