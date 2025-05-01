import { FC } from "react";
import { FilterSelect } from "shared/ui/filter/FilterOption";
import { DateRangePicker } from "./DateTimeRangePicker";
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
}) => (
  <>
    <div className={styles.filtersBlock}>
      <FilterSelect
        options={stations}
        selectedValue={selectedStationId || 0}
        onChange={onStationChange}
        placeholder="Choose station"
      />
    </div>
    <DateRangePicker
      startDate={dateRange[0]}
      endDate={dateRange[1]}
      onChange={onDateChange}
    />
  </>
);
