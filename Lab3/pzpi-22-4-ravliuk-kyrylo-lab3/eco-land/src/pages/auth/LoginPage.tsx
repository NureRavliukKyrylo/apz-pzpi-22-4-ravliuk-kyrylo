import LoginLayout from "../../shared/layouts/auth/LoginLayout";
import { LoginForm } from "../../features/auth/ui/LoginForm";

const LoginPage = () => {
  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
};

export default LoginPage;
