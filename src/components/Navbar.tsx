import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const adminName = localStorage.getItem("name") || "Admin";

  const navItems = [
    { name: "Register", path: "/register" },
    { name: "Floor Station", path: "/station" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "🚨 Alerts", path: "/alerts" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold text-lg shadow-md">
            SV
          </div>
          <span className="text-lg font-semibold text-gray-800">
            SecureVisit Pro
          </span>
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-600 hover:text-blue-500"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Right: Admin login/logout */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-gray-600 text-sm hidden sm:block">
                👤 {adminName}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 text-sm font-medium hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
