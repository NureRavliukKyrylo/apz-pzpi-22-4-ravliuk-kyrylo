import { useState, useEffect } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { useAddContainer } from "../model/useAddContainer";
import { useErrorStore } from "entities/error/useErrorStore";
import { Options } from "shared/ui/options/Options";
import { AxiosError } from "axios";
import styles from "./AddContainerForm.module.scss";

type AddContainerFormProps = {
  isOpen: boolean;
  onClose: () => void;
  typeOptions: { id: number; name: string }[];
  statusOptions: { id: number; name: string }[];
};

export const AddContainerForm = ({
  isOpen,
  onClose,
  typeOptions,
  statusOptions,
}: AddContainerFormProps) => {
  const [containerName, setContainerName] = useState("");
  const [containerType, setContainerType] = useState<number | null>(null);
  const [containerStatus, setContainerStatus] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | string>("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddContainer();

  useEffect(() => {
    if (typeOptions.length > 0 && containerType === null) {
      setContainerType(typeOptions[0].id);
    }
    if (statusOptions.length > 0 && containerStatus === null) {
      setContainerStatus(statusOptions[0].id);
    }
  }, [typeOptions, statusOptions, containerType, containerStatus]);

  const handleAddContainer = async () => {
    if (
      containerName.trim() === "" ||
      volume === "" ||
      containerType === null ||
      containerStatus === null
    ) {
      setError("All fields must be filled.");
      return;
    }

    mutate(
      {
        container_name: containerName,
        type_of_container_id: containerType,
        status_container_id: containerStatus,
        volume_container: Number(volume),
      },
      {
        onSuccess: () => {
          setContainerName("");
          setContainerType(null);
          setContainerStatus(null);
          setVolume("");
          clearError();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? "Failed to add container.");
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
        <h2>Add New Container</h2>
        <input
          type="text"
          placeholder="Enter container name"
          value={containerName}
          onChange={(e) => setContainerName(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Enter volume"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className={styles.input}
        />
        {containerType !== null && (
          <Options
            options={typeOptions}
            selectedValue={containerType}
            onChange={setContainerType}
          />
        )}
        {containerStatus !== null && (
          <Options
            options={statusOptions}
            selectedValue={containerStatus}
            onChange={setContainerStatus}
          />
        )}
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddContainer}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? "Adding..." : "Add Container"}
        </button>
      </div>
    </ModalLayout>
  );
};
