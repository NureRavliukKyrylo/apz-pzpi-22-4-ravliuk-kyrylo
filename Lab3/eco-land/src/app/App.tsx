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
import { SensorsTable } from "features/sensors/ui/SensorsTable";
import SensorsPage from "pages/sensors/SensorsPage";
import { CollectionSchedulesTable } from "features/schedules/ui/CollectionSchedulesTable";
import SchedulesPage from "pages/schedules/SchedulesPage";
import MapWidget from "widgets/map/MapWidget";
import MapPage from "pages/map/MapPage";
import WasteHistoryWidget from "widgets/wasteHistory/WasteHistoryWidget";

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
        <Route path="/sensors" element={<SensorsPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/reports" element={<AdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;
