import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle, Package, Timer, FileText, Mail, Plus, Loader2, User, Calendar,
    MessageCircle, Wallet, Globe, Shield, ArrowRight, ChevronLeft, AlertCircle, Lock, Clock
} from 'lucide-react';

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
    const [showSuccessFlash, setShowSuccessFlash] = useState(false);

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

    // Show a brief success flash when session is first created
    useEffect(() => {
        if (!createdSession) return;
        setShowSuccessFlash(true);
        const t = setTimeout(() => setShowSuccessFlash(false), 1800);
        return () => clearTimeout(t);
    }, [createdSession?._id || createdSession?.id]);

    // Brief success splash before showing the code
    if (createdSession && showSuccessFlash) {
        return (
            <motion.div
                key="success-flash"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle size={48} className="text-green-500" />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2"
                >
                    Session Created Successfully!
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-slate-400 text-sm"
                >
                    Generating your join code...
                </motion.p>
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 1.2, ease: 'easeInOut' }}
                    className="mt-6 h-1 w-48 bg-green-400 rounded-full origin-left"
                />
            </motion.div>
        );
    }
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
                {/* Hero Banner */}
                <div className="bg-white rounded-[32px] p-8 lg:p-12 border border-slate-100 shadow-sm text-center">
                    {/* Animated Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
                        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle size={40} className="text-green-500" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl lg:text-3xl font-bold mb-2 text-slate-800"
                    >
                        Session Created Successfully!
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-500 text-sm lg:text-base mb-8"
                    >
                        Share the Join Code below with your client so they can join.
                    </motion.p>

                    {/* Session Code Display */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 bg-slate-50 border border-slate-100 rounded-3xl p-8 max-w-2xl mx-auto"
                    >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Join Code</p>
                        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-6">
                            {code.split('').map((char, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    className="w-12 h-14 lg:w-14 lg:h-16 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-slate-800"
                                >
                                    <span className="text-2xl lg:text-3xl font-bold font-mono">{char}</span>
                                </motion.div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                setCodeCopied(true);
                                setTimeout(() => setCodeCopied(false), 2000);
                            }}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${codeCopied ? 'bg-green-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm shadow-slate-200'}`}
                        >
                            {codeCopied ? <><CheckCircle size={16} /> Copied!</> : <><Package size={16} /> Copy Code</>}
                        </button>

                        {/* Countdown Timer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-8 pt-6 border-t border-slate-200"
                        >
                            <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border ${codeTimer > 0 ? 'bg-white border-slate-200 shadow-sm' : 'bg-red-50 border-red-200'}`}>
                                <Timer size={18} className={codeTimer > 0 ? 'text-[#3B82F6]' : 'text-red-500'} />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
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
                            {/* Progress bar */}
                            {codeTimer > 0 && (
                                <div className="mt-4 w-64 mx-auto h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${codeTimer > 1800 ? 'bg-green-500' : codeTimer > 600 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
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
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <button
                        onClick={() => setActiveTab('services')}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#3B82F6] mb-4 transition-colors font-semibold"
                    >
                        <ChevronLeft size={16} strokeWidth={3} /> Back to Services
                    </button>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Create New Session</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Set up a new escrow session to protect both you and your client.</p>
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

export default CreateSessionTab;
