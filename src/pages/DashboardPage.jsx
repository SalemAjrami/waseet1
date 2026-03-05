import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Briefcase, CreditCard, User, Settings, UserPlus,
    ChevronLeft, X, LogOut, Wallet, Clock, CheckCircle, AlertCircle, Plus, Handshake,
    ArrowRight, Search, Loader2, Package, Timer, FileText, Mail, Calendar, MessageCircle,
    Globe, Shield, Lock, MapPin, RotateCcw, Eye, Upload, Bell, ChevronRight, Menu
} from 'lucide-react';
import {
    getUserProfile, getMySessions, createSession, joinSession, getCurrencies,
    getAccessToken, clearTokens
} from '../services/api';

import SessionDetailTab from '../components/dashboard/SessionDetailTab';
import { SummaryCard, StatusBadge } from '../components/dashboard/DashboardWidgets';
import WalletTab from '../components/dashboard/WalletTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import SettingsTab from '../components/dashboard/SettingsTab';
import logo from '../assets/logo.png';




const Sidebar = ({ activeTab, setActiveTab, userData, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        clearTokens();
        navigate('/');
    };
    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'services', label: 'Services', icon: ShoppingBag },
        { id: 'sessions', label: 'Sessions', icon: Briefcase },
        { id: 'wallet', label: 'Wallet', icon: Wallet },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    const displayItems = [...NAV_ITEMS];
    if (userData?.email === 'isaac@gmail.com') {
        displayItems.push({ id: 'create-user', label: 'Create User', icon: UserPlus });
    }

    const sidebarContent = (
        <div className="flex flex-col h-full relative">
            <div className={`flex items-center ${collapsed ? 'justify-center py-6' : 'justify-start py-8'} px-5 border-b border-slate-100 relative min-h-[104px]`}>
                <div className={`flex items-center ${collapsed ? 'gap-0' : 'gap-3.5'} w-full`}>
                    {/* The Logo */}
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
                <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 z-10">
                    <X size={18} />
                </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {displayItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button key={item.id} onClick={() => { if (item.id === 'create-user') { navigate('/signup'); } else { setActiveTab(item.id); } setMobileOpen(false); }}
                            className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`} title={collapsed ? item.label : undefined}>
                            <Icon size={20} className="flex-shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>
            <div className="px-3 pb-6">
                <button onClick={handleLogout} className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all`} title={collapsed ? 'Logout' : undefined}>
                    <LogOut size={20} className="flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
    return (
        <>
            <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-100 h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[260px]'}`}>{sidebarContent}</aside>
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" />
                        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-[260px] bg-white shadow-2xl z-50 lg:hidden">{sidebarContent}</motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const OverviewTab = ({ userData, sessions, setActiveTab, setView, showNotifications, setShowNotifications, notifications }) => {
    const activeSessionsCount = sessions.filter(s => s.status === 'Active' || s.status === 'In Progress').length;
    const completedSessionsCount = sessions.filter(s => s.status === 'Completed').length;
    const totalEscrow = sessions.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toFixed(2);
    const disputesCount = 0;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="space-y-8">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Dashboard</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Overview of your escrow transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Notification Dropdown */}
                    <div className="relative mr-1">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#3B82F6] transition-colors relative"
                        >
                            <Bell size={20} className={showNotifications ? "fill-[#3B82F6] text-[#3B82F6]" : ""} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 mt-3 w-[340px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 origin-top-left"
                                >
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                                        <h3 className="font-bold text-slate-800">Notifications</h3>
                                        <Mail size={18} className="text-[#2563EB]" strokeWidth={2} />
                                    </div>
                                    <div className="max-h-[360px] overflow-y-auto">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className="flex gap-4 p-5 py-4 hover:bg-slate-50/50 border-b border-slate-50 transition-colors cursor-pointer">
                                                <div className="flex-shrink-0 mt-1 flex items-center justify-center w-10">
                                                    {notif.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="text-sm font-bold text-[#2563EB]">{notif.title}</p>
                                                        <span className="text-xs font-semibold text-slate-500 tracking-tight">{notif.time}</span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium pr-2">{notif.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors">
                                        <button className="text-[13px] font-bold text-[#2563EB] flex items-center justify-center gap-1 w-full mx-auto">
                                            View All Notifications <ChevronRight size={14} strokeWidth={3} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => { setActiveTab('sessions'); setView('join'); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Handshake size={16} /> Join Session
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus size={16} /> Try Services
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Active Sessions" value={activeSessionsCount} subtitle="Currently in progress" icon={<Clock size={20} strokeWidth={2.5} />} color="blue" />
                <SummaryCard title="Completed Sessions" value={completedSessionsCount} subtitle="Successfully finished" icon={<CheckCircle size={20} strokeWidth={2.5} />} color="emerald" />
                <SummaryCard title="Total Escrow" value={`$${totalEscrow}`} subtitle="Funds in escrow" icon={<Wallet size={20} strokeWidth={2.5} />} color="violet" />
                <SummaryCard title="Pending Disputes" value={disputesCount} subtitle="Require attention" icon={<AlertCircle size={20} strokeWidth={2.5} />} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Recent Sessions List */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Sessions</h3>
                    <div className="space-y-4">
                        {sessions.slice(0, 5).map((session, index) => (
                            <div key={session.id || index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-[14px] flex items-center justify-center text-slate-400">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-[15px]">{session.title}</p>
                                        <p className="text-sm text-slate-500 font-medium">{session.amount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={session.status} />
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Payments List */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Payments</h3>
                    <div className="space-y-4">
                        {/* Mock data structure based on the screenshot */}
                        {[
                            { id: '#78901234', method: 'CREDIT CARD', amount: '$520', status: 'Completed' },
                            { id: '#78921234', method: 'CREDIT CARD', amount: '$1000', status: 'Pending' },
                            { id: '#78901574', method: 'CREDIT CARD', amount: '$300', status: 'Failed' },
                        ].map((payment, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-[14px] flex items-center justify-center text-slate-400">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-[15px]">{payment.id}</p>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{payment.method}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="font-bold text-slate-800 text-[15px]">{payment.amount}</p>
                                    <StatusBadge status={payment.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const SessionsTab = ({ sessions, loading, searchQuery, setSearchQuery, activeFilter, setActiveFilter, handleJoinSession, joinError, joinSuccess, sessionCode, setSessionCode, joining, handleViewSession, view, setView, setJoinError, setJoinSuccess }) => {
    const filters = ['All', 'Active', 'Completed', 'Pending', 'Failed'];
    const getStatusIcon = (status) => {
        if (status === 'Active' || status === 'In Progress') return <Clock size={12} />;
        if (status === 'Completed') return <CheckCircle size={12} />;
        if (status === 'Failed') return <AlertCircle size={12} />;
        return null;
    };
    const filteredSessions = sessions.filter((s) => {
        // Hide sessions where this user is the client but hasn't joined yet (status still CREATED)
        if (s.isClientRole && ['CREATED', 'Created'].includes(s.status)) return false;
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || s.status === activeFilter ||
            (activeFilter === 'Active' && ['Active', 'In Progress', 'Awaiting Payment'].includes(s.status)) ||
            (activeFilter === 'Pending' && ['Pending', 'Created'].includes(s.status));
        return matchesSearch && matchesFilter;
    });

    if (view === 'join') {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="space-y-6">
                <button onClick={() => { setView('list'); setJoinError(''); setJoinSuccess(''); }} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#3B82F6] transition-colors"><ChevronLeft size={16} /> Back to Sessions</button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Join a Session</h1>
                        <p className="text-[13px] font-medium text-slate-400 mt-0.5">Enter the 6-character Join Code shared by the other party to join an existing escrow session.</p>
                    </div>
                </div>
                <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-slate-50 max-w-lg mx-auto">
                    {joinError && <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3"><AlertCircle size={18} className="flex-shrink-0" /><span>{joinError}</span></div>}
                    {joinSuccess && <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-3"><CheckCircle size={18} className="flex-shrink-0" /><span>{joinSuccess}</span></div>}
                    <form onSubmit={handleJoinSession} className="space-y-12">
                        <div className="text-center">
                            <div className="flex flex-col items-center justify-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-2 animate-bounce-slow"><Handshake size={32} className="text-[#3B82F6]" /></div>
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Enter 6-Character Join Code</label>
                                <div className="flex justify-center gap-4">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <input key={i} id={`code-${i}`} type="text" maxLength={1} value={sessionCode[i] || ''} onChange={(e) => { const val = e.target.value.toUpperCase(); if (val && !/^[A-Z0-9]$/.test(val)) return; const arr = sessionCode.split(''); while (arr.length < 6) arr.push(''); arr[i] = val; setSessionCode(arr.join('').replace(/\s/g, '')); if (val && i < 5) document.getElementById(`code-${i + 1}`)?.focus(); }} onKeyDown={(e) => { if (e.key === 'Backspace' && !sessionCode[i] && i > 0) { document.getElementById(`code-${i - 1}`)?.focus(); } }} onPaste={(e) => { e.preventDefault(); const paste = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); setSessionCode(paste); const nextIdx = Math.min(paste.length, 5); document.getElementById(`code-${nextIdx}`)?.focus(); }} className="w-14 h-16 md:w-16 md:h-20 text-center text-3xl font-bold border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-50 uppercase transition-all shadow-sm" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">Ask the session creator to share the unique code with you to join the secure workspace.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <button type="submit" disabled={joining || sessionCode.length !== 6} className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#3B82F6] text-white font-bold text-lg hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">{joining ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}{joining ? 'Joining Session...' : 'Join Now'}</button>
                            <button type="button" onClick={() => { setView('list'); setJoinError(''); setJoinSuccess(''); setSessionCode(''); }} className="w-full px-8 py-3 rounded-xl text-slate-400 font-bold text-sm hover:text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        );
    }
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Sessions</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Manage your escrow sessions and track their progress.</p>
                </div>
                <button onClick={() => setView('join')} className="flex items-center justify-center gap-2 bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-[0.97] shadow-sm shadow-blue-200"><Handshake size={16} /> Join Session</button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search Sessions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm" /></div>
                    <div className="flex gap-2 flex-wrap">{filters.map((filter) => (<button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === filter ? 'bg-[#3B82F6] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{filter}</button>))}</div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && <div className="col-span-full flex justify-center py-16 text-slate-400"><Loader2 size={32} className="animate-spin" /></div>}
                {!loading && filteredSessions.filter(Boolean).map((session, index) => (
                    <div key={session.id || index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 pr-2"><h3 className="font-bold text-slate-800 text-lg mb-1">{session?.title || 'Untitled'}</h3>{session?.raw?.joinCode && (<span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono tracking-wider">Code: {session.raw.joinCode}</span>)}</div>
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap flex items-center gap-1.5 ${session?.statusColor || 'bg-slate-100 text-slate-500'}`}>{getStatusIcon(session?.status)}{session?.status || 'Unknown'}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{session?.description || 'No description'}</p>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100"><p className="font-bold text-slate-800 text-lg">{session?.price || '—'}</p><span className="text-xs text-slate-400">{session?.date || '—'}</span></div>
                        <button onClick={(e) => { e.stopPropagation(); handleViewSession(session); }} className="w-full py-2 bg-blue-50 text-[#3B82F6] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">View Session</button>
                    </div>
                ))}
            </div>
            {!loading && filteredSessions.length === 0 && (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-50 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Briefcase size={40} className="text-slate-400" /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Sessions Found</h3><p className="text-sm text-slate-400 mb-6">Try adjusting your search or filters.</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// PLACEHOLDERS FOR LARGE COMPONENTS
const CreateSessionTab = ({
    createdSession,
    setCreatedSession,
    newSession,
    setNewSession,
    creating,
    createError,
    currencies,
    handleCreateSession,
    setActiveTab
}) => {
    const [codeCopied, setCodeCopied] = useState(false);
    const [codeTimer, setCodeTimer] = useState(3600);

    // Countdown timer for session code
    useEffect(() => {
        if (!createdSession) {
            setCodeTimer(3600);
            return;
        }

        // Stop timer if session is joined (Active/In Progress)
        const status = createdSession.status || 'CREATED';
        if (status === 'Active' || status === 'In Progress' || status === 'ACTIVE' || status === 'IN_PROGRESS') {
            setCodeTimer(0);
            return;
        }

        if (codeTimer <= 0) return;
        const interval = setInterval(() => {
            setCodeTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [createdSession, codeTimer]);
    if (createdSession) {
        console.log('Created Session Object:', createdSession); // Debugging
        const code = createdSession.joinCode || createdSession.sessionCode || createdSession.code || createdSession.projectCode || createdSession.sessionId || createdSession._id || createdSession.id || '------';
        const status = createdSession.status || 'CREATED';
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-6"
            >
                {/* Success Banner — clean white card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 lg:p-10 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
                        className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    >
                        <CheckCircle size={32} className="text-[#3B82F6]" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2"
                    >
                        Session Created Successfully!
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-slate-400"
                    >
                        Share the Join Code below with your client so they can join.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8"
                    >
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Join Code</p>
                        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-5">
                            {code.split('').map((char, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    className="w-12 h-14 lg:w-14 lg:h-16 bg-[#F8FAFF] rounded-xl flex items-center justify-center border border-blue-100"
                                >
                                    <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-800">{char}</span>
                                </motion.div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                setCodeCopied(true);
                                setTimeout(() => setCodeCopied(false), 2000);
                            }}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${codeCopied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-[#3B82F6] border border-blue-100 hover:bg-blue-100'}`}
                        >
                            {codeCopied ? <><CheckCircle size={16} /> Copied!</> : <><Package size={16} /> Copy Code</>}
                        </button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6"
                        >
                            <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border ${codeTimer > 0 ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}>
                                <Timer size={18} className={codeTimer > 0 ? 'text-slate-400' : 'text-red-400'} />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                        {codeTimer > 0 ? 'Code Expires In' : 'Code Expired'}
                                    </p>
                                    {codeTimer > 0 ? (
                                        <p className="text-xl font-bold font-mono text-slate-800">
                                            {String(Math.floor(codeTimer / 3600)).padStart(2, '0')}:
                                            {String(Math.floor((codeTimer % 3600) / 60)).padStart(2, '0')}:
                                            {String(codeTimer % 60).padStart(2, '0')}
                                        </p>
                                    ) : (
                                        <p className="text-sm font-bold text-red-500">Please create a new session</p>
                                    )}
                                </div>
                            </div>
                            {codeTimer > 0 && (
                                <div className="mt-3 w-64 mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${codeTimer > 1800 ? 'bg-emerald-400' : codeTimer > 600 ? 'bg-amber-400' : 'bg-red-400'}`}
                                        style={{ width: `${(codeTimer / 3600) * 100}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>


                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Session Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-50"
                    >
                        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FileText size={16} className="text-[#3B82F6]" />
                            </div>
                            Session Details
                        </h3>
                        <div className="space-y-4">
                            {/* Status */}
                            <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                <span className="text-sm text-slate-400">Status</span>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#3B82F6] text-xs font-bold flex items-center gap-1.5">
                                    <Clock size={12} /> {status}
                                </span>
                            </div>
                            {createdSession.title && (
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-sm text-slate-400">Title</span>
                                    <span className="font-bold text-slate-700 text-sm">{createdSession.title}</span>
                                </div>
                            )}
                            {createdSession.description && (
                                <div className="py-3 border-b border-slate-50">
                                    <span className="text-sm text-slate-400 block mb-1">Description</span>
                                    <span className="text-slate-700 text-sm">{createdSession.description}</span>
                                </div>
                            )}
                            {createdSession.amount && (
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-sm text-slate-400">Amount</span>
                                    <span className="font-bold text-slate-800 text-lg">{createdSession.amount} <span className="text-sm text-slate-400 font-normal">{createdSession.currency || 'USD'}</span></span>
                                </div>
                            )}
                            {(createdSession.deadline || createdSession.projectDeadline) && (
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-sm text-slate-400">Deadline</span>
                                    <span className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                        <Calendar size={14} className="text-slate-400" />
                                        {new Date(createdSession.deadline || createdSession.projectDeadline).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {(createdSession.user2EmailOrIdentificationName || createdSession.clientEmail) && (
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-sm text-slate-400">Client</span>
                                    <span className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                        <Mail size={14} className="text-slate-400" />
                                        {createdSession.user2EmailOrIdentificationName || createdSession.clientEmail}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: Terms + Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-6"
                    >
                        {/* Terms & Conditions */}
                        <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-50">
                            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={16} className="text-green-500" />
                                </div>
                                Terms & Conditions
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle size={13} className="text-[#3B82F6]" />
                                    </div>
                                    <span className="text-sm text-slate-500">Payment will be held securely in escrow until project completion</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle size={13} className="text-[#3B82F6]" />
                                    </div>
                                    <span className="text-sm text-slate-500">Funds will be released upon client approval of deliverables</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle size={13} className="text-[#3B82F6]" />
                                    </div>
                                    <span className="text-sm text-slate-500">Both parties agree to the project scope and timeline</span>
                                </li>
                            </ul>
                        </div>

                        {/* What's Next */}
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[28px] p-6 lg:p-8 border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-3 text-sm">What's Next?</h3>
                            <ol className="space-y-3 text-sm text-slate-500">
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-[#3B82F6] text-white rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                                    Share the session code with your client
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-[#3B82F6]/80 text-white rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                                    Your client joins using the code
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-[#3B82F6]/60 text-white rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                                    Funds are held securely until completion
                                </li>
                            </ol>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setCreatedSession(null); setActiveTab('sessions'); }}
                                className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
                            >
                                Go to Sessions
                            </button>
                            <button
                                onClick={() => { setCreatedSession(null); }}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                            >
                                <Plus size={18} /> Create Another
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        );
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Clean Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <button
                        onClick={() => setActiveTab('services')}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#3B82F6] mb-4 transition-colors font-semibold"
                    >
                        <ChevronLeft size={16} strokeWidth={3} /> Back to Services
                    </button>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Create New Session</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Set up a new escrow session to protect both you and your client. Funds are held securely until the project is complete.</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form (spans 2 cols) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-50"
                >
                    {createError && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <span>{createError}</span>
                        </div>
                    )}

                    <form onSubmit={handleCreateSession} className="space-y-6">
                        {/* I AM THE */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                <User size={14} className="text-slate-400" /> I am the
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value="Freelancer"
                                    readOnly
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600 cursor-not-allowed font-medium"
                                />
                                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            </div>
                        </div>

                        {/* Project Title + Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <FileText size={14} className="text-slate-400" /> Project Title
                                    </label>
                                    <span className={`text-[10px] font-bold ${newSession.title.length < 50 ? 'text-red-400' : 'text-green-500'}`}>
                                        {newSession.title.length}/50 chars
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Project Title (min 50 chars)"
                                    value={newSession.title}
                                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                    className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all ${newSession.title.length > 0 && newSession.title.length < 50
                                        ? 'border-red-200 focus:border-red-400 focus:ring-red-100'
                                        : 'border-slate-200 focus:border-[#3B82F6] focus:ring-blue-100'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Calendar size={14} className="text-slate-400" /> Project Deadline
                                </label>
                                <input
                                    type="date"
                                    value={newSession.deadline}
                                    onChange={(e) => setNewSession({ ...newSession, deadline: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <MessageCircle size={14} className="text-slate-400" /> Project Description
                                </label>
                                <span className={`text-[10px] font-bold ${newSession.description.length < 50 ? 'text-red-400' : 'text-green-500'}`}>
                                    {newSession.description.length}/50 chars
                                </span>
                            </div>
                            <textarea
                                placeholder="Describe your project scope, deliverables, and expectations... (min 50 chars)"
                                value={newSession.description}
                                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                                rows={4}
                                className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all resize-none ${newSession.description.length > 0 && newSession.description.length < 50
                                    ? 'border-red-200 focus:border-red-400 focus:ring-red-100'
                                    : 'border-slate-200 focus:border-[#3B82F6] focus:ring-blue-100'
                                    }`}
                            />
                        </div>

                        {/* Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Wallet size={14} className="text-slate-400" /> Project Amount
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={newSession.amount}
                                    onChange={(e) => setNewSession({ ...newSession, amount: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Currency + Client Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Globe size={14} className="text-slate-400" /> Currency
                                </label>
                                <select
                                    value={newSession.currency}
                                    onChange={(e) => setNewSession({ ...newSession, currency: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm bg-white transition-all"
                                >
                                    {currencies.length > 0 ? (
                                        currencies.map((c) => {
                                            const code = c.code || c;
                                            const name = c.name || code;
                                            return <option key={code} value={code}>{code} — {name}</option>;
                                        })
                                    ) : (
                                        <>
                                            <option value="USD">USD — US Dollar</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Mail size={14} className="text-slate-400" /> Client Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="client@mail.com"
                                    value={newSession.clientEmail}
                                    onChange={(e) => setNewSession({ ...newSession, clientEmail: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('services')}
                                className="px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                {creating ? 'Creating...' : 'Create Session'}
                            </button>
                        </div>
                    </form>

                </motion.div>

                {/* Right: Info Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    {/* How It Works */}
                    <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-50">
                        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Shield size={16} className="text-[#3B82F6]" />
                            </div>
                            How It Works
                        </h3>
                        <ol className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="w-7 h-7 bg-[#3B82F6] text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Create a Session</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Fill in the project details and set the escrow amount</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-7 h-7 bg-[#3B82F6]/80 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Share the Code</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Send the unique session code to your client</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-7 h-7 bg-[#3B82F6]/60 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Client Joins & Funds</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Your client joins and deposits funds into escrow</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-7 h-7 bg-[#3B82F6]/40 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Get Paid Securely</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Deliver your work and receive payment safely</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    {/* Security Info */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-[28px] p-6 lg:p-8 border border-green-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle size={16} className="text-green-600" />
                            </div>
                            You're Protected
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-xs text-slate-500">
                                <CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                                Funds held securely until project completion
                            </li>
                            <li className="flex items-start gap-2.5 text-xs text-slate-500">
                                <CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                                Dispute resolution available if needed
                            </li>
                            <li className="flex items-start gap-2.5 text-xs text-slate-500">
                                <CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                                Transparent process for both parties
                            </li>
                        </ul>
                    </div>

                    {/* Quick Tip */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-[28px] p-6 border border-amber-100">
                        <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            💡 Quick Tip
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Be as detailed as possible in your project description. This helps prevent disputes and ensures both parties are aligned on expectations.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};




const ServicesTab = ({ setActiveTab }) => {
    const services = [{ icon: <Handshake size={32} />, title: 'Freelancer Pre-Pay', desc: 'Secure payments for freelance work. Funds are held in escrow until both parties confirm delivery.' }, { icon: <ShoppingBag size={32} />, title: 'Marketplace Escrow', desc: 'Buy and sell with confidence. Your payment is protected until you receive and approve the goods.', comingSoon: true }, { icon: <Shield size={32} />, title: 'Rental Deposit', desc: 'Safeguard rental deposits for both tenants and landlords with transparent escrow management.', comingSoon: true }];
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Our Services</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Discover the secure and convenient solutions we offer for your transactions.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">{services.map((service, index) => (
                <motion.div key={index} whileHover={{ y: -8, scale: 1.01 }} className="group relative bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-100 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.1)]">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-[#3B82F6] rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300" /><div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors text-[#3B82F6]">{service.icon}</div><h3 className="text-[17px] font-bold text-slate-800 mb-4 group-hover:text-[#3B82F6] transition-colors">{service.title}</h3><p className="text-[13px] text-slate-400 leading-relaxed mb-8 px-2 font-medium">{service.desc}</p>
                    {service.comingSoon ? (<span className="px-6 py-2.5 rounded-xl border-2 border-slate-100 text-slate-300 text-[13px] font-bold">Coming Soon</span>) : (<button onClick={() => setActiveTab('createSession')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-blue-50 text-[#3B82F6] text-[13px] font-bold group-hover:bg-[#3B82F6] group-hover:text-white group-hover:border-[#3B82F6] transition-all duration-300 active:scale-95">Start <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></button>)}
                </motion.div>
            ))}<div className="bg-white/40 rounded-[32px] p-8 border-2 border-dashed border-slate-100 flex items-center justify-center min-h-[350px]"><p className="text-slate-300 font-bold text-lg tracking-tight">More Coming Soon ...</p></div></div>
        </motion.div>
    );
};



const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userData, setUserData] = useState({});
    const [sessions, setSessions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [currencies, setCurrencies] = useState([]);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createdSession, setCreatedSession] = useState(null);
    const [newSession, setNewSession] = useState({ title: '', description: '', amount: '', currency: 'USD', clientEmail: '', deadline: '' });
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [joinSuccess, setJoinSuccess] = useState('');
    const [sessionCode, setSessionCode] = useState('');
    const [view, setView] = useState('list');
    const [selectedSession, setSelectedSession] = useState(null);
    const [viewRole, setViewRole] = useState('freelancer');
    const [showNotifications, setShowNotifications] = useState(false);

    // Mock Notifications Data
    const notifications = [
        { id: 1, type: 'message', title: 'New Message', text: 'You have received a new message from a client.', time: '5m ago', icon: <Mail size={22} className="text-[#2563EB]" strokeWidth={1.5} /> },
        { id: 2, type: 'payment', title: 'Payment Reminder', text: 'Payment is still pending for your session.', time: '20m ago', icon: <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center"><Wallet size={16} className="text-white" strokeWidth={2} /></div> },
        { id: 3, type: 'dispute', title: 'Dispute Alert.', text: 'A new dispute has been raised.', time: '1h ago', icon: <div className="w-8 h-8 rounded-lg bg-[#E02020] flex items-center justify-center"><AlertCircle size={16} className="text-white" strokeWidth={2} /></div> }
    ];

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [profileData, sessionsData, currenciesData] = await Promise.allSettled([getUserProfile(), getMySessions(), getCurrencies()]);
            if (profileData.status === 'fulfilled') setUserData(profileData.value);
            if (sessionsData.status === 'fulfilled') {
                const sessionsList = Array.isArray(sessionsData.value) ? sessionsData.value : (sessionsData.value.sessions || []);
                const normalizedSessions = sessionsList.map(s => {
                    const status = s.status || 'Created';
                    let color = 'bg-slate-100 text-slate-500';
                    if (status === 'Active' || status === 'In Progress') color = 'bg-blue-100 text-[#3B82F6]';
                    if (status === 'Completed') color = 'bg-green-100 text-green-600';
                    if (status === 'Pending' || status === 'Created' || status === 'Awaiting Payment') color = 'bg-amber-100 text-amber-600';
                    if (status === 'Failed' || status === 'Cancelled' || status === 'Disputed') color = 'bg-red-100 text-red-600';
                    const clientEmail = s.clientEmail || s.user2EmailOrIdentificationName;
                    const freelancerEmail = s.freelancerEmail || s.user1EmailOrIdentificationName;
                    const currentEmail = (profileData.status === 'fulfilled' ? profileData.value?.email : null) || '';
                    const isClientRole = !!(clientEmail && currentEmail && clientEmail.toLowerCase() === currentEmail.toLowerCase());
                    return { id: s._id || s.id, title: s.title || s.projectTitle || 'Untitled Session', description: s.description || 'No description provided', amount: s.amount ? `$${s.amount}` : '—', currency: s.currency || 'USD', status: status, date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—', clientEmail, freelancerEmail, deadline: s.deadline || s.projectDeadline, statusColor: color, isClientRole, raw: s };
                });
                setSessions(normalizedSessions);
                const mockPayments = normalizedSessions.map(s => ({ id: s.id.substring(0, 8), amount: s.amount, status: s.status === 'Active' ? 'Held' : s.status === 'Completed' ? 'Released' : 'Pending', date: s.date, type: 'Escrow Deposit' }));
                setPayments(mockPayments);
            }

            // Handle currencies with fallback
            if (currenciesData.status === 'fulfilled' && currenciesData.value && currenciesData.value.length > 0) {
                setCurrencies(currenciesData.value);
            } else {
                console.warn('Failed to fetch currencies or empty response, using defaults');
                setCurrencies(['USD', 'EUR', 'GBP', 'AED', 'SAR']);
            }

            // Handle profile failure gracefully if needed (userData is already {} by default)
            if (profileData.status === 'rejected') {
                console.error('Profile fetch failed:', profileData.reason);
                // Optionally try to parse email from token if strictly needed, but let's just warn for now
            }
        } catch (err) { console.error('Error fetching dashboard data:', err); } finally { setLoading(false); }
    };

    useEffect(() => { if (!getAccessToken()) { navigate('/login'); return; } fetchDashboardData(); }, [navigate]);

    const handleCreateSession = async (e) => {
        e.preventDefault(); setCreateError('');
        if (!newSession.title || !newSession.amount || !newSession.description || !newSession.clientEmail || !newSession.deadline) { setCreateError('Please fill in all required fields'); return; }
        if (newSession.title.length < 50) { setCreateError('Title must be at least 50 characters long'); return; }
        if (newSession.description.length < 50) { setCreateError('Description must be at least 50 characters long'); return; }
        setCreating(true);
        try {
            const isoDeadline = newSession.deadline ? new Date(newSession.deadline).toISOString() : null;
            const payload = { title: newSession.title, description: newSession.description, amount: parseFloat(newSession.amount), currency: newSession.currency, deadline: isoDeadline, user2EmailOrIdentificationName: newSession.clientEmail };
            const response = await createSession(payload);
            setCreatedSession(response.session || response.data || response);
            setNewSession({ title: '', description: '', amount: '', currency: 'USD', clientEmail: '', deadline: '' });
            fetchDashboardData();
        } catch (err) {
            console.error('Create session error object:', err);
            let errorMessage = 'Failed to create session. Please try again.';
            if (err.response && err.response.data) { const serverData = err.response.data; if (Array.isArray(serverData.message)) { errorMessage = serverData.message.join(', '); } else if (typeof serverData.message === 'string') { errorMessage = serverData.message; } else if (serverData.error) { errorMessage = serverData.error; } }
            setCreateError(errorMessage);
        } finally { setCreating(false); }
    };

    const handleJoinSession = async (e) => {
        e.preventDefault(); setJoinError(''); setJoinSuccess('');
        if (sessionCode.length !== 6) { setJoinError('Please enter a valid 6-character code'); return; }
        setJoining(true);
        try {
            const result = await joinSession(sessionCode.trim());
            const joinedSession = result.session || result.data || result;

            // Optimistically update status if backend still shows CREATED
            if (['CREATED'].includes((joinedSession.status || '').toUpperCase())) {
                joinedSession.status = 'JOINED';
            }

            setJoinSuccess('Successfully joined the session!');
            setSessionCode('');
            await fetchDashboardData(); // this gets the latest from the server

            // Navigate to the session detail view as client
            const sessionData = joinedSession.raw || joinedSession;

            // Re-apply optimistic update to the raw instance just in case
            if (['CREATED'].includes((sessionData.status || '').toUpperCase())) {
                sessionData.status = 'JOINED';
            }

            setSelectedSession(sessionData);
            setViewRole('client');
            setTimeout(() => { setActiveTab('sessionDetail'); setJoinSuccess(''); }, 800);
        } catch (err) { console.error('Join session error:', err); setJoinError(err.response?.data?.message || 'Failed to join session. Please check the code and try again.'); } finally { setJoining(false); }
    };

    const handleViewSession = async (session) => {
        // Always use the raw API object
        const sessionData = session.raw || session;
        const rawId = sessionData._id || sessionData.id;

        // Get user ID from JWT token
        let myId = '';
        let myEmail = '';
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                myId = (payload._id || payload.sub || payload.id || payload.userId || '').toString();
                myEmail = (payload.email || '').toLowerCase();
            }
        } catch (e) { console.error('JWT decode error:', e); }

        // Detect role from session data
        const u1Id = (typeof sessionData.user1 === 'string' ? sessionData.user1 : (sessionData.user1?._id || '')).toString();
        const u2Id = (typeof sessionData.user2 === 'string' ? sessionData.user2 : (sessionData.user2?._id || '')).toString();
        const clientEmail = (sessionData.clientEmail || sessionData.user2?.email || '').toLowerCase();
        const freelancerEmail = (sessionData.freelancerEmail || sessionData.user1?.email || '').toLowerCase();

        let role = 'freelancer';
        if ((myId && myId === u2Id) || (myEmail && myEmail === clientEmail)) role = 'client';
        else if ((myId && myId === u1Id) || (myEmail && myEmail === freelancerEmail)) role = 'freelancer';

        // Fetch fresh session from API so the detail view starts with the correct status
        let liveData = sessionData;
        try {
            const res = await getSessionById(rawId);
            liveData = res.session || res.data || res;
        } catch (e) {
            console.warn('Could not fetch live session, using cached data:', e.message);
        }

        console.log(`handleViewSession => role: ${role} | status: ${liveData.status}`);
        setSelectedSession(liveData);
        setViewRole(role);
        setActiveTab('sessionDetail');
    };

    const handlePaymentClick = (payment) => { console.log('Clicked payment:', payment); };
    const handleStatusClick = (status, e) => { e.stopPropagation(); console.log('Clicked status:', status); };

    const renderContent = () => {
        switch (activeTab) {
            case 'sessions': return <SessionsTab sessions={sessions} loading={loading} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilter={activeFilter} setActiveFilter={setActiveFilter} handleJoinSession={handleJoinSession} joinError={joinError} joinSuccess={joinSuccess} sessionCode={sessionCode} setSessionCode={setSessionCode} joining={joining} handleViewSession={handleViewSession} view={view} setView={setView} setJoinError={setJoinError} setJoinSuccess={setJoinSuccess} />;
            case 'wallet': return <WalletTab sessions={sessions} loading={loading} userData={userData} />;
            case 'profile': return <ProfileTab userData={userData} />;
            case 'services': return <ServicesTab setActiveTab={setActiveTab} />;
            case 'settings': return <SettingsTab />;
            case 'createSession': return <CreateSessionTab createdSession={createdSession} setCreatedSession={setCreatedSession} newSession={newSession} setNewSession={setNewSession} creating={creating} createError={createError} currencies={currencies} handleCreateSession={handleCreateSession} setActiveTab={setActiveTab} />;
            case 'sessionDetail': return selectedSession ? <SessionDetailTab selectedSession={selectedSession} setSelectedSession={setSelectedSession} viewRole={viewRole} setViewRole={setViewRole} userData={userData} setActiveTab={setActiveTab} onRefreshSessions={fetchDashboardData} /> : <div className="flex justify-center items-center h-64 text-slate-400">Session not found</div>;
            case 'dashboard': default: return <OverviewTab userData={userData} sessions={sessions} setActiveTab={setActiveTab} setView={setView} showNotifications={showNotifications} setShowNotifications={setShowNotifications} notifications={notifications} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userData={userData} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
                <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 z-20">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Waseet Logo" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-[#3B82F6] text-lg font-bold">Waseet</span>
                    </div>
                    <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
                        <Menu size={24} />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-10 lg:py-8 scrollbar-hide"><div className="max-w-7xl mx-auto pb-10">{renderContent()}</div></div>
            </main>
        </div>
    );
};

export default DashboardPage;
