import React from "react";
import { useHistoriesQuery } from "features/histories/model/useHistoryQuery";
import { useStationsQuery } from "features/stations/model/useStationsQuery";
import { useFilters } from "features/histories/model/useFilters";
import { Filters } from "features/histories/ui/Filters";
import { Chart } from "features/histories/ui/Chart";
import {
  downloadReport,
  downloadReportContainer,
} from "features/histories/model/downloadReports";
import { useTranslation } from "react-i18next";
import styles from "./WasteHistoryWidget.module.scss";
import { parseUtcDate } from "shared/utils/parseData";

const WasteHistoryWidget = () => {
  const { selectedStationId, setSelectedStationId, dateRange, setDateRange } =
    useFilters();
  const { data: stations = [] } = useStationsQuery();
  const { data: histories = [] } = useHistoriesQuery();
  const { t } = useTranslation();

  const stationOptions = stations?.map((s) => ({
    id: s.id,
    name: s.station_of_containers_name,
  }));

  const filtered = histories?.filter((h) => {
    const date = new Date(h.recycling_date);
    return (
      (!dateRange[0] || date >= dateRange[0]) &&
      (!dateRange[1] || date <= dateRange[1]) &&
      (!selectedStationId || h.station_id === selectedStationId)
    );
  });

  const chartData = filtered?.map((h) => ({
    date: parseUtcDate(h.recycling_date),
    amount: h.amount,
  }));

  return (
    <div className={styles.wasteWidget}>
      <h1>{t("adminDashboard")}</h1>
      <div className={styles.buttonFilterBlock}>
        <div className={styles.filterBlock}>
          <Filters
            stations={stationOptions ?? []}
            selectedStationId={selectedStationId}
            onStationChange={setSelectedStationId}
            dateRange={dateRange}
            onDateChange={setDateRange}
          />
        </div>
        <div className={styles.reportButtons}>
          <button onClick={() => downloadReport(dateRange[0], dateRange[1])}>
            {t("reportStations")}
          </button>
          <button
            onClick={() => downloadReportContainer(dateRange[0], dateRange[1])}
          >
            {t("reportContainers")}
          </button>
        </div>
      </div>

      <Chart data={chartData ?? []} />
    </div>
  );
};

export default WasteHistoryWidget;
