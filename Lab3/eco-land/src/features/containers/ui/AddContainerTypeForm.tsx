import { useState, useEffect } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { useAddContainerType } from "../model/useAddContainerType";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";
import styles from "./AddContainerTypeForm.module.scss";

type AddContainerTypeFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddContainerTypeForm = ({
  isOpen,
  onClose,
}: AddContainerTypeFormProps) => {
  const [typeName, setTypeName] = useState("");
  const [volume, setVolume] = useState<number | string>("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddContainerType();

  const handleAddType = async () => {
    if (typeName.trim() === "" || volume === "") {
      setError("All fields must be filled.");
      return;
    }

    mutate(
      {
        type_name_container: typeName,
        volume_container: Number(volume),
      },
      {
        onSuccess: () => {
          setTypeName("");
          setVolume("");
          clearError();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? "Failed to add container type.");
          } else {
            setError("An unexpected error occurred.");
          }
        },
      }
    );
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>Add New Container Type</h2>
        <input
          type="text"
          placeholder="Enter container type name"
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Enter volume"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddType}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? "Adding..." : "Add Type"}
        </button>
      </div>
    </ModalLayout>
  );
};
