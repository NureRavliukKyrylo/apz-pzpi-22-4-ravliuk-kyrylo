import React, { FC } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./DateRangePicker.module.scss";
import moment from "moment";
import { useTranslation } from "react-i18next";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: [Date | null, Date | null]) => void;
}

const ranges: Record<string, [Date, Date]> = {
  Today: [moment().startOf("day").toDate(), moment().endOf("day").toDate()],
  Yesterday: [
    moment().subtract(1, "day").startOf("day").toDate(),
    moment().subtract(1, "day").endOf("day").toDate(),
  ],
  "Last 3 days": [
    moment().subtract(3, "days").startOf("day").toDate(),
    moment().endOf("day").toDate(),
  ],
  "This month": [
    moment().startOf("month").toDate(),
    moment().endOf("month").toDate(),
  ],
};

export const DateRangePicker: FC<Props> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleRangeSelect = (key: string) => {
    const [start, end] = ranges[key];
    onChange([start, end]);
  };

  return (
    <div className={styles.dateRangeWrapper}>
      <div className={styles.rangeButtons}>
        {Object.keys(ranges).map((label) => (
          <button
            key={label}
            className={styles.rangeButton}
            onClick={() => handleRangeSelect(label)}
            type="button"
          >
            {t(label)}
          </button>
        ))}
      </div>

      <DatePicker
        selected={startDate}
        onChange={(dates) => {
          const [start, end] = dates as [Date | null, Date | null];
          onChange([start, end]);
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        dateFormat="dd.MM.yyyy HH:mm"
        isClearable
        placeholderText={t("chooseRange")}
        className={styles.input}
      />
    </div>
  );
};
