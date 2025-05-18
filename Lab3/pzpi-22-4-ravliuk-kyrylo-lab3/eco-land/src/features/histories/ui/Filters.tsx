import { FC } from "react";
import { FilterSelect } from "shared/ui/filter/FilterOption";
import { DateRangePicker } from "./DateTimeRangePicker";
import { useTranslation } from "react-i18next";
import styles from "./Filters.module.scss";

interface Props {
  stations: { id: number; name: string }[];
  selectedStationId: number;
  onStationChange: (id: number) => void;
  dateRange: [Date | null, Date | null];
  onDateChange: (range: [Date | null, Date | null]) => void;
}

export const Filters: FC<Props> = ({
  stations,
  selectedStationId,
  onStationChange,
  dateRange,
  onDateChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.filtersBlock}>
        <FilterSelect
          options={stations}
          selectedValue={selectedStationId || 0}
          onChange={onStationChange}
          placeholder={t("chooseStation")}
        />
      </div>
      <DateRangePicker
        startDate={dateRange[0]}
        endDate={dateRange[1]}
        onChange={onDateChange}
      />
    </>
  );
};
