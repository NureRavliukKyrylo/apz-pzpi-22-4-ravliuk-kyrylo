import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalLayout } from "../../modalLayout/ModalLayout";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import styles from "./DeleteButton.module.scss";

type DeleteButtonProps = {
  id: number;
  deleteFn: (id: number) => Promise<void>;
  onSuccess?: () => void;
  buttonLabel?: string;
  label?: string;
  data?: string;
};

export const DeleteButton = ({
  id,
  deleteFn,
  onSuccess,
  buttonLabel,
  label = "item",
  data,
}: DeleteButtonProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsModalOpen(false);
      onSuccess?.();
    },
  });

  const handleConfirm = () => mutate();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={styles.button}
        disabled={isPending}
      >
        {isPending ? <SpinnerLoading /> : buttonLabel || t("delete")}
      </button>

      <ModalLayout isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalContent}>
          <p className={styles.modalMessage}>
            {t("deleteConfirmation", {
              label,
              data,
            })}
          </p>
          <div className={styles.actions}>
            <button
              onClick={handleConfirm}
              className={styles.confirmBtn}
              disabled={isPending}
            >
              {t("yes")}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className={styles.cancelBtn}
              disabled={isPending}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </ModalLayout>
    </>
  );
};
