import React from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Handshake,
    Lock,
    Zap,
    ShieldCheck,
    Laptop,
    FileText,
    Users,
    Settings,
    CreditCard,
    CheckSquare,
    ArrowRight,
    MapPin,
    Mail,
    Phone,
    Instagram,
    Twitter,
    Facebook,
} from 'lucide-react';
import logo from '../assets/logo.png';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const LandingPage = ({ onLogin, onSignup }) => {
    return (
        <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-800 overflow-x-hidden">

            {/* --- 1. NAVIGATION --- */}
            <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl shadow-sm bg-white border border-slate-100">
                        <img src={logo} alt="Waseet Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-[#3B82F6] text-2xl font-bold tracking-tight">Waseet</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onLogin}
                        className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-blue-50 transition-all"
                    >
                        Login
                    </button>
                    <button
                        onClick={onSignup}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200/60 transition-all"
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* --- 2. HERO SECTION --- */}
            <header className="flex flex-col items-center justify-center mt-16 mb-28 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-blue-50 text-[#3B82F6] text-xs font-bold px-4 py-2 rounded-full mb-6 border border-blue-100"
                >
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse" />
                    Trusted Escrow Platform
                </motion.div>
                <motion.h1
                    initial="hidden" animate="visible" variants={fadeInUp}
                    className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 max-w-5xl leading-tight"
                >
                    Secure Your Freelance Deals with <span className="text-[#3B82F6]">Waseet</span>
                </motion.h1>
                <motion.p
                    initial="hidden" animate="visible" variants={{ ...fadeInUp, visible: { ...fadeInUp.visible, transition: { delay: 0.2 } } }}
                    className="max-w-2xl text-lg text-slate-400 mb-12"
                >
                    The trusted escrow platform that protects freelancers and clients with secure payments,
                    transparent processes, and peace of mind for every project.
                </motion.p>

                {/* Animated Connection Graphic */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-4 sm:gap-6 mb-16"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                            <User className="text-[#3B82F6] w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Freelancer</span>
                    </div>

                    <div className="flex items-center relative">
                        <div className="h-[2px] w-12 sm:w-20 bg-blue-100 relative overflow-hidden">
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-60"
                            />
                        </div>
                        <motion.div
                            className="mx-3 bg-white p-3 rounded-2xl border border-blue-50 shadow-lg shadow-blue-100/50"
                            animate={{ rotate: [0, -5, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            <Handshake className="text-[#3B82F6] w-10 h-10 sm:w-12 sm:h-12" />
                        </motion.div>
                        <div className="h-[2px] w-12 sm:w-20 bg-blue-100 relative overflow-hidden">
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
                                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-60"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                            <User className="text-[#3B82F6] w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Client</span>
                    </div>
                </motion.div>

                <div className="flex gap-4 w-full max-w-sm">
                    <button
                        onClick={onLogin}
                        className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-blue-50 transition-all"
                    >
                        Login
                    </button>
                    <button
                        onClick={onSignup}
                        className="flex-1 py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:shadow-2xl transition-all"
                    >
                        Sign Up
                    </button>
                </div>
            </header>

            {/* --- 3. WHY CHOOSE SECTION --- */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] py-24 px-6 rounded-t-[4rem]">
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/5 rounded-full" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-blue-100 text-xs font-bold px-4 py-2 rounded-full mb-6"
                    >
                        <ShieldCheck size={14} /> Why Choose Us
                    </motion.div>
                    <motion.h2
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-4xl md:text-5xl font-bold text-white mb-16"
                    >
                        Why Choose Waseet?
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Secure Escrow", icon: <Lock size={28} />, desc: "Your funds are protected until both parties confirm the transaction is complete." },
                            { title: "Instant Delivery", icon: <Zap size={28} />, desc: "Digital products are delivered instantly upon payment confirmation." },
                            { title: "Dispute Protection", icon: <ShieldCheck size={28} />, desc: "Built in dispute resolution system to handle any issues that may arise." }
                        ].map((item, i) => (
                            <motion.div
                                key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }} variants={fadeInUp}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-white rounded-[28px] p-10 shadow-xl flex flex-col items-center transition-all"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-200/50">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-800">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 4. OUR SERVICES SECTION --- */}
            <section className="py-24 px-6 bg-[#f8f9fc]">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="inline-flex items-center gap-2 bg-blue-50 text-[#3B82F6] text-xs font-bold px-4 py-2 rounded-full mb-6 border border-blue-100"
                    >
                        <Settings size={14} /> Our Services
                    </motion.div>
                    <motion.h2
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-4xl font-bold text-slate-800 mb-16"
                    >
                        Built for <span className="text-[#3B82F6]">Every Use Case</span>
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { title: "Freelancer Pre-Pay", icon: <Laptop />, desc: "Manage and secure payments between clients and freelancers, ensuring safe transactions.", gradient: "from-blue-500 to-blue-600" },
                            { title: "Digital Product Trade", icon: <FileText />, desc: "A secure platform for trading or exchanging digital products like files, licenses, and services.", gradient: "from-emerald-500 to-emerald-600" },
                            { title: "Accounts", icon: <Users />, desc: "A secure platform for buying and selling digital accounts with guaranteed payment protection.", gradient: "from-violet-500 to-violet-600" },
                            { title: "Custom Exchange", icon: <Settings />, desc: "A trusted platform for custom exchanges between users with secure payments and verified delivery.", gradient: "from-rose-500 to-rose-600" }
                        ].map((s, i) => (
                            <motion.div
                                key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }} variants={fadeInUp}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="p-8 border border-slate-100 rounded-[28px] shadow-sm hover:shadow-xl bg-white transition-all group"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    {React.cloneElement(s.icon, { size: 24 })}
                                </div>
                                <h4 className="text-lg font-bold mb-3 text-slate-800">{s.title}</h4>
                                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 5. HOW IT WORKS SECTION --- */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] py-24 px-6 text-white">
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-blue-100 text-xs font-bold px-4 py-2 rounded-full mb-6"
                    >
                        <Zap size={14} /> How It Works
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-4">How Waseet Works</h2>
                    <p className="text-blue-100 mb-16 max-w-lg mx-auto">Our simple 4-step process ensures secure and seamless digital product exchanges</p>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {[
                            { title: "Create Session", icon: <Users size={36} />, desc: "Freelancers and clients connect on our secure platform." },
                            { title: "Agree", icon: <Handshake size={36} />, desc: "Both parties review and agree on the terms." },
                            { title: "Secure Payment", icon: <CreditCard size={36} />, desc: "Payment is securely held in escrow until completion." },
                            { title: "Safe Exchange", icon: <CheckSquare size={36} />, desc: "Work is delivered, approved, and payment is released." }
                        ].map((step, i, arr) => (
                            <React.Fragment key={i}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                                    whileHover={{ y: -8, scale: 1.03 }}
                                    className="flex-1 w-full max-w-[260px] aspect-square border border-white/10 rounded-[28px] p-8 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md shadow-lg transition-all"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-5 text-[#3B82F6] shadow-lg shadow-blue-900/20">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-xs text-blue-100 px-2">{step.desc}</p>
                                </motion.div>
                                {i < arr.length - 1 && <ArrowRight className="hidden lg:block text-blue-200/50" size={28} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 6. FINAL CTA --- */}
            <section className="py-24 px-6 text-center bg-[#f8f9fc]">
                <motion.div
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-[#3B82F6] text-xs font-bold px-4 py-2 rounded-full mb-6 border border-blue-100">
                        <ShieldCheck size={14} /> Get Started
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
                        Secure & Transparent <span className="text-[#3B82F6]">Transactions</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-12">Join thousands of users who trust Waseet for digital product exchanges</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={onLogin}
                        className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center gap-3 mx-auto text-lg hover:shadow-2xl transition-all"
                    >
                        Get Started Today <ArrowRight size={24} />
                    </motion.button>
                </motion.div>
            </section>

            {/* --- 7. FOOTER --- */}
            <footer className="bg-slate-800 text-white pt-20 pb-10 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-1">
                            <div className="flex items-center gap-2.5 font-bold text-2xl mb-4">
                                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                                    <img src={logo} alt="Waseet Logo" className="w-5 h-5 object-contain" />
                                </div>
                                Waseet
                            </div>
                            <p className="text-slate-400 text-sm">Your trusted escrow platform.</p>
                        </div>
                        <div className="space-y-3 text-sm">
                            <h5 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-500">Quick Links</h5>
                            <button
                                type="button"
                                onClick={onLogin}
                                className="hover:text-[#3B82F6] cursor-pointer transition-colors text-left block text-slate-400"
                            >
                                Login
                            </button>
                            <p
                                onClick={onSignup}
                                className="hover:text-[#3B82F6] cursor-pointer transition-colors text-slate-400"
                            >
                                Sign up
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-500">Help Center</h5>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li className="hover:text-[#3B82F6] cursor-pointer transition-colors">FAQs</li>
                                <li className="hover:text-[#3B82F6] cursor-pointer transition-colors">Terms of Use</li>
                                <li className="hover:text-[#3B82F6] cursor-pointer transition-colors">Privacy Policy</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-500">Information</h5>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <MapPin size={18} className="text-slate-500" /> Palestine - Gaza Strip
                            </div>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-500">Contact Us</h5>
                            <div className="space-y-3 text-sm text-slate-400 mb-6">
                                <div className="flex items-center gap-3"><Mail size={16} className="text-slate-500" /> waseet@gmail.com</div>
                                <div className="flex items-center gap-3"><Phone size={16} className="text-slate-500" /> +972597841331</div>
                            </div>
                            <div className="flex gap-4">
                                <Instagram size={20} className="text-slate-500 cursor-pointer hover:text-[#3B82F6] transition-colors" />
                                <Twitter size={20} className="text-slate-500 cursor-pointer hover:text-[#3B82F6] transition-colors" />
                                <Facebook size={20} className="text-slate-500 cursor-pointer hover:text-[#3B82F6] transition-colors" />
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-700 pt-8 text-center text-[11px] font-medium text-slate-500 tracking-wider">
                        Copyright © {new Date().getFullYear()} Waseet. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
