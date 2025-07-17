import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { selectCompany } from "../redux/slices/companySlice";
import Chatbot from "../components/Chatbot";
import Logo from "../assets/Logo_new.png";

// Icons (using emoji as placeholders, you can replace with actual icons)
const icons = {
  dashboard: "📊",
  adminDashboard: "🏢",
  purchase: "🛒",
  pendingSale: "⏳",
  sale: "💰",
  plan: "📝",
  planView: "👁️",
  user: "👥",
  company: "🏭",
  system: "⚙️",
  warehouse: "🏪",
  forecasting: "📈",
  forecastingDashboard: "📊",
  shipment: "🚚",
  chatbot: "💬",
  logout: "🚪",
};

const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { companies, selectedCompany } = useSelector((state) => state.company);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const handleCompanyChange = (e) => {
    const companyId = parseInt(e.target.value);
    const company = companies.find((c) => c.id === companyId);
    dispatch(selectCompany(company));
  };

  // Navigation items based on user role
  const getNavItems = () => {
    console.log('Current user role:', user?.role);
    console.log('User object:', user);
    
    // Ensure user role is properly recognized
    const userRole = user?.role?.toLowerCase() || '';
    console.log('Normalized user role:', userRole);
    
    const items = [
      {
        path: "/dashboard",
        name: "Dashboard",
        icon: icons.dashboard,
        roles: [
          "super_admin",
          "company_admin",
          "auditor",
          "store_manager",
          "analyst",
        ],
      },
    ];

    // Admin Dashboard - only for admins
    if (["super_admin", "company_admin"].includes(userRole)) {
      items.push({
        path: "/admin-dashboard",
        name: "Admin Dashboard",
        icon: icons.adminDashboard,
        roles: ["super_admin", "company_admin"],
      });
    }

    // Inventory Management
    if (
      ["super_admin", "company_admin", "store_manager"].includes(userRole)
    ) {
      items.push({
        path: "/purchase-inventory",
        name: "Purchase Inventory",
        icon: icons.purchase,
        roles: ["super_admin", "company_admin", "store_manager"],
      });
      items.push({
        path: "/pending-sale-inventory",
        name: "Pending Sale",
        icon: icons.pendingSale,
        roles: ["super_admin", "company_admin", "store_manager"],
      });
    }

    items.push({
      path: "/sale-inventory",
      name: "Sale Inventory",
      icon: icons.sale,
      roles: ["super_admin", "company_admin", "store_manager", "analyst"],
    });

    // Plan Management
    if (["super_admin", "company_admin"].includes(userRole)) {
      items.push({
        path: "/plan-management",
        name: "Plan Management",
        icon: icons.plan,
        roles: ["super_admin", "company_admin"],
      });
    }

    items.push({
      path: "/plan-view",
      name: "Plan View",
      icon: icons.planView,
      roles: ["super_admin", "company_admin", "analyst"],
    });

    // User & Company Management
    if (["super_admin", "company_admin"].includes(userRole)) {
      items.push({
        path: "/user-management",
        name: "User Management",
        icon: icons.user,
        roles: ["super_admin", "company_admin"],
      });
    }

    if (userRole === "super_admin") {
      items.push({
        path: "/company-management",
        name: "Company Management",
        icon: icons.company,
        roles: ["super_admin"],
      });
    }

    // System & Warehouse Management
    if (["super_admin", "company_admin"].includes(userRole)) {
      items.push({
        path: "/system-management",
        name: "System Management",
        icon: icons.system,
        roles: ["super_admin", "company_admin"],
      });
    }

    if (
      ["super_admin", "company_admin", "store_manager"].includes(userRole)
    ) {
      items.push({
        path: "/warehouse-management",
        name: "Warehouse Management",
        icon: icons.warehouse,
        roles: ["super_admin", "company_admin", "store_manager"],
      });
    }

    // Forecasting
    if (["super_admin", "company_admin", "analyst"].includes(userRole)) {
      items.push({
        path: "/forecasting-management",
        name: "Forecasting Management",
        icon: icons.forecasting,
        roles: ["super_admin", "company_admin", "analyst"],
      });
      items.push({
        path: "/forecasting-dashboard",
        name: "Forecasting Dashboard",
        icon: icons.forecastingDashboard,
        roles: ["super_admin", "company_admin", "analyst"],
      });
    }

    // Shipment Management
    if (
      ["super_admin", "company_admin", "store_manager"].includes(userRole)
    ) {
      items.push({
        path: "/shipment-management",
        name: "Shipment Management",
        icon: icons.shipment,
        roles: ["super_admin", "company_admin", "store_manager"],
      });
    }

    return items;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transform fixed z-30 md:relative md:translate-x-0 transition duration-300 ease-in-out text-white h-full w-72 min-h-screen flex flex-col`}
        style={{
          background: "linear-gradient(180deg, #4b6cb7 0%, #182848 100%)",
        }}
      >
        {/* Logo - Fixed at top */}
        <div className="flex-shrink-0 flex items-center justify-center border-b border-white/30 py-4">
          <img src={Logo} alt="NextGen Retail" className="h-28" />
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute right-4 text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
          <ul>
            {getNavItems().map((item) => (
              <li key={item.path} className="px-4 py-1.5">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-2 rounded-md hover:bg-blue-800/50 transition-all ${
                    location.pathname === item.path ? "bg-blue-800/70" : ""
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-white/30 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-red-700 transition-all text-red-300 hover:text-white"
          >
            <span className="text-xl">{icons.logout}</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Logo Watermark */}
        {/* <div className="absolute opacity-5 pointer-events-none w-full h-full flex items-center justify-center">
          <img src={Logo} alt="" className="w-1/3 max-w-xxl" />
        </div> */}
        {/* Top Navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-600 focus:outline-none"
            >
              ☰
            </button>

            {/* Company Selector (for super admin) */}
            {user && user.role === "super_admin" && (
              <div className="flex-1 max-w-xs mx-4">
                <select
                  className="form-input bg-gray-50"
                  value={selectedCompany ? selectedCompany.id : ""}
                  onChange={handleCompanyChange}
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role.replace("_", " ")}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img
                  src={user?.profilePic || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>

        {/* Chatbot Component */}
        <Chatbot />
      </div>
    </div>
  );
};

export default MainLayout;
