import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Briefcase, CreditCard, User, Settings, UserPlus,
    ChevronLeft, X, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../../services/api';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: ShoppingBag },
    { id: 'sessions', label: 'Sessions', icon: Briefcase },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
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
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-5 py-6 border-b border-slate-100`}>
                <div className="flex items-center gap-2.5">
                    <div className="bg-[#3b96d7] p-2 rounded-lg shadow-sm flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8L8 16L12 8L16 16L20 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    {!collapsed && <span className="text-[#3b96d7] text-xl font-bold tracking-tight">Waseet</span>}
                </div>
                {/* Collapse button — desktop only */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                >
                    <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                </button>
                {/* Close button — mobile only */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                >
                    <X size={18} />
                </button>
            </div>

            {/* User Info */}
            {!collapsed && (
                <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3b96d7] to-[#2870a8] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(userData.firstName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                                {userData.firstName || 'User'} {userData.lastName || ''}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{userData.email || ''}</p>
                        </div>
                    </div>
                </div>
            )}
            {collapsed && (
                <div className="flex justify-center py-4 border-b border-slate-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3b96d7] to-[#2870a8] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {(userData.firstName || 'U').charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

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
