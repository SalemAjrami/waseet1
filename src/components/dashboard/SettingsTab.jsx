import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Globe, Bell, Shield, Lock, Eye, EyeOff,
    CreditCard, Smartphone, ChevronRight, CheckCircle, ToggleLeft, ToggleRight, Camera, Trash2
} from 'lucide-react';

const Toggle = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-[#3B82F6]' : 'bg-slate-200'}`}
    >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const SectionCard = ({ title, subtitle, icon, children }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const SettingsTab = () => {
    // --- Profile state ---
    const [profile, setProfile] = useState({
        firstName: 'isaac',
        lastName: 'eqdaih',
        displayName: '',
        email: 'isaac@email.com',
        phone: '+970 594 123 456',
        bio: '',
    });

    const [activeSection, setActiveSection] = useState('profile');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6 max-w-6xl mx-auto"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Settings</h1>
                <p className="text-[14px] font-medium text-slate-400 mt-0.5">Manage your account preferences and security settings</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">

                {/* Left Navigation Sidebar */}
                <div className="w-full md:w-[280px] flex-shrink-0">
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-50 flex flex-col gap-1">
                        <button
                            onClick={() => setActiveSection('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeSection === 'profile'
                                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <User size={18} />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveSection('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeSection === 'security'
                                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Shield size={18} />
                            Security
                        </button>
                        <button
                            onClick={() => setActiveSection('notifications')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeSection === 'notifications'
                                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Bell size={18} />
                            Notifications
                        </button>
                        <button
                            onClick={() => setActiveSection('payments')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeSection === 'payments'
                                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <CreditCard size={18} />
                            Payments Methods
                        </button>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-50">

                        {activeSection === 'profile' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-8">Personal Information</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-500">First Name</label>
                                        <input
                                            type="text"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="Enter your first name"
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-500">Last Name</label>
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Enter your last name"
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-[13px] font-bold text-slate-500">Display Name</label>
                                    <input
                                        type="text"
                                        value={profile.displayName}
                                        onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                                        placeholder="Enter your display name"
                                        className="w-full px-4 py-3 border border-slate-100 bg-slate-50/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-[13px] font-bold text-slate-500">Email Address</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-3 border border-slate-100 bg-slate-50/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-[13px] font-bold text-slate-500">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="Enter your phone number"
                                        className="w-full px-4 py-3 border border-slate-100 bg-slate-50/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>

                                <div className="space-y-2 pt-2 pb-6 border-b border-slate-100">
                                    <label className="text-[13px] font-bold text-slate-500">Bio</label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Enter your bio"
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-100 bg-slate-50/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all resize-y min-h-[100px]"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        className="px-6 py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-bold flex items-center gap-2 hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all active:scale-[0.98]"
                                        onClick={() => console.log('Saving...')}
                                    >
                                        <div className="w-4 h-4 rounded border-2 border-white/80 border-t-white bg-transparent opacity-80" /> Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'security' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-8">Security Settings</h2>
                                <p className="text-sm text-slate-500 mb-6">Security preferences content goes here.</p>
                            </motion.div>
                        )}

                        {activeSection === 'notifications' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-8">Notification Preferences</h2>
                                <p className="text-sm text-slate-500 mb-6">Notification preferences content goes here.</p>
                            </motion.div>
                        )}

                        {activeSection === 'payments' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-8">Payment Methods</h2>
                                <p className="text-sm text-slate-500 mb-6">Payment methods content goes here.</p>
                            </motion.div>
                        )}

                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SettingsTab;
