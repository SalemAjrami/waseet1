import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle,
    TrendingUp, Shield, CreditCard, Eye, EyeOff, RefreshCw, Filter,
    ChevronRight, Briefcase, DollarSign, Lock, ArrowRight, Plus, X, Loader2
} from 'lucide-react';
import { getWalletOverview, getMyTransactions } from '../../services/api';

const WalletTab = ({ sessions = [], loading, userData }) => {
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositStep, setDepositStep] = useState('amount'); // 'amount' | 'card' | 'processing' | 'success'
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [depositedFunds, setDepositedFunds] = useState(() => {
        if (!localStorage.getItem('waseet_wallet_balance')) {
            localStorage.setItem('waseet_wallet_balance', '10000');
            return 10000;
        }
        return parseFloat(localStorage.getItem('waseet_wallet_balance'));
    });

    const myId = useMemo(() => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return (payload._id || payload.sub || payload.id || payload.userId || '').toString();
            }
        } catch (e) { }
        return '';
    }, []);

    const [walletOverview, setWalletOverview] = useState({
        id: '',
        totalVolume: 0,
        holdAmount: 0,
        availableAmount: 0,
        currency: 'USD'
    });
    const [transactions, setTransactions] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    React.useEffect(() => {
        const fetchWalletData = async () => {
            setLoadingData(true);
            try {
                const overviewRes = await getWalletOverview('USD');
                if (overviewRes) {
                    const data = overviewRes?.data?.data ? overviewRes.data.data : (overviewRes?.data || overviewRes);
                    setWalletOverview({
                        id: data.walletId || data.id || data._id || '',
                        totalVolume: data.totalBalance || data.totalVolume || 0,
                        holdAmount: data.hold || data.holdAmount || 0,
                        availableAmount: data.available || data.availableAmount || 0,
                        currency: data.currency || 'USD'
                    });
                }
                const txRes = await getMyTransactions({ limit: 50, page: 1, currency: 'USD' });
                if (txRes && (txRes.transactions || Array.isArray(txRes))) {
                    setTransactions(txRes.transactions || txRes);
                }
            } catch (err) {
                console.error("Error fetching wallet data:", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchWalletData();
    }, []);

    const filteredTransactions = useMemo(() => {
        if (activeFilter === 'all') return transactions;
        return transactions.filter(t => t.status?.toUpperCase() === activeFilter.toUpperCase());
    }, [transactions, activeFilter]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTransactionIcon = (icon) => {
        switch (icon) {
            case 'incoming': return <ArrowDownLeft size={16} className="text-emerald-500" />;
            case 'outgoing': return <ArrowUpRight size={16} className="text-red-400" />;
            case 'escrow': return <Lock size={16} className="text-blue-400" />;
            case 'pending': return <Clock size={16} className="text-amber-500" />;
            case 'disputed': return <AlertCircle size={16} className="text-red-500" />;
            case 'cancelled': return <AlertCircle size={16} className="text-slate-400" />;
            default: return <CreditCard size={16} className="text-slate-400" />;
        }
    };

    const getTransactionBg = (icon) => {
        switch (icon) {
            case 'incoming': return 'bg-emerald-50';
            case 'outgoing': return 'bg-red-50';
            case 'escrow': return 'bg-blue-50';
            case 'pending': return 'bg-amber-50';
            case 'disputed': return 'bg-red-50';
            default: return 'bg-slate-50';
        }
    };

    const getAmountStyle = (type) => {
        switch (type) {
            case 'earned': return 'text-emerald-600';
            case 'spent': return 'text-red-500';
            case 'pending': return 'text-amber-600';
            case 'disputed': return 'text-red-500';
            default: return 'text-slate-700';
        }
    };

    const getAmountPrefix = (type) => {
        if (type === 'earned') return '+';
        if (type === 'spent') return '-';
        return '';
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-emerald-100 text-emerald-700',
            escrow: 'bg-blue-100 text-blue-700',
            pending: 'bg-amber-100 text-amber-700',
            disputed: 'bg-red-100 text-red-700',
            cancelled: 'bg-slate-100 text-slate-500',
        };
        return styles[status] || styles.pending;
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'completed', label: 'Completed' },
        { id: 'escrow', label: 'Escrow' },
        { id: 'pending', label: 'Pending' },
        { id: 'disputed', label: 'Disputed' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-4"
        >
            {/* ── BALANCE CARD (white, blue accents) ── */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Wallet size={20} className="text-[#3B82F6]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">My Wallet</p>
                            <p className="text-[11px] font-medium text-slate-500">{walletOverview.currency || 'USD'} Account</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"
                    >
                        {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>

                <div className="p-6">
                    {/* Balance */}
                    <div className="mb-6">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                        <p className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight">
                            {balanceVisible ? `$${walletOverview.availableAmount.toFixed(2)}` : '••••••'}
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <TrendingUp size={13} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Volume</span>
                            </div>
                            <p className="text-base font-bold text-slate-800">
                                {balanceVisible ? `$${walletOverview.totalVolume.toFixed(2)}` : '••••'}
                            </p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Lock size={13} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On Hold</span>
                            </div>
                            <p className="text-base font-bold text-slate-800">
                                {balanceVisible ? `$${walletOverview.holdAmount.toFixed(2)}` : '••••'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PAYMENT GATEWAY CARD ── */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Payment Gateway</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Add funds to your wallet</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Credit Card */}
                        <button
                            onClick={() => { setShowAddFunds(true); setDepositStep('amount'); setDepositAmount(''); }}
                            className="flex items-center gap-4 p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all group text-left"
                        >
                            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                <CreditCard size={20} className="text-[#3B82F6]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 group-hover:text-[#3B82F6] transition-colors">Credit Card</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Visa, Mastercard</p>
                            </div>
                        </button>
                        {/* Bank Transfer (disabled) */}
                        <button disabled className="flex items-center gap-4 p-5 rounded-xl border border-slate-100 opacity-40 cursor-not-allowed text-left">
                            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Briefcase size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Bank Transfer</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Coming soon</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── GENERATE PAYMENT LINK MODAL ── */}
            <AnimatePresence>
                {showAddFunds && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 text-[#3B82F6] rounded-xl flex items-center justify-center">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] font-bold text-slate-800">Generate Payment Link</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Credit Card</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAddFunds(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                {depositStep === 'amount' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 mb-2 block">Amount (USD)</label>
                                            <input
                                                type="number"
                                                value={depositAmount}
                                                onChange={e => setDepositAmount(e.target.value)}
                                                placeholder="Enter the amount"
                                                className="w-full px-4 py-3.5 text-sm font-medium text-slate-800 bg-[#F8FAFF] border border-blue-100 rounded-xl focus:border-[#3B82F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (parseFloat(depositAmount) > 0) {
                                                    setDepositStep('processing');
                                                    try {
                                                        const reqData = {
                                                            walletId: walletOverview.id,
                                                            amount: depositAmount.toString()
                                                        };
                                                        import('../../services/api').then(api => {
                                                            if (api.generatePaymentLink) {
                                                                api.generatePaymentLink(reqData).then(res => {
                                                                    let finalLink = '';
                                                                    if (typeof res === 'string' && res.startsWith('http')) {
                                                                        finalLink = res;
                                                                    } else {
                                                                        const obj = res?.data || res || {};
                                                                        finalLink = obj.paymentUrl || obj.url || obj.link || obj.paymentLink || obj.checkoutUrl || (typeof obj === 'string' && obj.startsWith('http') ? obj : JSON.stringify(res));
                                                                    }
                                                                    setCardDetails({ ...cardDetails, link: finalLink });
                                                                    setDepositStep('success');
                                                                }).catch(e => {
                                                                    setCardDetails({ ...cardDetails, link: 'API Error: Could not generate link.' });
                                                                    setDepositStep('success');
                                                                });
                                                            } else {
                                                                setTimeout(() => {
                                                                    setCardDetails({ ...cardDetails, link: 'https://waseet-dev.pay/link123' });
                                                                    setDepositStep('success');
                                                                }, 1000);
                                                            }
                                                        });
                                                    } catch (e) {
                                                        setDepositStep('success');
                                                    }
                                                }
                                            }}
                                            disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                                            className="w-full py-3.5 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                            Generate Link
                                        </button>
                                    </motion.div>
                                )}

                                {depositStep === 'processing' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                            <Loader2 size={26} className="text-[#3B82F6] animate-spin" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">Generating Link...</p>
                                        <p className="text-xs text-slate-400 mt-1">This will only take a moment</p>
                                    </motion.div>
                                )}

                                {depositStep === 'success' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center space-y-5">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                                            <CheckCircle size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800">Link Generated!</h4>
                                            <p className="text-sm text-slate-400 mt-1">Your payment link is ready to use.</p>
                                        </div>
                                        <div className="w-full bg-[#F8FAFF] border border-blue-100 rounded-xl p-4 break-all text-xs font-mono text-slate-600 text-left">
                                            {cardDetails.link}
                                        </div>
                                        <button onClick={() => {
                                            if (cardDetails.link && cardDetails.link.startsWith('http')) {
                                                window.open(cardDetails.link, '_blank');
                                            }
                                            setShowAddFunds(false);
                                        }} className="w-full py-3.5 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all">
                                            {cardDetails.link && cardDetails.link.startsWith('http') ? 'Open Link' : 'Done'}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── TRANSACTIONS CARD ── */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <TrendingUp size={16} className="text-[#3B82F6]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Transaction History</h3>
                            <p className="text-[10px] text-slate-400">{transactions.length} total</p>
                        </div>
                    </div>
                    {/* Filter Pills */}
                    <div className="flex gap-1.5 flex-wrap">
                        {filters.map(f => (
                            <button key={f.id} onClick={() => setActiveFilter(f.id)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-200
                                    ${activeFilter === f.id
                                        ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-200'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 space-y-2.5">
                    {loadingData && (
                        <div className="flex justify-center py-12 text-slate-400">
                            <Loader2 size={24} className="animate-spin text-[#3B82F6]" />
                        </div>
                    )}

                    {!loadingData && filteredTransactions.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-14 text-center"
                        >
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <Wallet size={28} className="text-blue-200" />
                            </div>
                            <p className="text-slate-500 text-sm font-bold mb-1">
                                {activeFilter === 'all' ? 'No transactions yet' : `No ${activeFilter} transactions`}
                            </p>
                            <p className="text-slate-400 text-xs max-w-xs">
                                {activeFilter === 'all'
                                    ? 'Your transaction history will appear once you start using sessions'
                                    : 'Try a different filter to see more transactions'
                                }
                            </p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {!loadingData && filteredTransactions.map((t, i) => (
                            <motion.div
                                key={t.id || t._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: i * 0.03 }}
                                className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionBg(t.type || 'incoming')}`}>
                                        {getTransactionIcon(t.type || 'incoming')}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 uppercase">{t.type}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                            {t.sessionId ? `Session ${t.sessionId.substring(0, 8).toUpperCase()}` : 'Wallet Fund'} · {formatDate(t.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className={`font-bold text-sm ${getAmountStyle(t.type || 'earned')}`}>
                                            {getAmountPrefix(t.type || 'earned')}${parseFloat(t.amount || 0).toFixed(2)}
                                        </p>
                                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${getStatusBadge((t.status || 'PENDING').toLowerCase())}`}>
                                            {t.status || 'PENDING'}
                                        </span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#3B82F6] transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── SECURITY NOTICE ── */}
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100/80 shadow-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={15} className="text-[#3B82F6]" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-700">Secure Escrow Protection</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                        All payments are held securely in escrow until both parties confirm completion.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default WalletTab;
