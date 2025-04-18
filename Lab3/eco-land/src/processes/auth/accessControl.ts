import { authApi } from "../../features/auth/api/authApi";

export const CheckUserRole = async (
  roleId: number,
  expectedRole: string
): Promise<boolean> => {
  const userRole = await authApi.fetchRole(roleId);
  return userRole === expectedRole;
};
