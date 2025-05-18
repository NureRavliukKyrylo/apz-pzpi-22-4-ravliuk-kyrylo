import styles from "./FilterSelect.module.scss";

type FilterSelectProps = {
  options: { id: number; name: string }[];
  selectedValue: number;
  onChange: (value: number) => void;
  placeholder?: string;
};

export const FilterSelect = ({
  options,
  selectedValue,
  onChange,
  placeholder,
}: FilterSelectProps) => {
  return (
    <select
      className={styles.select}
      value={selectedValue}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value={0}>{placeholder || "Choose Status"}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
};
