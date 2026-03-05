import React from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Handshake, AlertCircle, CheckCircle, Briefcase, Search, Loader2,
    Clock, ArrowRight
} from 'lucide-react';

const SessionsTab = ({
    sessions,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    handleJoinSession,
    joinError,
    joinSuccess,
    sessionCode,
    setSessionCode,
    joining,
    handleViewSession,
    view,
    setView,
    setJoinError,
    setJoinSuccess
}) => {
    const filters = ['All', 'Active', 'Completed', 'Pending', 'Failed'];

    // Helper for status icon
    const getStatusIcon = (status) => {
        if (status === 'Active' || status === 'In Progress') return <Clock size={12} />;
        if (status === 'Completed') return <CheckCircle size={12} />;
        if (status === 'Failed') return <AlertCircle size={12} />;
        return null;
    };

    // Filter sessions
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-6"
            >
                <button
                    onClick={() => { setView('list'); setJoinError(''); setJoinSuccess(''); }}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#3B82F6] transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Sessions
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Join a Session</h1>
                        <p className="text-[13px] font-medium text-slate-400 mt-0.5">Enter the 6-character Join Code shared by the other party to join an existing escrow session.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-slate-50 max-w-lg mx-auto">
                    {joinError && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <span>{joinError}</span>
                        </div>
                    )}
                    {joinSuccess && (
                        <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-3">
                            <CheckCircle size={18} className="flex-shrink-0" />
                            <span>{joinSuccess}</span>
                        </div>
                    )}

                    <form onSubmit={handleJoinSession} className="space-y-12">
                        <div className="text-center">
                            <div className="flex flex-col items-center justify-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-2 animate-bounce-slow">
                                    <Handshake size={32} className="text-[#3B82F6]" />
                                </div>
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                    Enter 6-Character Join Code
                                </label>

                                <div className="flex justify-center gap-4">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <input
                                            key={i}
                                            id={`code-${i}`}
                                            type="text"
                                            maxLength={1}
                                            value={sessionCode[i] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                if (val && !/^[A-Z0-9]$/.test(val)) return;
                                                const arr = sessionCode.split('');
                                                while (arr.length < 6) arr.push('');
                                                arr[i] = val;
                                                setSessionCode(arr.join('').replace(/\s/g, ''));
                                                if (val && i < 5) document.getElementById(`code-${i + 1}`)?.focus();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !sessionCode[i] && i > 0) {
                                                    document.getElementById(`code-${i - 1}`)?.focus();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                const paste = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                                                setSessionCode(paste);
                                                const nextIdx = Math.min(paste.length, 5);
                                                document.getElementById(`code-${nextIdx}`)?.focus();
                                            }}
                                            className="w-14 h-16 md:w-16 md:h-20 text-center text-3xl font-bold border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-50 uppercase transition-all shadow-sm"
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                                    Ask the session creator to share the unique code with you to join the secure workspace.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <button
                                type="submit"
                                disabled={joining || sessionCode.length !== 6}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#3B82F6] text-white font-bold text-lg hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {joining ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                                {joining ? 'Joining Session...' : 'Join Now'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setView('list'); setJoinError(''); setJoinSuccess(''); setSessionCode(''); }}
                                className="w-full px-8 py-3 rounded-xl text-slate-400 font-bold text-sm hover:text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Need Help */}
                <div className="bg-blue-50/60 rounded-2xl p-6 max-w-lg mx-auto mt-6">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">Need Help?</h4>
                    <ul className="space-y-2.5">
                        <li className="flex items-start gap-3 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1 flex-shrink-0" />
                            The Join Code is a 6-character code provided by the person who created the escrow session
                        </li>
                        <li className="flex items-start gap-3 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1 flex-shrink-0" />
                            Make sure you have the correct Join Code and that it hasn't expired
                        </li>
                        <li className="flex items-start gap-3 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1 flex-shrink-0" />
                            If you can't find your session, contact the person who created it or our support team
                        </li>
                    </ul>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Gradient Header */}
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Sessions</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Manage your escrow sessions and track their progress.</p>
                </div>
                <button
                    onClick={() => setView('join')}
                    className="flex items-center justify-center gap-2 bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-[0.97] shadow-sm shadow-blue-200"
                >
                    <Handshake size={16} /> Join Session
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === filter
                                    ? 'bg-[#3B82F6] text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && (
                    <div className="col-span-full flex justify-center py-16 text-slate-400">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                )}
                {!loading && filteredSessions.filter(Boolean).map((session, index) => (
                    <div
                        key={session.id || index}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 pr-2">
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{session?.title || 'Untitled'}</h3>
                                {session?.raw?.joinCode && (
                                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono tracking-wider">
                                        Code: {session.raw.joinCode}
                                    </span>
                                )}
                            </div>
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap flex items-center gap-1.5 ${session?.statusColor || 'bg-slate-100 text-slate-500'}`}>
                                {getStatusIcon(session?.status)}
                                {session?.status || 'Unknown'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{session?.description || 'No description'}</p>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                            <p className="font-bold text-slate-800 text-lg">{session?.price || '—'}</p>
                            <span className="text-xs text-slate-400">{session?.date || '—'}</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleViewSession(session); }}
                            className="w-full py-2 bg-blue-50 text-[#3B82F6] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                            View Session
                        </button>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && filteredSessions.length === 0 && (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-50 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Sessions Found</h3>
                        <p className="text-sm text-slate-400 mb-6">Try adjusting your search or filters.</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SessionsTab;
