import { Navigate } from "react-router-dom";
import { useAdminStatus } from "features/auth/model/useAdminStatus";
import { JSX } from "react";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import UsersLayout from "shared/layouts/users/UsersLayout";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { data: isAdmin, isLoading, isError } = useAdminStatus();

  if (isLoading) {
    return (
      <UsersLayout>
        <SpinnerLoading overlay></SpinnerLoading>
      </UsersLayout>
    );
  }

  if (isError || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
