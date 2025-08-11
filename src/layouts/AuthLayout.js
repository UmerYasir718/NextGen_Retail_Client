import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "../assets/Logo_new.png";
import LogoBg from "../assets/Logo_bg.png";
// Import the background image when available
// import InventoryBg from "../assets/backgrounds/inventory-bg.png";

const AuthLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image for Login/Signup */}
      <div className="absolute inset-0 z-0">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>

        {/* Image Background - Update this URL with your chosen image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Overlay to improve text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-blue-900/50"></div>

        {/* NOTE: Once you download and save your preferred image, */}
        {/* uncomment the import at the top and replace the URL above with: */}
        {/* backgroundImage: `url(${InventoryBg})` */}
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div
          className="text-center mb-2"
          style={{
            backgroundColor: "rgba(69, 100, 171, 0.9)",
            borderRadius: "10px",
          }}
        >
          <img src={Logo} alt="NextGen Retail" className="h-32 mx-auto mb-0" />
          <hr className="border-dark" />

          <span className="text-start">
            <Outlet />
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
