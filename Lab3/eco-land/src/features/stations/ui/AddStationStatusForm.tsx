import { useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import styles from "./AddStationStatusForm.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";
import { useAddStationStatus } from "../model/useAddStationStatus";
import { AxiosError } from "axios";

type AddStationStatusFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddStationStatusForm = ({
  isOpen,
  onClose,
}: AddStationStatusFormProps) => {
  const [statusName, setStatusName] = useState("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddStationStatus();

  const handleAddStatus = () => {
    if (statusName.trim() === "") {
      setError("Status name cannot be empty.");
      return;
    }

    mutate(statusName, {
      onSuccess: () => {
        clearError();
        setStatusName("");
        onClose();
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          const detail =
            error.response?.data?.error || error.response?.data?.message;
          setError(detail ?? "Failed to update status.");
        } else {
          setError("An unexpected error occurred.");
        }
      },
    });
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>Add New Station Status</h2>
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
