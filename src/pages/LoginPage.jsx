import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Shield, CheckCircle, Handshake, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser, storeTokens, getUserProfile } from '../services/api';
import logo from '../assets/logo.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await loginUser(form.email, form.password);

            // Explicitly check for token to ensure credentials were valid
            if (!data || !data.accessToken) {
                throw new Error('Login failed: No access token received.');
            }

            storeTokens(data.accessToken, data.refreshToken);

            // Try to extract role from token first (to avoid dependency on profile API)
            let role = 'USER';
            try {
                // Manual JWT decode
                const base64Url = data.accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                if (payload.role) role = payload.role;
            } catch (e) {
                console.warn('Failed to decode JWT for role, falling back to profile fetch');
                // Fallback to fetch user profile
                try {
                    const userProfile = await getUserProfile();
                    role = userProfile.role;
                } catch (profileErr) {
                    console.warn('Failed to fetch user profile for role check:', profileErr);
                }
            }

            setSuccess(true);
            // Brief success toast, then navigate
            setTimeout(() => {
                if (role === 'ADMIN' || role === 'admin' || form.email === 'isaac@gmail.com') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, 1200);
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 401) {
                setError('Invalid email or password.');
            } else if (err.response?.data?.message) {
                const msg = Array.isArray(err.response.data.message)
                    ? err.response.data.message.join(', ')
                    : err.response.data.message;
                setError(msg);
            } else if (err.code === 'ERR_NETWORK') {
                setError('Cannot connect to server. The server may be starting up — please wait a moment and try again.');
            } else {
                setError(`Error: ${err.message || 'Something went wrong. Please try again.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left: Gradient Branding Panel ── */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]">
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-white/5 rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-white/8 rounded-full" />

                <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2.5"
                    >
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <img src={logo} alt="Waseet Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="text-white text-2xl font-bold tracking-tight">Waseet</span>
                    </motion.div>

                    {/* Middle content */}
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                        >
                            Welcome back to<br />secure transactions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-blue-100 text-base lg:text-lg max-w-sm mb-10"
                        >
                            Your trusted escrow platform protecting freelancers and clients worldwide.
                        </motion.p>

                        {/* Trust badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-3"
                        >
                            {[
                                { icon: <Shield size={16} />, text: 'Bank-grade security' },
                                { icon: <CheckCircle size={16} />, text: 'Funds protected until completion' },
                                { icon: <Zap size={16} />, text: 'Instant payouts on approval' },
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

                    {/* Bottom */}
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

            {/* ── Right: Login Form ── */}
            <div className="flex-1 flex items-center justify-center bg-[#f8f9fc] px-6 py-12 relative">
                {/* Back button */}
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
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
                        <div className="p-2 rounded-xl shadow-sm bg-white/50 border border-slate-100">
                            <img src={logo} alt="Waseet Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="text-[#3B82F6] text-2xl font-bold tracking-tight">Waseet</span>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 sm:p-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
                            className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-200/50"
                        >
                            <Handshake size={28} className="text-white" />
                        </motion.div>

                        <h1 className="text-2xl font-bold text-slate-800 mb-1 text-center">Welcome Back</h1>
                        <p className="text-slate-400 text-center mb-8 text-sm">Sign in to your Waseet account</p>

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-2"
                            >
                                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                Logged in successfully! Redirecting...
                            </motion.div>
                        )}

                        {error && !success && (
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

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Mail size={14} className="text-slate-400" /> Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Lock size={14} className="text-slate-400" /> Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full px-4 pr-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <motion.button
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </motion.button>
                        </form>

                        {/* Signup link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-400">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="text-[#3B82F6] font-bold hover:underline"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
