import { useEffect, useState } from "react";
import { stationApi } from "../api/stationsApi";
import { StationStatus } from "entities/station/stationTypes";
import { useUpdateStationStatus } from "../model/useUpdateStationStatus";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { Options } from "shared/ui/options/Options";
import styles from "./UpdateStationStatusForm.module.scss";
import { useTranslation } from "react-i18next";

type Props = {
  stationId: number;
  currentStatus: number;
  onClose: () => void;
};

export const UpdateStationStatusForm = ({
  stationId,
  currentStatus,
  onClose,
}: Props) => {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [statuses, setStatuses] = useState<StationStatus[]>([]);
  const { mutate, isPending } = useUpdateStationStatus();
  const { t } = useTranslation();

  useEffect(() => {
    stationApi.getAllStationStatuses().then(setStatuses);
  }, []);

  const options = statuses.map((status) => ({
    id: status.id,
    name: status.station_status_name,
  }));

  const handleSubmit = () => {
    mutate(
      { stationId, status_station: newStatus },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <h2>{t("changeStationStatus")}</h2>
      <Options
        options={options}
        selectedValue={newStatus}
        onChange={setNewStatus}
      />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? <SpinnerLoading /> : t("updateStationStatusButton")}
      </button>
    </div>
  );
};
