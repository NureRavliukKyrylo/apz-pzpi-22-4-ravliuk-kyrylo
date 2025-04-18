import { UserResponse } from "../../../entities/user/types";
import { apiClient } from "../../../shared/api/apiClient";

type LoginData = { username: string; password: string };

export const authApi = {
  login: async (data: LoginData): Promise<UserResponse> => {
    const res = await apiClient.post<UserResponse>("/login", data);
    return res.data;
  },
  fetchRole: async (roleId: number) => {
    const response = await apiClient.get(`/roleUsers/${roleId}/`);
    return response.data.name;
  },
  myself: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/customers/myself/`);
    return response.data;
  },
};
