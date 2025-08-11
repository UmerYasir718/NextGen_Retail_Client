import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, refreshCurrentPlan } from "../redux/slices/authSlice";
import { selectCompany } from "../redux/slices/companySlice";
import { toast } from "react-toastify";
import companyAPI from "../utils/api/companyAPI";
import ChatbotToggle from "../components/ChatbotToggle";
import NotificationPanel from "../components/NotificationPanel";
import NotificationBell from "../components/notifications/NotificationBell";
import Logo from "../assets/Logo_new.png";
import PasswordUpdateModal from "../components/PasswordUpdateModal";
import PlanBanner from "../components/PlanBanner";
import { usePlan } from "../utils/hooks/usePlan";
import {
  FaChevronDown,
  FaChevronRight,
  FaUser,
  FaKey,
  FaSignOutAlt,
  FaCrown,
  FaExclamationTriangle,
} from "react-icons/fa";

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

  warehouse: "🏪",
  zone: "📍",
  shelf: "📦",
  bin: "📦",
  forecasting: "📈",
  forecastingDashboard: "📊",
  shipment: "🚚",
  audit: "📋",
  uhf: "📡",
  stripe: "💳",
  chatbot: "💬",
  notifications: "🔔",
  logout: "🚪",
};

const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { companies, selectedCompany } = useSelector((state) => state.company);
  const { plan, isPlanExpired, isTrial, getTrialDaysRemaining } = usePlan();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeRoute, setActiveRoute] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  // Set active route when location changes
  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);

  // Auto-expand groups that contain the active route
  useEffect(() => {
    const navItems = getNavItems();
    navItems.forEach((group) => {
      const hasActiveRoute = group.items.some(
        (item) => item.path === activeRoute
      );
      if (hasActiveRoute) {
        setExpandedGroups((prev) => ({
          ...prev,
          [group.group]: true,
        }));
      }
    });
  }, [activeRoute, user?.role]); // user.role is needed because getNavItems depends on it

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const handleCompanyChange = async (e) => {
    const companyId = e.target.value;
    if (!companyId) {
      dispatch(selectCompany(null));
      return;
    }

    const company = companies.find((c) => c._id === companyId);
    if (company) {
      try {
        // Switch to the selected company's token
        const response = await companyAPI.switchCompanyToken(companyId);
        if (response.success) {
          // Store the new token
          localStorage.setItem("accessToken", response.token);
          // Update the selected company in Redux
          dispatch(selectCompany(company));
          toast.success(`Switched to ${company.name}`);

          // Refresh plan data for the new company
          try {
            await dispatch(refreshCurrentPlan());
          } catch (error) {
            console.error("Error refreshing plan after company switch:", error);
          }

          // Reload the page to apply the new token
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to switch company token:", error);
        toast.error("Failed to switch company");
      }
    }
  };

  // Toggle group expansion
  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest(".user-profile-dropdown")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  // Navigation items based on user role
  const getNavItems = () => {
    // Define all possible navigation items with their paths, names, and icons, grouped by category
    const allNavItems = [
      // Dashboard Group
      {
        group: "Dashboards",
        items: [
          {
            path: "/dashboard",
            name: "Dashboard",
            icon: icons.dashboard,
          },
          {
            path: "/admin-dashboard",
            name: "Admin Dashboard",
            icon: icons.adminDashboard,
          },
        ],
      },

      // Inventory Group
      {
        group: "Inventory",
        items: [
          {
            path: "/purchase-inventory",
            name: "Purchase Inventory",
            icon: icons.purchase,
          },
          {
            path: "/pending-sale-inventory",
            name: "Pending Sale",
            icon: icons.pendingSale,
          },
          {
            path: "/sale-inventory",
            name: "Sale Inventory",
            icon: icons.sale,
          },
          {
            path: "/low-stock-notifications",
            name: "Low Stock Alerts",
            icon: "⚠️",
          },
        ],
      },

      // Warehouse Group
      {
        group: "Warehouse",
        items: [
          {
            path: "/warehouse-management",
            name: "Warehouse Management",
            icon: icons.warehouse,
          },
          {
            path: "/zone-management",
            name: "Zone Management",
            icon: icons.zone,
          },
          {
            path: "/shelf-management",
            name: "Shelf Management",
            icon: icons.shelf,
          },
          {
            path: "/bin-management",
            name: "Bin Management",
            icon: icons.bin,
          },
        ],
      },

      // Forecasting Group
      {
        group: "Forecasting",
        items: [
          {
            path: "/forecasting-management",
            name: "Sale Forecasting",
            icon: icons.forecasting,
          },
          {
            path: "/forecasting-dashboard",
            name: "Forecasting Dashboard",
            icon: icons.forecastingDashboard,
          },
        ],
      },

      // Shipment Group
      {
        group: "Shipment",
        items: [
          {
            path: "/shipment-management",
            name: "Shipment Management",
            icon: icons.shipment,
          },
        ],
      },

      // Administration Group
      {
        group: "Administration",
        items: [
          {
            path: "/plan-management",
            name: "Plan Management",
            icon: icons.plan,
          },
          {
            path: "/plans",
            name: "Plans",
            icon: icons.planView,
          },
          {
            path: "/current-plan",
            name: "Current Plan",
            icon: "📋",
          },
          {
            path: "/user-management",
            name: "User Management",
            icon: icons.user,
          },
          {
            path: "/company-management",
            name: "Company Management",
            icon: icons.company,
          },
          {
            path: "/stripe-transactions",
            name: "Stripe Transactions",
            icon: icons.stripe,
          },
        ],
      },
    ];

    // Define route permissions based on App.js routes
    const routePermissions = {
      "/dashboard": ["company_admin", "company_user"],
      "/admin-dashboard": ["super_admin"],
      "/purchase-inventory": ["company_admin", "company_user"],
      "/pending-sale-inventory": ["company_admin", "company_user"],
      "/sale-inventory": ["company_admin", "company_user"],
      "/plan-management": ["super_admin"],
      "/plans": ["company_admin"],
      "/current-plan": ["company_admin", "company_user"],
      "/user-management": ["super_admin", "company_admin"],
      "/company-management": ["super_admin"],
      "/stripe-transactions": ["super_admin"],

      "/audit-logs": ["company_admin", "auditor"],
      "/uhf-management": ["company_admin", "store_manager"],
      // "/notification-demo": [
      //   "super_admin",
      //   "company_admin",
      //   "auditor",
      //   "store_manager",
      //   "analyst",
      // ],
      "/warehouse-management": ["company_admin", "company_user"],
      "/zone-management": ["company_admin", "company_user"],
      "/shelf-management": ["company_admin", "company_user"],
      "/bin-management": ["company_admin", "company_user"],
      "/forecasting-management": ["company_admin", "company_user"],
      "/forecasting-dashboard": ["company_admin", "company_user"],
    };

    // Filter nav items based on user role
    const userRole = user?.role || "";

    // Filter groups and their items based on user permissions
    return allNavItems
      .map((group) => {
        // Filter items within each group
        const filteredItems = group.items.filter((item) =>
          routePermissions[item.path]?.includes(userRole)
        );

        // Only include groups that have at least one accessible item
        return filteredItems.length > 0
          ? { ...group, items: filteredItems }
          : null;
      })
      .filter(Boolean); // Remove null groups
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
        <nav
          className="flex-1 overflow-y-auto py-2 custom-scrollbar"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(30, 64, 175, 0.6) rgba(30, 64, 175, 0.1)",
          }}
        >
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
              background-color: rgba(30, 64, 175, 0.1);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(30, 64, 175, 0.6);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: rgba(30, 64, 175, 0.8);
            }
          `}</style>
          {getNavItems().map((group, groupIndex) => {
            const isExpanded = expandedGroups[group.group] || false;

            return (
              <div key={`group-${groupIndex}`} className="mb-2">
                {/* Group Header - Clickable */}
                <div
                  className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-blue-800/30 transition-colors"
                  onClick={() => toggleGroup(group.group)}
                >
                  <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                    {group.group}
                  </h3>
                  <span className="text-blue-300">
                    {isExpanded ? (
                      <FaChevronDown size={12} />
                    ) : (
                      <FaChevronRight size={12} />
                    )}
                  </span>
                </div>

                {/* Group Items - Collapsible */}
                {isExpanded && (
                  <ul className="mt-1 mb-2">
                    {group.items.map((item) => (
                      <li key={item.path} className="px-4 py-0.5">
                        <Link
                          to={item.path}
                          className={`flex items-center space-x-3 p-2 rounded-md hover:bg-blue-800/50 transition-all ${
                            location.pathname === item.path
                              ? "bg-blue-800/70"
                              : ""
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
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
        {/* Plan Banner */}
        <PlanBanner />

        {/* Logo Watermark */}
        {/* <div className="absolute opacity-5 pointer-events-none w-full h-full flex items-center justify-center">
          <img src={Logo} alt="" className="w-1/3 max-w-xxl" />
        </div> */}
        {/* Top Navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            {/* Left Side - Mobile Menu & Company Selector */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-600 focus:outline-none"
              >
                ☰
              </button>

              {/* Company Selector (for super admin) */}
              {user && user.role === "super_admin" && (
                <div className="max-w-xs">
                  <select
                    className="form-input bg-gray-50"
                    value={selectedCompany ? selectedCompany._id : ""}
                    onChange={handleCompanyChange}
                  >
                    <option value="">Select Company</option>
                    {/* Show selected company first if exists */}
                    {selectedCompany && (
                      <option
                        value={selectedCompany._id}
                        className="font-semibold"
                      >
                        🏢 {selectedCompany.name} (Current)
                      </option>
                    )}
                    {/* Show other companies */}
                    {companies
                      .filter(
                        (company) =>
                          !selectedCompany ||
                          company._id !== selectedCompany._id
                      )
                      .map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Side - Plan Status, Notifications & User Profile */}
            <div className="flex items-center space-x-4">
              {/* Plan Status Badge */}
              {plan && user?.role !== "super_admin" && (
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                      isPlanExpired
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : isTrial()
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    {isPlanExpired ? (
                      <FaExclamationTriangle className="text-xs" />
                    ) : isTrial() ? (
                      <FaCrown className="text-xs" />
                    ) : (
                      <FaCrown className="text-xs" />
                    )}
                    <span className="hidden sm:inline">
                      {isPlanExpired
                        ? "Expired"
                        : isTrial()
                        ? `Trial (${getTrialDaysRemaining()}d)`
                        : plan.name}
                    </span>
                    <span className="sm:hidden">
                      {isPlanExpired
                        ? "Exp"
                        : isTrial()
                        ? `${getTrialDaysRemaining()}d`
                        : plan.name?.split(" ")[0]}
                    </span>
                  </div>
                </div>
              )}

              {/* Notification Panel */}
              <NotificationPanel />

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Profile */}
              <div className="flex items-center space-x-3 relative user-profile-dropdown">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role
                      .replace("_", " ")
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </p>
                </div>
                <div
                  className="h-10 w-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center cursor-pointer"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setShowPasswordModal(true);
                        setShowUserDropdown(false);
                      }}
                    >
                      <FaKey className="mr-2" />
                      Change Password
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>

        {/* Chatbot Toggle Component */}
        <ChatbotToggle />

        {/* Password Update Modal */}
        <PasswordUpdateModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          userId={user?._id}
          userName={user?.name}
        />
      </div>
    </div>
  );
};

export default MainLayout;
