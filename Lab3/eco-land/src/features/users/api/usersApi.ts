import { User } from "../../../entities/user/types";
import { apiClient } from "../../../shared/api/apiClient";
import { UpdateRoleResponse } from "entities/role/roleTypes";

export const usersApi = {
  getCustomers: async (page: number): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/customers/?page=${page}`);
    return response.data;
  },
  updateRole: async (
    customerId: number,
    roleId: number
  ): Promise<UpdateRoleResponse> => {
    const response = await apiClient.patch<UpdateRoleResponse>(
      `/customers/${customerId}/update-role/`,
      { role: roleId }
    );
    return response.data;
  },
  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/customers/${userId}/`);
  },
};
