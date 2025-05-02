import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../entities/user/authUserStore";
import { authApi } from "../api/authApi";
import { CheckUserRole } from "../../../processes/auth/accessControl";
import { useNavigate } from "react-router-dom";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  const { setError, clearError } = useErrorStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      login(data.user);
      console.log("Logged in user:", data);

      console.log("Checking user role:", data.user.role);

      const isAdmin = await CheckUserRole(data.user.role, "Admin");

      console.log("Is user an admin?", isAdmin);

      if (isAdmin) {
        const expiryTime = new Date().getTime() + 3600000;
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token_expiry", expiryTime.toString());

        navigate("/admin");
      } else {
        setError("U don't have permission of admin");
      }
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
          setError(error.response.data.detail);
        } else {
          setError("Failed to login");
        }
      } else {
        setError("Failed to login");
      }
    },
  });
};
