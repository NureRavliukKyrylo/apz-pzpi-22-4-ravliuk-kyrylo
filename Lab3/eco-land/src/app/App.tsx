import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import AdminPage from "../pages/AdminPage";
import { JSX } from "react";

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
      </Routes>
    </Router>
  );
};

export default App;
