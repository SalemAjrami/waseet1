import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Briefcase, Settings, LogOut,
    Menu, X, ChevronLeft, Search, Plus, Trash2, Loader2,
    Shield, CheckCircle, AlertCircle, Clock, Lock, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    clearTokens, getUserProfile, getAllUsers, getAllSessions, deleteUser, deleteSession,
    getAllHolds, deleteHold, createHold,
    getAllFees, deleteFee, createFee,
    getDashboardOverview
} from '../services/api';

// ─── Sidebar ────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Briefcase },
    { id: 'holds', label: 'Holds', icon: Lock },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearTokens();
        navigate('/');
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#1e293b] text-white">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-5 py-6 border-b border-slate-700`}>
                <div className="flex items-center gap-2.5">
                    <div className="bg-purple-600 p-2 rounded-lg shadow-sm flex-shrink-0">
                        <Shield size={20} className="text-white" />
                    </div>
                    {!collapsed && <span className="text-white text-xl font-bold tracking-tight">Admin</span>}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-700 transition-colors text-slate-400"
                >
                    <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-700 transition-colors text-slate-400"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setMobileOpen(false);
                            }}
                            className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all`}
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
            <aside className={`hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[260px]'}`}>
                {sidebarContent}
            </aside>
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#1e293b] shadow-2xl z-50 lg:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

// ─── Main Admin Page ────────────────────────────────
const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [holds, setHolds] = useState([]);
    const [fees, setFees] = useState([]);

    // Creation Modal States
    const [showHoldModal, setShowHoldModal] = useState(false);
    const [holdForm, setHoldForm] = useState({ sessionId: '', amount: '', reason: '' });

    const [showFeeModal, setShowFeeModal] = useState(false);
    const [feeForm, setFeeForm] = useState({ name: '', amount: '', isPercentage: false, description: '' });

    const [stats, setStats] = useState({ totalUsers: 0, totalSessions: 0, activeVolume: 0 });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // Check auth
            const profile = await getUserProfile();
            if (profile.email !== 'isaac@gmail.com') {
                navigate('/dashboard'); // Not admin
                return;
            }

            // Mock Data fallback if API fails (since we are assuming endpoints)
            try {
                // Fetch users from the new endpoint
                const usersResponse = await getAllUsers().catch(err => {
                    console.error('Failed to fetch users:', err);
                    return [];
                });
                // The API might return an array or an object with a data property
                const usersList = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
                setUsers(usersList);

                // Fetch sessions (keep existing logic for now)
                const sessionsResponse = await getAllSessions().catch(() => []);
                const sessionsList = Array.isArray(sessionsResponse) ? sessionsResponse : (sessionsResponse.data || []);
                setSessions(sessionsList);

                // Fetch holds
                const holdsResponse = await getAllHolds().catch(() => []);
                const holdsList = Array.isArray(holdsResponse) ? holdsResponse : (holdsResponse.data || []);
                setHolds(holdsList);

                // Fetch fees
                const feesResponse = await getAllFees().catch(() => []);
                const feesList = Array.isArray(feesResponse) ? feesResponse : (feesResponse.data || []);
                setFees(feesList);

                // Fetch dashboard overview
                const overviewResponse = await getDashboardOverview().catch(() => null);
                // The API might return stats in data or directly
                const overviewData = overviewResponse?.data || overviewResponse || {};

                setStats({
                    totalUsers: overviewData.totalUsers ?? usersList.length,
                    totalSessions: overviewData.totalSessions ?? sessionsList.length,
                    activeVolume: overviewData.activeVolume ?? 0
                });

            } catch (e) {
                console.log('Admin API not fully ready, using empty state or mocks');
            }

        } catch (err) {
            console.error('Admin Check Failed', err);
            // If it's a 401/403, redirect to login. Otherwise (500), stay on page.
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u._id !== id && u.id !== id));
        } catch (e) { alert('Failed to delete user'); }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm('Delete this session?')) return;
        try {
            await deleteSession(id);
            setSessions(prev => prev.filter(s => s._id !== id && s.id !== id));
        } catch (e) { alert('Failed to delete session'); }
    };

    const handleDeleteHold = async (id) => {
        if (!window.confirm('Delete this hold?')) return;
        try {
            await deleteHold(id);
            setHolds(prev => prev.filter(h => h._id !== id && h.id !== id));
        } catch (e) { alert('Failed to delete hold'); }
    };

    const handleDeleteFee = async (id) => {
        if (!window.confirm('Delete this fee?')) return;
        try {
            await deleteFee(id);
            setFees(prev => prev.filter(f => f._id !== id && f.id !== id));
        } catch (e) { alert('Failed to delete fee'); }
    };

    const handleCreateHold = async (e) => {
        e.preventDefault();
        try {
            const newHold = await createHold({ ...holdForm, amount: Number(holdForm.amount) });
            // API might return an object, or data. Assuming it returns the created document.
            // If it returns { data: {...} }, we adjust logic, but `prev => [...prev, newHold]` is roughly ok.
            // A safer fetch is to just call fetchAdminData again:
            await fetchAdminData();
            setShowHoldModal(false);
            setHoldForm({ sessionId: '', amount: '', reason: '' });
        } catch (err) { alert('Failed to create hold'); }
    };

    const handleCreateFee = async (e) => {
        e.preventDefault();
        try {
            const newFee = await createFee({ ...feeForm, amount: Number(feeForm.amount) });
            await fetchAdminData();
            setShowFeeModal(false);
            setFeeForm({ name: '', amount: '', isPercentage: false, description: '' });
        } catch (err) { alert('Failed to create fee'); }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                            <button
                                onClick={() => navigate('/signup')}
                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
                            >
                                <Plus size={18} /> Create User
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Name</th>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">Role</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No users found / API unavailable</td></tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user._id || user.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800">{user.firstName} {user.lastName}</td>
                                                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role || 'USER'}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteUser(user._id || user.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'sessions':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">All Sessions</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Title</th>
                                        <th className="px-6 py-4 font-bold">Amount</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sessions.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No sessions found / API unavailable</td></tr>
                                    ) : (
                                        sessions.map((s) => (
                                            <tr key={s._id || s.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800">{s.title}</td>
                                                <td className="px-6 py-4 text-slate-500">${s.amount}</td>
                                                <td className="px-6 py-4 text-slate-500">{s.status}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteSession(s._id || s.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'holds':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Holds Management</h2>
                            <button onClick={() => setShowHoldModal(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition">
                                <Plus size={18} /> Create Hold
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Session ID</th>
                                        <th className="px-6 py-4 font-bold">Amount</th>
                                        <th className="px-6 py-4 font-bold">Reason</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {holds.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No holds found / API unavailable</td></tr>
                                    ) : (
                                        holds.map((hold) => (
                                            <tr key={hold._id || hold.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800">{hold.sessionId || 'N/A'}</td>
                                                <td className="px-6 py-4 text-slate-500">${hold.amount}</td>
                                                <td className="px-6 py-4 text-slate-500">{hold.reason || 'N/A'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteHold(hold._id || hold.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Create Hold Modal */}
                        <AnimatePresence>
                            {showHoldModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                            <h3 className="text-xl font-bold text-slate-800">Create New Hold</h3>
                                            <button onClick={() => setShowHoldModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                        </div>
                                        <form onSubmit={handleCreateHold} className="p-6 space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Session ID</label>
                                                <input type="text" required value={holdForm.sessionId} onChange={e => setHoldForm({ ...holdForm, sessionId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500" placeholder="Session ID" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                                                <input type="number" step="0.01" required value={holdForm.amount} onChange={e => setHoldForm({ ...holdForm, amount: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Reason</label>
                                                <input type="text" required value={holdForm.reason} onChange={e => setHoldForm({ ...holdForm, reason: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500" placeholder="Reason for hold" />
                                            </div>
                                            <div className="pt-4 flex gap-3 justify-end">
                                                <button type="button" onClick={() => setShowHoldModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">Create</button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case 'fees':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Fees Management</h2>
                            <button onClick={() => setShowFeeModal(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition">
                                <Plus size={18} /> Create Fee
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Name</th>
                                        <th className="px-6 py-4 font-bold">Amount</th>
                                        <th className="px-6 py-4 font-bold">Percentage</th>
                                        <th className="px-6 py-4 font-bold">Description</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fees.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No fees found / API unavailable</td></tr>
                                    ) : (
                                        fees.map((fee) => (
                                            <tr key={fee._id || fee.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800">{fee.name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-slate-500">{fee.amount}</td>
                                                <td className="px-6 py-4 text-slate-500">{fee.isPercentage ? 'Yes' : 'No'}</td>
                                                <td className="px-6 py-4 text-slate-500">{fee.description || 'N/A'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteFee(fee._id || fee.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Create Fee Modal */}
                        <AnimatePresence>
                            {showFeeModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                            <h3 className="text-xl font-bold text-slate-800">Create New Fee</h3>
                                            <button onClick={() => setShowFeeModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                        </div>
                                        <form onSubmit={handleCreateFee} className="p-6 space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Fee Name</label>
                                                <input type="text" required value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500" placeholder="e.g. Platform Fee" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                                                <input type="number" step="0.01" required value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500" placeholder="0.00" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <input type="checkbox" id="isPercentage" checked={feeForm.isPercentage} onChange={e => setFeeForm({ ...feeForm, isPercentage: e.target.checked })} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                                                <label htmlFor="isPercentage" className="text-sm font-bold text-slate-700">Is Percentage?</label>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                                <input type="text" value={feeForm.description} onChange={e => setFeeForm({ ...feeForm, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500" placeholder="Fee description" />
                                            </div>
                                            <div className="pt-4 flex gap-3 justify-end">
                                                <button type="button" onClick={() => setShowFeeModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">Create</button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            default: // Dashboard
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">Admin Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Users size={24} /></div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-bold">Total Users</p>
                                        <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Briefcase size={24} /></div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-bold">Total Sessions</p>
                                        <p className="text-2xl font-bold text-slate-800">{stats.totalSessions}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-bold">Active Volume</p>
                                        <p className="text-2xl font-bold text-slate-800">${(stats.activeVolume || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                            <h3 className="font-bold text-purple-900 mb-2">Welcome Admin</h3>
                            <p className="text-purple-700 text-sm">
                                Use the sidebar to manage users and view sessions.
                                Click "Users" - "Create User" to onboard new clients or freelancers.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-600" size={32} /></div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fc]">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-6">
                    <button onClick={() => setMobileOpen(true)} className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                        <Menu size={20} />
                    </button>
                    <span className="font-bold text-slate-800">Admin Dashboard</span>
                    <div className="w-9" />
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboardPage;
