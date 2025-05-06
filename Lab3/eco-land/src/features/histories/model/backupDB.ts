import { historyApi } from "../api/historyApi";

export const downloadBackupDB = async () => {
  try {
    const file = await historyApi.downloadBackup();
    const url = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "models_backup.json";
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Помилка при завантаженні звіту:", error);
    alert("Сталася помилка при завантаженні звіту.");
  }
};
