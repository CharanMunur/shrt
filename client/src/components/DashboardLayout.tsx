import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Link2,
  BarChart3,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { useAuth } from "../context/AuthContext.js";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/shorten", label: "Shorten Link", icon: PlusCircle },
  { to: "/dashboard/links", label: "My Links", icon: Link2 },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/qrcodes", label: "QR Codes", icon: QrCode },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row text-primary">
      {/* Desktop Sidebar (Fixed in Viewport with subtle border separation) */}
      <aside className="hidden md:flex flex-col w-60 p-5 bg-sidebar border-r border-subtle shrink-0 justify-between h-screen fixed top-0 left-0 bottom-0 z-30 select-none overflow-y-auto">
        <div>
          <div className="mb-7 px-2 flex items-center justify-between">
            <BrandLogo to="/dashboard" />
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-surface-2 text-primary font-semibold shadow-xs"
                        : "text-alt hover:text-primary hover:bg-surface-2/60"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User bar & Theme switch */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between px-2 text-[11px] text-muted">
            <span>Theme</span>
            <ThemeToggle compact />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-2 border border-subtle transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary text-canvas text-xs font-semibold flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <span className="text-xs font-medium text-primary truncate max-w-[100px]" title={user?.username}>
                {user?.username}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-7 h-7 rounded-lg text-alt hover:text-rose-500 hover:bg-surface-3 flex items-center justify-center transition-colors shrink-0"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-6 h-16 bg-sidebar border-b border-subtle sticky top-0 z-30">
        <BrandLogo to="/dashboard" />
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full bg-surface-2 border border-subtle flex items-center justify-center text-primary"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-sidebar p-6 flex flex-col justify-between">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive ? "bg-surface-2 text-primary font-semibold" : "text-alt"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-3 bg-surface-2 border border-subtle rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary text-canvas text-xs font-semibold flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <span className="text-xs font-medium text-primary">{user?.username}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-alt hover:text-rose-500 font-medium inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (Scrolls independently) */}
      <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto w-full md:ml-60">
        <Outlet />
      </main>
    </div>
  );
}
