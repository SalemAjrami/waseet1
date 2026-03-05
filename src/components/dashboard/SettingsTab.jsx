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
        firstName: 'Ahmad',
        lastName: 'Al-Bukhait',
        email: 'ahmad@waseet.io',
        phone: '+966 50 123 4567',
        country: 'Saudi Arabia',
        timezone: 'Asia/Riyadh',
        bio: 'Full-stack developer specializing in fintech and escrow platforms.',
    });

    // --- Notification toggles ---
    const [notifs, setNotifs] = useState({
        sessionUpdates: true,
        paymentAlerts: true,
        disputeAlerts: true,
        newMessages: true,
        marketingEmails: false,
        weeklyDigest: true,
        smsAlerts: false,
    });

    // --- Security state ---
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [pwSaved, setPwSaved] = useState(false);
    const [twoFa, setTwoFa] = useState(true);

    // --- Preferences ---
    const [prefs, setPrefs] = useState({
        currency: 'USD',
        language: 'English',
        theme: 'Light',
    });

    // --- Handlers ---
    const handleProfileSave = () => {
        // mock save
    };

    const handlePasswordSave = () => {
        if (!passwords.old || !passwords.new || passwords.new !== passwords.confirm) return;
        setPwSaved(true);
        setPasswords({ old: '', new: '', confirm: '' });
        setTimeout(() => setPwSaved(false), 3000);
    };

    const toggle = (key) => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Settings</h1>
                <p className="text-[13px] font-medium text-slate-400 mt-0.5">Manage your account preferences and notifications.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left column */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Profile */}
                    <SectionCard
                        title="Profile Information"
                        subtitle="Update your personal details"
                        icon={<User size={16} className="text-[#3B82F6]" />}
                    >
                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl font-bold text-[#3B82F6]">
                                    {profile.firstName[0]}{profile.lastName[0]}
                                </div>
                                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#3B82F6] rounded-lg flex items-center justify-center shadow-sm">
                                    <Camera size={11} className="text-white" />
                                </button>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{profile.firstName} {profile.lastName}</p>
                                <p className="text-xs text-slate-400">{profile.email}</p>
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100">
                                    <CheckCircle size={9} /> Verified
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'First Name', key: 'firstName', icon: <User size={13} /> },
                                { label: 'Last Name', key: 'lastName', icon: <User size={13} /> },
                                { label: 'Email Address', key: 'email', icon: <Mail size={13} />, type: 'email' },
                                { label: 'Phone Number', key: 'phone', icon: <Phone size={13} /> },
                                { label: 'Country', key: 'country', icon: <Globe size={13} /> },
                                { label: 'Timezone', key: 'timezone', icon: <Globe size={13} /> },
                            ].map(({ label, key, icon, type }) => (
                                <div key={key}>
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        {icon} {label}
                                    </label>
                                    <input
                                        type={type || 'text'}
                                        value={profile[key]}
                                        onChange={(e) => setProfile(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Bio</label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                rows={2}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                            />
                        </div>

                        <div className="flex justify-end mt-5">
                            <button
                                onClick={handleProfileSave}
                                className="px-5 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all active:scale-[0.98]"
                            >
                                Save Changes
                            </button>
                        </div>
                    </SectionCard>

                    {/* Security */}
                    <SectionCard
                        title="Security"
                        subtitle="Manage your password and login security"
                        icon={<Shield size={16} className="text-[#3B82F6]" />}
                    >
                        {/* 2FA toggle */}
                        <div className="flex items-center justify-between py-3 border-b border-slate-50 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <Smartphone size={14} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Two-Factor Authentication</p>
                                    <p className="text-xs text-slate-400">Extra layer of security for your account</p>
                                </div>
                            </div>
                            <Toggle enabled={twoFa} onToggle={() => setTwoFa(p => !p)} />
                        </div>

                        {/* Change password */}
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Change Password</p>
                        <div className="space-y-3">
                            {[
                                { label: 'Current Password', key: 'old', show: showOldPw, toggle: () => setShowOldPw(p => !p) },
                                { label: 'New Password', key: 'new', show: showNewPw, toggle: () => setShowNewPw(p => !p) },
                                { label: 'Confirm New Password', key: 'confirm', show: showNewPw },
                            ].map(({ label, key, show, toggle: togglePw }) => (
                                <div key={key} className="relative">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={show ? 'text' : 'password'}
                                            value={passwords[key]}
                                            placeholder="••••••••"
                                            onChange={(e) => setPasswords(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                        />
                                        {togglePw && (
                                            <button onClick={togglePw} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                                {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-5">
                            {pwSaved && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                    <CheckCircle size={13} /> Password updated!
                                </span>
                            )}
                            <button
                                onClick={handlePasswordSave}
                                className="ml-auto px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-all active:scale-[0.98]"
                            >
                                Update Password
                            </button>
                        </div>
                    </SectionCard>
                </div>

                {/* Right column */}
                <div className="space-y-6">

                    {/* Notifications */}
                    <SectionCard
                        title="Notifications"
                        subtitle="Choose what to be notified about"
                        icon={<Bell size={16} className="text-[#3B82F6]" />}
                    >
                        <div className="space-y-4">
                            {[
                                { key: 'sessionUpdates', label: 'Session Updates', desc: 'Status changes & new joins' },
                                { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Payments received or held' },
                                { key: 'disputeAlerts', label: 'Dispute Alerts', desc: 'New disputes on your sessions' },
                                { key: 'newMessages', label: 'New Messages', desc: 'In-app messages from users' },
                                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your activity' },
                                { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Critical alerts via SMS' },
                                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'News, tips, and offers' },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{label}</p>
                                        <p className="text-[11px] text-slate-400">{desc}</p>
                                    </div>
                                    <Toggle enabled={notifs[key]} onToggle={() => toggle(key)} />
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Preferences */}
                    <SectionCard
                        title="Preferences"
                        subtitle="Regional and display settings"
                        icon={<Globe size={16} className="text-[#3B82F6]" />}
                    >
                        <div className="space-y-4">
                            {[
                                {
                                    label: 'Default Currency',
                                    key: 'currency',
                                    options: ['USD', 'EUR', 'GBP', 'SAR', 'AED'],
                                },
                                {
                                    label: 'Language',
                                    key: 'language',
                                    options: ['English', 'Arabic', 'French'],
                                },
                                {
                                    label: 'Theme',
                                    key: 'theme',
                                    options: ['Light', 'Dark', 'System'],
                                },
                            ].map(({ label, key, options }) => (
                                <div key={key}>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                                    <select
                                        value={prefs[key]}
                                        onChange={(e) => setPrefs(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all"
                                    >
                                        {options.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <button className="mt-5 w-full py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all active:scale-[0.98]">
                            Save Preferences
                        </button>
                    </SectionCard>

                    {/* Danger zone */}
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-red-50">
                            <p className="text-sm font-bold text-red-600">Danger Zone</p>
                            <p className="text-xs text-slate-400">Irreversible account actions</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:border-red-100 hover:bg-red-50 text-sm text-slate-600 hover:text-red-600 font-medium transition-all group">
                                <span className="flex items-center gap-2">
                                    <Lock size={14} className="text-slate-300 group-hover:text-red-400" />
                                    Disable Account
                                </span>
                                <ChevronRight size={14} className="text-slate-300" />
                            </button>
                            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50 text-sm text-slate-600 hover:text-red-600 font-medium transition-all group">
                                <span className="flex items-center gap-2">
                                    <Trash2 size={14} className="text-slate-300 group-hover:text-red-400" />
                                    Delete Account
                                </span>
                                <ChevronRight size={14} className="text-slate-300" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default SettingsTab;
