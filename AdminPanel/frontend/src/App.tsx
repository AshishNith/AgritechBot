import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { CropsPage } from "./pages/CropsPage";
import { PlansPage } from "./pages/PlansPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LogsPage } from "./pages/LogsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/crops" element={<CropsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Route>
    </Route>
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);

export default App;

