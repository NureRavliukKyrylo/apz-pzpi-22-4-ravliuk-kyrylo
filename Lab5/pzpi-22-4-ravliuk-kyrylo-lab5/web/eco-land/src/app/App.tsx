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
import PrivateRoute from "./providers/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/stations"
          element={
            <PrivateRoute>
              <StationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/containers"
          element={
            <PrivateRoute>
              <ContainersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/sensors"
          element={
            <PrivateRoute>
              <SensorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/schedules"
          element={
            <PrivateRoute>
              <SchedulesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/map"
          element={
            <PrivateRoute>
              <MapPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
