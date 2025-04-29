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
  stationOptions: { id: number; name: string }[];
  typeOptions: { id: number; name: string }[];
  statusOptions: { id: number; name: string }[];
};

export const AddContainerForm = ({
  isOpen,
  onClose,
  stationOptions,
  typeOptions,
  statusOptions,
}: AddContainerFormProps) => {
  const [selectedStationId, setSelectedStationId] = useState<number | null>(
    null
  );
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddContainer();

  useEffect(() => {
    if (stationOptions.length > 0 && selectedStationId === null) {
      setSelectedStationId(stationOptions[0].id);
    }
    if (typeOptions.length > 0 && selectedTypeId === null) {
      setSelectedTypeId(typeOptions[0].id);
    }
    if (statusOptions.length > 0 && selectedStatusId === null) {
      setSelectedStatusId(statusOptions[0].id);
    }
  }, [
    stationOptions,
    typeOptions,
    statusOptions,
    selectedStationId,
    selectedTypeId,
    selectedStatusId,
  ]);

  const handleAddContainer = async () => {
    if (
      selectedStationId === null ||
      selectedTypeId === null ||
      selectedStatusId === null
    ) {
      setError("All fields must be filled.");
      return;
    }

    mutate(
      {
        station_id: selectedStationId,
        type_of_container_id: selectedTypeId,
        status_container_id: selectedStatusId,
      },
      {
        onSuccess: () => {
          setSelectedStationId(null);
          setSelectedTypeId(null);
          setSelectedStatusId(null);
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

        {selectedStationId !== null && (
          <Options
            options={stationOptions}
            selectedValue={selectedStationId}
            onChange={setSelectedStationId}
          />
        )}

        {selectedTypeId !== null && (
          <Options
            options={typeOptions}
            selectedValue={selectedTypeId}
            onChange={setSelectedTypeId}
          />
        )}

        {selectedStatusId !== null && (
          <Options
            options={statusOptions}
            selectedValue={selectedStatusId}
            onChange={setSelectedStatusId}
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
