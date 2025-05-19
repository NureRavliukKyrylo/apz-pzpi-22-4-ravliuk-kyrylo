import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { AxiosError } from "axios";

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      roleId,
    }: {
      customerId: number;
      roleId: number;
    }) => usersApi.updateRole(customerId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Login error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response);

        if (
          error.response &&
          error.response.data &&
          error.response.data.detail
        ) {
        } else {
        }
      } else {
      }
    },
  });
};
