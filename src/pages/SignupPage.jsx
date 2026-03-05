import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Lock, Phone, Calendar, MapPin, Globe, Tag,
    Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, Shield, Users, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestSignup, verifyEmail, storeTokens } from '../services/api';

const COUNTRY_CODES = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'PS', name: 'Palestine' },
    { code: 'AE', name: 'UAE' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'JO', name: 'Jordan' },
    { code: 'TR', name: 'Turkey' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
];

const SignupPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        identificationName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        city: '',
        countryCode: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState('form'); // 'form' | 'verify' | 'done'
    const [verifyCode, setVerifyCode] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleNameChange = (e) => {
        const updated = { ...form, [e.target.name]: e.target.value };
        if (e.target.name === 'firstName' || e.target.name === 'lastName') {
            const first = e.target.name === 'firstName' ? e.target.value : form.firstName;
            const last = e.target.name === 'lastName' ? e.target.value : form.lastName;
            if (first && last) {
                // Backend requires max 20 chars for identificationName
                updated.identificationName = `${first}-${last}`.toLowerCase().replace(/\s+/g, '-').slice(0, 20);
            }
        }
        setForm(updated);
        setError('');
    };

    const validate = () => {
        const required = ['firstName', 'middleName', 'lastName', 'identificationName', 'email', 'phoneNumber', 'password', 'birthday', 'city', 'countryCode'];
        for (const field of required) {
            if (!form[field]) {
                setError('Please fill in all required fields.');
                return false;
            }
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...userData } = form;
            await requestSignup(userData);
            setStep('verify');
        } catch (err) {
            if (err.response?.status === 409) {
                setError('An account with this email already exists.');
            } else if (err.response?.data?.message) {
                const msg = Array.isArray(err.response.data.message)
                    ? err.response.data.message.join(', ')
                    : err.response.data.message;
                setError(msg);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!verifyCode || verifyCode.length < 4) {
            setError('Please enter the verification code sent to your email.');
            return;
        }
        setVerifyLoading(true);
        setError('');
        try {
            const result = await verifyEmail(form.email, verifyCode);
            if (result.accessToken || result.token) {
                storeTokens(result.accessToken || result.token, result.refreshToken);
            }
            setStep('done');
            setSuccess(true);
        } catch (err) {
            if (err.response?.data?.message) {
                const msg = Array.isArray(err.response.data.message)
                    ? err.response.data.message.join(', ')
                    : err.response.data.message;
                setError(msg);
            } else {
                setError('Invalid or expired verification code.');
            }
        } finally {
            setVerifyLoading(false);
        }
    };

    // ── Verification Code Step ──
    if (step === 'verify') {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full"
                >
                    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] p-8 text-white text-center mb-6">
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full" />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
                            className="relative z-10"
                        >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail size={40} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                            <p className="text-blue-100 text-sm">
                                We've sent a verification code to <span className="font-bold text-white">{form.email}</span>. Enter it below to complete your registration.
                            </p>
                        </motion.div>
                    </div>
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm mb-4 flex items-center gap-2"
                            >
                                <div className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-500 text-xs font-bold">!</span>
                                </div>
                                {error}
                            </motion.div>
                        )}
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    <Shield size={12} className="text-slate-300" /> Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={verifyCode}
                                    onChange={(e) => { setVerifyCode(e.target.value); setError(''); }}
                                    placeholder="Enter code"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all text-sm text-center font-mono text-lg tracking-[0.3em]"
                                    autoFocus
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={verifyLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {verifyLoading ? (
                                    <><Loader2 size={20} className="animate-spin" /> Verifying...</>
                                ) : (
                                    'Verify & Create Account'
                                )}
                            </motion.button>
                        </form>
                        <button
                            onClick={() => { setStep('form'); setError(''); setVerifyCode(''); }}
                            className="mt-4 w-full text-center text-sm text-slate-400 hover:text-[#3B82F6] transition-colors"
                        >
                            ← Back to form
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Success State ──
    if (success) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full"
                >
                    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] p-8 text-white text-center mb-6">
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full" />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
                            className="relative z-10"
                        >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
                            <p className="text-blue-100 text-sm">
                                Your account has been verified and created successfully. You can now sign in.
                            </p>
                        </motion.div>
                    </div>
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
                    >
                        Go to Login
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* ── Left: Gradient Branding Panel ── */}
            <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]">
                {/* Decorative */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-white/5 rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-white/5 rounded-full" />

                <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2.5"
                    >
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 8L8 16L12 8L16 16L20 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-white text-2xl font-bold tracking-tight">Waseet</span>
                    </motion.div>

                    {/* Content */}
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                        >
                            Start securing<br />your deals today
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-blue-100 text-base lg:text-lg max-w-sm mb-10"
                        >
                            Join thousands of professionals who trust Waseet for safe transactions.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-3"
                        >
                            {[
                                { icon: <Shield size={16} />, text: 'Free to create an account' },
                                { icon: <Users size={16} />, text: 'Connect with clients & freelancers' },
                                { icon: <Zap size={16} />, text: 'Get started in minutes' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-blue-100 text-sm">
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    {item.text}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-blue-200/60 text-xs"
                    >
                        © {new Date().getFullYear()} Waseet. All rights reserved.
                    </motion.p>
                </div>
            </div>

            {/* ── Right: Signup Form ── */}
            <div className="flex-1 flex items-center justify-center bg-[#f8f9fc] px-6 py-10 relative overflow-y-auto">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-[#3B82F6] transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={18} /> Home
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg my-8"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
                        <div className="bg-[#3B82F6] p-2 rounded-xl shadow-lg shadow-blue-200">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 8L8 16L12 8L16 16L20 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-[#3B82F6] text-2xl font-bold tracking-tight">Waseet</span>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 sm:p-10">
                        <h1 className="text-2xl font-bold text-slate-800 mb-1 text-center">Create Account</h1>
                        <p className="text-slate-400 text-center mb-6 text-sm">Join Waseet and start securing your deals</p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-2"
                            >
                                <div className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-500 text-xs font-bold">!</span>
                                </div>
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Row */}
                            <div className="grid grid-cols-3 gap-3">
                                <InputField label="First" name="firstName" icon={User} placeholder="First" value={form.firstName} onChange={handleNameChange} />
                                <InputField label="Middle" name="middleName" icon={User} placeholder="Middle" value={form.middleName} onChange={handleChange} />
                                <InputField label="Last" name="lastName" icon={User} placeholder="Last" value={form.lastName} onChange={handleNameChange} />
                            </div>

                            <InputField label="Identification Name" name="identificationName" icon={Tag} placeholder="unique-username" value={form.identificationName} onChange={handleChange} />
                            <InputField label="Email" name="email" icon={Mail} type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                            <InputField label="Phone Number" name="phoneNumber" icon={Phone} placeholder="00xxxxxxxx" value={form.phoneNumber} onChange={handleChange} />

                            {/* Password */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    <Lock size={12} className="text-slate-300" /> Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 characters"
                                        className="w-full px-4 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <InputField label="Confirm Password" name="confirmPassword" icon={Lock} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} />
                            <InputField label="Birthday" name="birthday" icon={Calendar} type="date" value={form.birthday} onChange={handleChange} />

                            {/* City + Country */}
                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="City" name="city" icon={MapPin} placeholder="Gaza" value={form.city} onChange={handleChange} />
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        <Globe size={12} className="text-slate-300" /> Country
                                    </label>
                                    <select
                                        name="countryCode"
                                        value={form.countryCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none"
                                    >
                                        <option value="">Select</option>
                                        {COUNTRY_CODES.map((c) => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <motion.button
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </motion.button>
                        </form>

                        {/* Login link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-400">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-[#3B82F6] font-bold hover:underline"
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const InputField = ({ label, name, icon: Icon, type = 'text', placeholder, value, onChange, ...props }) => (
    <div>
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <Icon size={12} className="text-slate-300" /> {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            {...props}
        />
    </div>
);

export default SignupPage;
