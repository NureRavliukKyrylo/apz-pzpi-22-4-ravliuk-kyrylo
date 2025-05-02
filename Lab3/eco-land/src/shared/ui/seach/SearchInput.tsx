import React, { useEffect, useState } from "react";
import styles from "./SearchInput.module.scss";
import { useTranslation } from "react-i18next";

type SearchInputProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  debounceDelay?: number;
};

export const SearchInput = ({
  searchTerm,
  onSearchChange,
  debounceDelay = 300,
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(searchTerm);
  const { t } = useTranslation();

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localValue);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onSearchChange, debounceDelay]);

  return (
    <input
      className={styles.input}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={t("searching")}
    />
  );
};
