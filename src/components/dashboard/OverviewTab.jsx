import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, CheckCircle, AlertCircle, Plus, Handshake, ArrowRight } from 'lucide-react';
import { SummaryCard } from './DashboardWidgets';

const OverviewTab = ({ userData, sessions, setActiveTab, setView }) => {
    // Derive stats
    const activeSessionsCount = sessions.filter(s => s.status === 'Active' || s.status === 'In Progress').length;
    const completedSessionsCount = sessions.filter(s => s.status === 'Completed').length;
    const totalEscrow = sessions.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toFixed(2);
    // Placeholder for disputes
    const disputesCount = 0;

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
        >
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] shadow-lg shadow-blue-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                <div className="relative z-10 p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-3 py-1 rounded-full bg-blue-400/30 text-emerald-100 text-xs font-bold mb-3 border border-white/10"
                        >
                            {greeting}, {userData.firstName}! 👋
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight"
                        >
                            Welcome to Waseet
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-blue-100/90 text-sm lg:text-base max-w-lg leading-relaxed"
                        >
                            Your secure escrow platform for freelancing and transactions. Manage your sessions, payments, and deliverables with complete peace of mind.
                        </motion.p>
                    </div>

                    {/* Stats Pill */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 min-w-[180px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-blue-100 font-medium uppercase tracking-wider">Total Escrow</p>
                            <p className="text-xl font-bold text-white">${totalEscrow}</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Active Projects"
                    value={activeSessionsCount}
                    subtitle="Currently in progress"
                    icon={<Clock size={20} />}
                    color="blue"
                    gradient="from-blue-500 to-blue-600"
                />
                <SummaryCard
                    title="Completed"
                    value={completedSessionsCount}
                    subtitle="Successfully finished"
                    icon={<CheckCircle size={20} />}
                    color="emerald"
                    gradient="from-emerald-500 to-emerald-600"
                />
                <SummaryCard
                    title="Total Escrow"
                    value={`$${totalEscrow}`}
                    subtitle="Held securely"
                    icon={<Wallet size={20} />}
                    color="violet"
                    gradient="from-violet-500 to-violet-600"
                />
                <SummaryCard
                    title="Disputes"
                    value={disputesCount}
                    subtitle="Action required"
                    icon={<AlertCircle size={20} />}
                    color="red"
                    gradient="from-red-500 to-red-600"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('createSession')}
                    className="group relative overflow-hidden bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 text-left hover:shadow-md transition-all h-full"
                >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3B82F6] mb-4 group-hover:bg-[#3B82F6] group-hover:text-white transition-colors shadow-sm">
                            <Plus size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-[#3B82F6] transition-colors">Create Session</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Start a new secure transaction</p>
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setActiveTab('sessions'); setView('join'); }}
                    className="group relative overflow-hidden bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 text-left hover:shadow-md transition-all h-full"
                >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm">
                            <Handshake size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">Join Session</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Enter code to join existing session</p>
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('sessions')}
                    className="group relative overflow-hidden bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 text-left hover:shadow-md transition-all h-full"
                >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-violet-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-4 group-hover:bg-violet-500 group-hover:text-white transition-colors shadow-sm">
                            <ArrowRight size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">View All</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Manage your active sessions</p>
                    </div>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default OverviewTab;
