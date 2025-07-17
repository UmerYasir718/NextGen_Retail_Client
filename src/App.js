import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "./redux/slices/authSlice";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import PurchaseInventory from "./pages/inventory/PurchaseInventory";
import PendingSaleInventory from "./pages/inventory/PendingSaleInventory";
import SaleInventory from "./pages/inventory/SaleInventory";
import PlanManagement from "./pages/plans/PlanManagement";
import PlanView from "./pages/plans/PlanView";
import UserManagement from "./pages/management/UserManagement";
import CompanyManagement from "./pages/management/CompanyManagement";
import SystemManagement from "./pages/management/SystemManagement";
import WarehousesManagement from "./pages/management/WarehousesManagement";
import ForecastingManagement from "./pages/forecasting/ForecastingManagement";
import ForecastingDashboard from "./pages/forecasting/ForecastingDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ShipmentManagement from "./pages/shipment/ShipmentManagement";
import NotFound from "./pages/NotFound";

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check for stored user data on app initialization
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser && !isAuthenticated) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(loginSuccess({ user, accessToken: storedToken }));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Main App Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={<Dashboard />}
              allowedRoles={[
                "super_admin",
                "company_admin",
                "auditor",
                "store_manager",
                "analyst",
              ]}
            />
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              allowedRoles={["super_admin", "company_admin"]}
            />
          }
        />

        {/* Inventory Management */}
        <Route
          path="/purchase-inventory"
          element={
            <ProtectedRoute
              element={<PurchaseInventory />}
              allowedRoles={["super_admin", "company_admin", "store_manager"]}
            />
          }
        />
        <Route
          path="/pending-sale-inventory"
          element={
            <ProtectedRoute
              element={<PendingSaleInventory />}
              allowedRoles={["super_admin", "company_admin", "store_manager"]}
            />
          }
        />
        <Route
          path="/sale-inventory"
          element={
            <ProtectedRoute
              element={<SaleInventory />}
              allowedRoles={[
                "super_admin",
                "company_admin",
                "store_manager",
                "analyst",
              ]}
            />
          }
        />

        {/* Plan Management */}
        <Route
          path="/plan-management"
          element={
            <ProtectedRoute
              element={<PlanManagement />}
              allowedRoles={["super_admin", "company_admin"]}
            />
          }
        />
        <Route
          path="/plan-view"
          element={
            <ProtectedRoute
              element={<PlanView />}
              allowedRoles={["super_admin", "company_admin", "analyst"]}
            />
          }
        />

        {/* User & Company Management */}
        <Route
          path="/user-management"
          element={
            <ProtectedRoute
              element={<UserManagement />}
              allowedRoles={["super_admin", "company_admin"]}
            />
          }
        />
        <Route
          path="/company-management"
          element={
            <ProtectedRoute
              element={<CompanyManagement />}
              allowedRoles={["super_admin"]}
            />
          }
        />

        {/* System & Warehouse Management */}
        <Route
          path="/system-management"
          element={
            <ProtectedRoute
              element={<SystemManagement />}
              allowedRoles={["super_admin", "company_admin"]}
            />
          }
        />
        <Route
          path="/warehouse-management"
          element={
            <ProtectedRoute
              element={<WarehousesManagement />}
              allowedRoles={["super_admin", "company_admin", "store_manager"]}
            />
          }
        />

        {/* Forecasting */}
        <Route
          path="/forecasting-management"
          element={
            <ProtectedRoute
              element={<ForecastingManagement />}
              allowedRoles={["super_admin", "company_admin", "analyst"]}
            />
          }
        />
        <Route
          path="/forecasting-dashboard"
          element={
            <ProtectedRoute
              element={<ForecastingDashboard />}
              allowedRoles={["super_admin", "company_admin", "analyst"]}
            />
          }
        />

        {/* Shipment Management */}
        <Route
          path="/shipment-management"
          element={
            <ProtectedRoute
              element={<ShipmentManagement />}
              allowedRoles={["super_admin", "company_admin", "store_manager"]}
            />
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
