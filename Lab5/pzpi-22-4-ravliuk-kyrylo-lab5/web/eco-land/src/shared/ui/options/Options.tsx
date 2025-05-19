import React from "react";
import styles from "./Options.module.scss";

type OptionsProps = {
  options: { id: number; name: string }[];
  selectedValue: number;
  onChange: (value: number) => void;
};

export const Options = ({ options, selectedValue, onChange }: OptionsProps) => {
  return (
    <div className={styles.container}>
      <select
        className={styles.select}
        value={selectedValue}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};
