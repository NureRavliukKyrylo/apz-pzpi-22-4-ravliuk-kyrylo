import { useEffect, useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import styles from "./AddStationForm.module.scss";
import { useAddStation } from "../model/useAddStation";
import { useErrorStore } from "entities/error/useErrorStore";
import { Options } from "shared/ui/options/Options";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type AddStationFormProps = {
  isOpen: boolean;
  onClose: () => void;
  statusOptions: { id: number; name: string }[];
  defaultLat?: number;
  defaultLng?: number;
};

export const AddStationForm = ({
  isOpen,
  onClose,
  statusOptions,
  defaultLat,
  defaultLng,
}: AddStationFormProps) => {
  const { t } = useTranslation();
  const [stationName, setStationName] = useState("");
  const [latitude, setLatitude] = useState<number | string>("");
  const [longitude, setLongitude] = useState<number | string>("");
  const [statusStation, setStatusStation] = useState<number | null>(null);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddStation();

  useEffect(() => {
    if (statusOptions.length > 0 && statusStation === null) {
      setStatusStation(statusOptions[0].id);
    }

    if (isOpen) {
      if (defaultLat !== undefined) setLatitude(defaultLat);
      if (defaultLng !== undefined) setLongitude(defaultLng);
    }
  }, [statusOptions, statusStation]);

  const handleAddStation = async () => {
    if (
      stationName.trim() === "" ||
      latitude === "" ||
      longitude === "" ||
      statusStation === null
    ) {
      setError(t("errorFillFields"));
      return;
    }

    mutate(
      {
        station_of_containers_name: stationName,
        latitude_location: Number(latitude),
        longitude_location: Number(longitude),
        status_station: statusStation,
      },
      {
        onSuccess: () => {
          setStationName("");
          setLatitude("");
          setLongitude("");
          setStatusStation(null);
          clearError();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? t("errorAddStation"));
          } else {
            setError(t("unexpectedError"));
          }
        },
      }
    );
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>{t("addNewStation")}</h2>
        <input
          type="text"
          placeholder={t("enterName")}
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder={t("enterLatitude")}
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder={t("enterLongitude")}
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className={styles.input}
        />
        {statusStation !== null && (
          <Options
            options={statusOptions}
            selectedValue={statusStation}
            onChange={setStatusStation}
          />
        )}
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddStation}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? t("adding") : t("addStationButton")}
        </button>
      </div>
    </ModalLayout>
  );
};
