import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, MapPin, Globe, Shield } from 'lucide-react';

const ProfileTab = ({ userData }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 font-bold text-2xl shadow-sm border border-violet-200">
                        {(userData.firstName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">{userData.firstName} {userData.middleName} {userData.lastName}</h1>
                        <p className="text-[13px] font-medium text-slate-400 mt-0.5">@{userData.identificationName || '—'}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-[28px] p-8 shadow-sm border border-slate-50 max-w-2xl">
                <div className="space-y-4">
                    {[
                        { label: 'Email', value: userData.email, icon: <Mail size={14} className="text-slate-400" /> },
                        { label: 'Birthday', value: userData.birthday ? new Date(userData.birthday).toLocaleDateString() : '—', icon: <Calendar size={14} className="text-slate-400" /> },
                        { label: 'City', value: userData.city, icon: <MapPin size={14} className="text-slate-400" /> },
                        { label: 'Country', value: userData.countryCode, icon: <Globe size={14} className="text-slate-400" /> },
                        { label: 'Role', value: Array.isArray(userData.role) ? userData.role.join(', ') : userData.role, icon: <Shield size={14} className="text-slate-400" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                            <span className="text-sm text-slate-400 font-medium flex items-center gap-2">{item.icon} {item.label}</span>
                            <span className="text-sm font-bold text-slate-700">{item.value || '—'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileTab;
