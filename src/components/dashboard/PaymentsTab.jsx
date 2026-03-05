import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2 } from 'lucide-react';
import { StatusBadge } from './DashboardWidgets';

const PaymentsTab = ({ payments, loading, handlePaymentClick, handleStatusClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Payments</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Track all your escrow payments and transactions.</p>
                </div>
            </div>
            <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-50">
                <div className="space-y-3">
                    {loading && <div className="flex justify-center py-12 text-slate-400"><Loader2 size={28} className="animate-spin" /></div>}
                    {!loading && payments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                <CreditCard size={28} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">No payments yet</p>
                            <p className="text-slate-300 text-xs">Payments will show up here once sessions are funded</p>
                        </div>
                    )}
                    {!loading && payments.map((p, i) => (
                        <motion.div key={i} whileHover={{ y: -3, scale: 1.01 }} onClick={() => handlePaymentClick(p)}
                            className="group relative flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-white border border-slate-100 rounded-[20px] gap-2.5 cursor-pointer hover:border-emerald-200 hover:shadow-[0_16px_32px_-12px_rgba(16,185,129,0.1)] transition-all duration-300">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                    <CreditCard size={18} className="text-slate-400 group-hover:text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 tracking-tight">#{p.id}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.type}</p>
                                </div>
                            </div>
                            <div className="flex sm:flex-col justify-between items-center sm:items-end gap-1">
                                <p className="font-bold text-sm text-slate-800">{p.amount}</p>
                                <StatusBadge status={p.status} clickable onStatusClick={(e) => handleStatusClick(p.status, e)} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentsTab;
