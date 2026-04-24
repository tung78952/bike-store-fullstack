import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { AdminRoute, ProtectedRoute } from "./auth/RouteGuards";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import BrandsPage from "./pages/BrandsPage";
import CategoriesPage from "./pages/CategoriesPage";
import StaffsPage from "./pages/StaffsPage";
import StatisticsPage from "./pages/StatisticsPage";
import ProfilePage from "./pages/ProfilePage";
import AccessDeniedPage from "./pages/AccessDeniedPage";

function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/orders" element={<AppLayout><OrdersPage /></AppLayout>} />
        <Route path="/orders/:orderId" element={<AppLayout><OrderDetailPage /></AppLayout>} />
        <Route path="/customers" element={<AppLayout><CustomersPage /></AppLayout>} />
        <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/brands" element={<AppLayout><BrandsPage /></AppLayout>} />
        <Route path="/categories" element={<AppLayout><CategoriesPage /></AppLayout>} />
        <Route path="/staffs" element={<AppLayout><StaffsPage /></AppLayout>} />
        <Route path="/statistics" element={<AppLayout><StatisticsPage /></AppLayout>} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
