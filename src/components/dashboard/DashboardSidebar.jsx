import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Briefcase, CreditCard, User, Settings, UserPlus,
    ChevronLeft, X, LogOut, Package, AlertCircle, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../../services/api';
import logo from '../../assets/logo.png';
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Our Services', icon: ShoppingBag },
    { id: 'sessions', label: 'Sessions', icon: Briefcase },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'disputes', label: 'Disputes', icon: AlertCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const DashboardSidebar = ({ activeTab, setActiveTab, userData, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearTokens();
        navigate('/');
    };

    // Add Create User item if admin
    const displayItems = [...NAV_ITEMS];
    if (userData?.email === 'isaac@gmail.com') {
        displayItems.push({ id: 'create-user', label: 'Create User', icon: UserPlus });
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? 'justify-center py-6' : 'justify-start py-8'} px-5 border-b border-slate-100 relative min-h-[104px]`}>
                <div className={`flex items-center ${collapsed ? 'gap-0' : 'gap-3.5'} w-full`}>
                    <img src={logo} alt="Waseet Logo" className="w-[48px] h-[48px] rounded-[12px] object-contain flex-shrink-0 transition-all duration-300 shadow-sm" />
                    {!collapsed && (
                        <div className="flex flex-col justify-center overflow-hidden flex-1">
                            <h1 className="text-[18px] font-bold text-[#3B82F6] leading-none tracking-tight truncate pb-1">Waseet</h1>
                            <p className="text-[12px] font-medium text-slate-500 truncate">
                                Welcome, {userData.firstName || 'User'} {userData.lastName || ''}
                            </p>
                        </div>
                    )}
                </div>
                {/* Collapse button — desktop only */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-6 h-6 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-400 shadow-sm z-10"
                >
                    <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                </button>
                {/* Close button — mobile only */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 z-10"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {displayItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'create-user') {
                                    navigate('/signup');
                                } else {
                                    setActiveTab(item.id);
                                }
                                setMobileOpen(false);
                            }}
                            className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-100'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all`}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col bg-white border-r border-slate-100 h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[260px]'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[260px] bg-white shadow-2xl z-50 lg:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default DashboardSidebar;
