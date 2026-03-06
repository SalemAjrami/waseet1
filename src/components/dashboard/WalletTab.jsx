import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Clock, CheckCircle, CreditCard, Eye, EyeOff,
    Briefcase, DollarSign, ArrowRight, Plus, X, Loader2, FileText
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
            className="space-y-8 max-w-6xl mx-auto"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Wallet</h1>
                <p className="text-[14px] font-medium text-slate-400 mt-0.5">Track and manage your payment transactions</p>
            </div>

            {/* ── STATS ROW (Total Volume, Hold, Available) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[12px] font-bold text-slate-400">Total Volume</span>
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <DollarSign size={14} className="text-[#3B82F6]" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
                            ${walletOverview.totalVolume}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">All Transactions</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[12px] font-bold text-slate-400">Hold</span>
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Clock size={14} className="text-[#3B82F6]" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
                            ${walletOverview.holdAmount}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">On Hold</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-col justify-between border-b-4 border-b-[#3B82F6]">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[12px] font-bold text-slate-400">Available</span>
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <CheckCircle size={14} className="text-[#3B82F6]" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
                            ${walletOverview.availableAmount}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Ready to use</p>
                    </div>
                </div>
            </div>

            {/* ── TRANSACTIONS CARD ── */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-50 overflow-hidden">
                <div className="px-8 py-6">
                    <h3 className="text-lg font-bold text-slate-800">Transactions</h3>
                </div>

                <div className="px-8 pb-8 space-y-4">
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
                                className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-[#fafcff] border border-blue-50/50 hover:border-blue-100 hover:bg-blue-50/20 transition-all cursor-default shadow-[inset_0_2px_10px_-4px_rgba(0,0,0,0.02)]"
                            >
                                <div className="mb-4 md:mb-0">
                                    <p className="font-bold text-[14px] text-slate-800 tracking-tight">
                                        Transaction #{t.id?.substring(0, 8) || '78921234'}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1">
                                        Credit Card • {formatDate(t.createdAt)} • Session: {t.sessionId ? t.sessionId.substring(0, 8).toUpperCase() : 'N/A'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto">
                                    <div className="text-center min-w-[60px]">
                                        <p className="font-extrabold text-[15px] text-slate-800">
                                            {getAmountPrefix(t.type)}${parseFloat(t.amount || 0)}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400">{t.currency || 'USD'}</p>
                                    </div>

                                    <div className="text-center min-w-[100px]">
                                        <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                                            {t.type || 'WITHDRAW'}
                                        </p>
                                    </div>

                                    <div className="min-w-[90px] text-center">
                                        <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500' :
                                                t.status === 'FAILED' ? 'bg-red-50 text-red-500' :
                                                    'bg-blue-50 text-blue-500'
                                            }`}>
                                            {t.status || 'PENDING'}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-200">
                                            <Eye size={14} /> View
                                        </button>
                                        <button className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-200">
                                            <FileText size={14} /> Receipt
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── PAYMENT GATEWAY CARD ── */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-50 overflow-hidden">
                <div className="px-8 py-6">
                    <h3 className="text-lg font-bold text-slate-800">Payment Gateway</h3>
                </div>
                <div className="px-8 pb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Credit Card */}
                        <button
                            onClick={() => { setShowAddFunds(true); setDepositStep('amount'); setDepositAmount(''); }}
                            className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-slate-100 hover:border-[#3B82F6] hover:bg-blue-50/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <CreditCard size={24} className="text-slate-400 group-hover:text-[#3B82F6]" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 group-hover:text-[#3B82F6] transition-colors">Credit Card</p>
                        </button>

                        <button disabled className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-slate-100 opacity-40 cursor-not-allowed">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                <Briefcase size={24} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">Bank Transfer</p>
                        </button>

                        <button disabled className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-slate-100 opacity-40 cursor-not-allowed">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                <Wallet size={24} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">Crypto</p>
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
                            className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-[#3B82F6] rounded-2xl flex items-center justify-center">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Add Funds</h3>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">Credit Card</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAddFunds(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                {depositStep === 'amount' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">Amount (USD)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    value={depositAmount}
                                                    onChange={e => setDepositAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-8 pr-4 py-4 text-lg font-bold text-slate-800 bg-[#fafcff] border border-blue-100/50 rounded-2xl focus:border-[#3B82F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                                                />
                                            </div>
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
                                            className="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Generate Payment Link
                                        </button>
                                    </motion.div>
                                )}

                                {depositStep === 'processing' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                            <Loader2 size={30} className="text-[#3B82F6] animate-spin" />
                                        </div>
                                        <p className="text-base font-bold text-slate-800">Processing Request</p>
                                        <p className="text-sm text-slate-400 mt-2">Generating your secure payment link...</p>
                                    </motion.div>
                                )}

                                {depositStep === 'success' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center space-y-6">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                            <CheckCircle size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800">Success!</h4>
                                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">Your payment link has been generated. Click below to proceed with the transaction.</p>
                                        </div>
                                        <div className="w-full bg-[#fafcff] border border-blue-100 rounded-2xl p-4 break-all text-xs font-mono text-slate-600 text-left">
                                            {cardDetails.link}
                                        </div>
                                        <button onClick={() => {
                                            if (cardDetails.link && cardDetails.link.startsWith('http')) {
                                                window.open(cardDetails.link, '_blank');
                                            }
                                            setShowAddFunds(false);
                                        }} className="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all">
                                            {cardDetails.link && cardDetails.link.startsWith('http') ? 'Open Payment Gateway' : 'Done'}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default WalletTab;
