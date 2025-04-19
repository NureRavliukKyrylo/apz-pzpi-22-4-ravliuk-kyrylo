import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import AdminPage from "../pages/AdminPage";
import { JSX } from "react";
import { NavigationMenu } from "widgets/navigationManage/NavigationMenu";
import UsersPage from "pages/users/UsersPage";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const accessToken = localStorage.getItem("access_token");
  return accessToken ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Router>
  );
};

export default App;
