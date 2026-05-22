import { NavLink, Outlet } from "react-router-dom";
import { NAV_ITEMS } from "../constants/navigation";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

export const AdminLayout = () => {
  const { admin, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        {/* Sidebar Header / Branding */}
        <div className="flex h-[69px] flex-col justify-center border-b border-slate-200 px-6">
          <img className="h-8 w-auto object-contain object-left" src="/assets/Footer Logo.png" alt="Anaaj.ai Logo" />
          <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Admin Dashboard</p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-1 flex-col gap-1.5 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 p-4">
          <Button variant="secondary" onClick={logout} className="w-full justify-center">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Logo */}
              <img className="h-8 w-auto object-contain md:hidden" src="/assets/Footer Logo.png" alt="Anaaj.ai Logo" />
              <div className="hidden h-6 w-px bg-slate-200 md:block" />
              <div>
                <p className="text-xs text-slate-400">Welcome back,</p>
                <h2 className="text-sm font-semibold text-slate-900 md:text-base">{admin?.name ?? "Super Admin"}</h2>
              </div>
            </div>
            <div className="md:hidden">
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Carousel */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden app-scrollbar">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

