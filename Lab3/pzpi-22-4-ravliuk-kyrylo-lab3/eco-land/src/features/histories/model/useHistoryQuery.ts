import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { History } from "entities/history/wasteHistoryTypes";
import { historyApi } from "../api/historyApi";

export const useHistoriesQuery = () => {
  const previousData = useRef<History[] | null>(null);

  const query = useQuery<History[]>({
    queryKey: ["histories"],
    queryFn: async () => {
      const histories = await historyApi.getAllHistories();
      previousData.current = histories;
      return histories;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
