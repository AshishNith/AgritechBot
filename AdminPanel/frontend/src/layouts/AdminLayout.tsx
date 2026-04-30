import { NavLink, Outlet } from "react-router-dom";
import { NAV_ITEMS } from "../constants/navigation";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

export const AdminLayout = () => {
  const { admin, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-brand-700">Anaaj.ai</h1>
          <p className="text-xs text-slate-500">Admin Dashboard</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h2 className="text-base font-semibold text-slate-900">{admin?.name ?? "Admin"}</h2>
            </div>
            <div className="md:hidden">
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

