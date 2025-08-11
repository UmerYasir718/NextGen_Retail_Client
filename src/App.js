import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "./redux/slices/authSlice";
import { NotificationProvider } from "./contexts/NotificationContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailVerification from "./pages/auth/EmailVerification";
import Dashboard from "./pages/Dashboard";
import PurchaseInventory from "./pages/inventory/PurchaseInventory";
import PendingSaleInventory from "./pages/inventory/PendingSaleInventory";
import SaleInventory from "./pages/inventory/SaleInventory";
import PlanManagement from "./pages/plans/PlanManagement";
import PlanView from "./pages/plans/PlanView";
import CurrentPlan from "./pages/plans/CurrentPlan";
import UserManagement from "./pages/management/UserManagement";
import CompanyManagement from "./pages/management/CompanyManagement";
import StripeTransactions from "./pages/management/StripeTransactions";

import WarehousesManagement from "./pages/management/WarehousesManagement";
import ZoneManagement from "./pages/warehouse/ZoneManagement";
import ShelfManagement from "./pages/warehouse/ShelfManagement";
import BinManagement from "./pages/warehouse/BinManagement";
import ForecastingManagement from "./pages/management/ForecastingManagement";
import ForecastingDashboard from "./pages/forecasting/ForecastingDashboard";
import LowStockNotifications from "./pages/notifications/LowStockNotifications";
import AdminDashboard from "./pages/AdminDashboard";
import ShipmentManagement from "./pages/shipment/ShipmentManagement";
import ShipmentDemo from "./pages/ShipmentDemo";
import AuditLogs from "./pages/management/AuditLogs";
import UHFManagement from "./pages/management/UHFManagement";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/payments/PaymentSuccess";
import PaymentCancel from "./pages/payments/PaymentCancel";
import ProfileSettings from "./pages/ProfileSettings";
import NotificationDemo from "./pages/NotificationDemo";

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role matches any allowed role (case-insensitive)
  // Try different possible role field names
  const userRole =
    user?.role?.toLowerCase() ||
    user?.userRole?.toLowerCase() ||
    user?.roleType?.toLowerCase() ||
    user?.type?.toLowerCase();
  const hasAccess = allowedRoles?.some(
    (role) => role.toLowerCase() === userRole
  );

  if (allowedRoles && !hasAccess) {
    console.log(
      "Access denied for route. User role:",
      user.role,
      "Allowed roles:",
      allowedRoles
    );
    console.log("Full user object:", user);
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
        console.log("Restoring auth state from localStorage:", user);
        dispatch(loginSuccess({ user, accessToken: storedToken }));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, isAuthenticated]);

  return (
    <NotificationProvider>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Public Routes */}
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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

          {/* Profile Settings */}
          <Route
            path="/profile-settings"
            element={
              <ProtectedRoute
                element={<ProfileSettings />}
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

          {/* Notification Demo */}
          <Route
            path="/notification-demo"
            element={
              <ProtectedRoute
                element={<NotificationDemo />}
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
            path="/plans"
            element={
              <ProtectedRoute
                element={<PlanView />}
                allowedRoles={["super_admin", "company_admin", "analyst"]}
              />
            }
          />
          <Route
            path="/current-plan"
            element={
              <ProtectedRoute
                element={<CurrentPlan />}
                allowedRoles={["company_admin", "company_user"]}
              />
            }
          />
          <Route
            path="/plans/:planId"
            element={
              <ProtectedRoute
                element={<PlanView />}
                allowedRoles={["super_admin", "company_admin"]}
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
          <Route
            path="/stripe-transactions"
            element={
              <ProtectedRoute
                element={<StripeTransactions />}
                allowedRoles={["super_admin"]}
              />
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute
                element={<AuditLogs />}
                allowedRoles={["super_admin", "company_admin", "auditor"]}
              />
            }
          />
          <Route
            path="/uhf-management"
            element={
              <ProtectedRoute
                element={<UHFManagement />}
                allowedRoles={["super_admin", "company_admin", "store_manager"]}
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
          <Route
            path="/zone-management"
            element={
              <ProtectedRoute
                element={<ZoneManagement />}
                allowedRoles={["super_admin", "company_admin", "store_manager"]}
              />
            }
          />
          <Route
            path="/shelf-management"
            element={
              <ProtectedRoute
                element={<ShelfManagement />}
                allowedRoles={["super_admin", "company_admin", "store_manager"]}
              />
            }
          />
          <Route
            path="/bin-management"
            element={
              <ProtectedRoute
                element={<BinManagement />}
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

          {/* Notifications */}
          <Route
            path="/low-stock-notifications"
            element={
              <ProtectedRoute
                element={<LowStockNotifications />}
                allowedRoles={[
                  "super_admin",
                  "company_admin",
                  "store_manager",
                  "analyst",
                ]}
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
          <Route
            path="/shipment-demo"
            element={
              <ProtectedRoute
                element={<ShipmentDemo />}
                allowedRoles={["super_admin", "company_admin", "store_manager"]}
              />
            }
          />

          {/* Public payment result pages */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}

export default App;
