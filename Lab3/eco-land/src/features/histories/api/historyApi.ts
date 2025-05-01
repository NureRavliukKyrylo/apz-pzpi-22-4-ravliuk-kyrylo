import { History } from "entities/history/wasteHistoryTypes";
import { apiClient } from "shared/api/apiClient";

export const historyApi = {
  getAllHistories: async (): Promise<History[]> => {
    const response = await apiClient.get<History[]>("/wasteHistories/");
    return response.data;
  },
  downloadReport: async (startDate: string, endDate: string): Promise<Blob> => {
    try {
      const response = await apiClient.post(
        "/get_report",
        {
          start_date: startDate,
          end_date: endDate,
        },
        {
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Не вдалося завантажити звіт.");
      }

      return response.data;
    } catch (error) {
      console.error("Помилка при завантаженні звіту:", error);
      throw error;
    }
  },
  downloadReportContainer: async (
    startDate: string,
    endDate: string
  ): Promise<Blob> => {
    try {
      const response = await apiClient.post(
        "/get_report_waste",
        {
          start_date: startDate,
          end_date: endDate,
        },
        {
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Не вдалося завантажити звіт.");
      }

      return response.data;
    } catch (error) {
      console.error("Помилка при завантаженні звіту:", error);
      throw error;
    }
  },
};
