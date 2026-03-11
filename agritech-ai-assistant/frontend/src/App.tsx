import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHome, FiMessageSquare, FiShoppingBag, FiUser, FiCamera } from 'react-icons/fi';
import { RiPlantLine } from 'react-icons/ri';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Diagnosis from './pages/Diagnosis';
import Products from './pages/Products';
import Profile from './pages/Profile';

function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="relative flex flex-col h-screen bg-background-light overflow-hidden">
            {/* Desktop Top Navbar — hidden on mobile */}
            <header className="hidden lg:flex items-center justify-between border-b border-primary/10 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-8 xl:px-20 py-4">
                <NavLink to="/" className="flex items-center gap-3 text-primary">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white">
                        <RiPlantLine size={20} />
                    </div>
                    <h2 className="text-slate-900 text-xl font-black tracking-tight">Anaaj AI</h2>
                </NavLink>
                <nav className="flex items-center gap-8">
                    <DesktopNavItem to="/dashboard" label="Home" />
                    <DesktopNavItem to="/chat" label="AI Chat" />
                    <DesktopNavItem to="/diagnosis" label="Diagnosis" />
                    <DesktopNavItem to="/products" label="Marketplace" />
                    <DesktopNavItem to="/profile" label="Profile" />
                </nav>
                <div className="flex items-center gap-3">
                    <button className="flex w-10 h-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        🔔
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        RP
                    </div>
                </div>
            </header>

            {/* Mobile Home header */}
            {location.pathname === '/dashboard' && (
                <header className="lg:hidden flex items-center bg-white p-4 sticky top-0 z-50 backdrop-blur-md border-b border-primary/10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        RP
                    </div>
                    <div className="flex-1 ml-3">
                        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Namaste Ramesh 👋</h2>
                        <p className="text-primary text-xs font-medium">Ludhiana, Punjab</p>
                    </div>
                    <button className="flex w-10 h-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        🔔
                    </button>
                </header>
            )}

            {/* Main content */}
            <div className="flex-1 min-h-0 flex flex-col pb-20 lg:pb-0 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 min-h-0 flex flex-col"
                    >
                        <Routes location={location}>
                            <Route path="/dashboard" element={<Home />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/diagnosis" element={<Diagnosis />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Bottom Navigation — hidden on desktop */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-primary/10 flex justify-around items-center px-4 pb-4 pt-2 z-50">
                <MobileNavItem to="/dashboard" icon={<FiHome size={20} />} label="Home" />
                <MobileNavItem to="/chat" icon={<FiMessageSquare size={20} />} label="Chat" />
                <MobileNavItem to="/diagnosis" icon={<FiCamera size={20} />} label="Scan" />
                <MobileNavItem to="/products" icon={<FiShoppingBag size={20} />} label="Market" />
                <MobileNavItem to="/profile" icon={<FiUser size={20} />} label="Profile" />
            </nav>
        </div>
    );
}

function DesktopNavItem({ to, label }: { to: string; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-slate-700 hover:text-primary'}`
            }
        >
            {label}
        </NavLink>
    );
}

function MobileNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-primary'}`
            }
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/*" element={<DashboardLayout />} />
            </Routes>
        </BrowserRouter>
    );
}
