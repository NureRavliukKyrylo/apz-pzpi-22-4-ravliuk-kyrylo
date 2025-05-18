import { useState, useMemo } from "react";

type SortOrder = "asc" | "desc";

// Функція для доступу до значень у вкладених об'єктах
const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split(".");
  let value = obj;
  for (let key of keys) {
    value = value ? value[key] : undefined;
  }
  return value;
};

export const useSortableData = <T>(
  items: T[],
  defaultSortBy?: keyof T | string
) => {
  const [sortBy, setSortBy] = useState<keyof T | string | null>(
    defaultSortBy ?? null
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const sortedItems = useMemo(() => {
    if (!sortBy) return items;

    return [...items].sort((a, b) => {
      let aValue = getNestedValue(a, String(sortBy));
      let bValue = getNestedValue(b, String(sortBy));

      // Якщо значення є датами, конвертуємо їх у час
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      // Якщо значення рядкове, приводимо їх до нижнього регістру для коректного сортування
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      // Сортуємо числові значення
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Сортуємо рядки
      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [items, sortBy, sortOrder]);

  const requestSort = (key: keyof T | string) => {
    if (sortBy === key) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  return { sortedItems, sortBy, sortOrder, requestSort };
};
