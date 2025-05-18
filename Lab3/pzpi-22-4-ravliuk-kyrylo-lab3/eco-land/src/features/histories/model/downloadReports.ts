import { historyApi } from "../api/historyApi";

const formatDate = (date: Date | null): string =>
  date ? date.toISOString().split("T")[0] : "";

export const downloadReport = async (
  startDate: Date | null,
  endDate: Date | null
) => {
  const from = formatDate(startDate);
  const to = formatDate(endDate);

  if (!from || !to) {
    alert("Будь ласка, виберіть діапазон дат перед завантаженням звіту.");
    return;
  }

  try {
    const file = await historyApi.downloadReport(from, to);
    const url = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "waste_history_report.pdf";
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Помилка при завантаженні звіту:", error);
    alert("Сталася помилка при завантаженні звіту.");
  }
};

export const downloadReportContainer = async (
  startDate: Date | null,
  endDate: Date | null
) => {
  const from = formatDate(startDate);
  const to = formatDate(endDate);

  if (!from || !to) {
    alert("Будь ласка, виберіть діапазон дат перед завантаженням звіту.");
    return;
  }

  try {
    const file = await historyApi.downloadReportContainer(from, to);
    const url = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "waste_history_container_report.pdf";
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Помилка при завантаженні контейнерного звіту:", error);
    alert("Сталася помилка при завантаженні звіту.");
  }
};
