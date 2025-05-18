import { useState } from "react";

export const useFilters = () => {
  const [selectedStationId, setSelectedStationId] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  return {
    selectedStationId,
    setSelectedStationId,
    dateRange,
    setDateRange,
  };
};
