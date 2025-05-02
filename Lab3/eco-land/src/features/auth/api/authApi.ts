import { UserResponse } from "../../../entities/user/types";
import { apiClient } from "../../../shared/api/apiClient";

type LoginData = { username: string; password: string };

export const authApi = {
  login: async (data: LoginData): Promise<UserResponse> => {
    const res = await apiClient.post<UserResponse>("/login-web/", data);
    return res.data;
  },
  myself: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/customers/myself/`);
    return response.data;
  },
  setCsrf: async () => {
    const response = await apiClient.get(`/set-scrf/`);
    return response.data;
  },
};
