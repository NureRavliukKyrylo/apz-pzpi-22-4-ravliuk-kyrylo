import { useState, useEffect } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { useAddContainerStatus } from "../model/useAddContainerStatus";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";
import styles from "./AddContainerStatusForm.module.scss";

type AddContainerStatusFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddContainerStatusForm = ({
  isOpen,
  onClose,
}: AddContainerStatusFormProps) => {
  const [statusName, setStatusName] = useState("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddContainerStatus();

  const handleAddStatus = async () => {
    if (statusName.trim() === "") {
      setError("Status name is required.");
      return;
    }

    mutate(statusName, {
      onSuccess: () => {
        setStatusName("");
        clearError();
        onClose();
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          const detail =
            error.response?.data?.error || error.response?.data?.message;
          setError(detail ?? "Failed to add container status.");
        } else {
          setError("An unexpected error occurred.");
        }
      },
    });
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>Add New Container Status</h2>
        <input
          type="text"
          placeholder="Enter status name"
          value={statusName}
          onChange={(e) => setStatusName(e.target.value)}
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddStatus}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? "Adding..." : "Add Status"}
        </button>
      </div>
    </ModalLayout>
  );
};
