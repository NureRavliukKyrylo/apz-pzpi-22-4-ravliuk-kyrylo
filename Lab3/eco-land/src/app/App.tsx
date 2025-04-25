import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import AdminPage from "../pages/AdminPage";
import { JSX } from "react";
import UsersPage from "pages/users/UsersPage";
import { StationStatusesTable } from "features/stations/ui/StationStatusesTable";
import StationsPage from "pages/stations/StationsPage";
import { ContainersTable } from "features/containers/ui/ContainersTable";
import { NavigationMenuContainers } from "widgets/navigationManage/containers/NavigationMenuContainers";
import ContainersPage from "pages/containers/ContainersPage";

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
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/containers" element={<ContainersPage />} />
      </Routes>
    </Router>
  );
};

export default App;
