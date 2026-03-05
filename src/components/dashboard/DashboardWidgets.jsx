import React from 'react';
import { motion } from 'framer-motion';

export const SummaryCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
    // Light background colors for specific icon wrappers
    const bgColors = {
        blue: 'bg-blue-50 text-blue-500',
        emerald: 'bg-indigo-50 text-indigo-500',
        violet: 'bg-sky-50 text-sky-500',
        red: 'bg-red-50 text-red-500'
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 hover:shadow-md transition-all cursor-default flex flex-col justify-between min-h-[140px]"
        >
            <div className="flex justify-between items-start mb-6 w-full">
                <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{title}</span>
                <div className={`p-2 rounded-lg ${bgColors[color] || bgColors.blue}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-[28px] leading-none font-bold text-slate-800 tracking-tight mb-2">{value}</p>
                <p className="text-[12px] text-slate-400 font-medium">{subtitle}</p>
            </div>
        </motion.div>
    );
};

export const StatusBadge = ({ status, clickable, onStatusClick }) => {
    const styles = {
        'Completed': 'bg-slate-200 text-slate-700',
        'Active': 'bg-[#3B82F6] text-white',
        'Awaiting Payment': 'bg-slate-100 text-slate-500',
        'In Progress': 'bg-slate-100 text-slate-500',
        'Pending': 'bg-slate-100 text-slate-500',
        'Failed': 'bg-red-100 text-red-600',
        'Confirmed': 'bg-[#3B82F6] text-white',
        'Held': 'bg-slate-100 text-slate-500',
        'Created': 'bg-slate-100 text-slate-500',
        'Resolved': 'bg-slate-200 text-slate-700',
    };
    const styleClass = styles[status] || 'bg-slate-100 text-slate-500';
    const isLive = status === 'Active' || status === 'In Progress' || status === 'Confirmed' || status === 'Held';

    return (
        <span
            onClick={onStatusClick}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${clickable ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' : ''} ${styleClass}`}
        >
            {isLive && (
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                </span>
            )}
            {status}
        </span>
    );
};
