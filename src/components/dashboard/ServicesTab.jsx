import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Handshake, Shield } from 'lucide-react';

const ServicesTab = ({ setActiveTab }) => {
    const services = [
        {
            icon: <Handshake size={32} />,
            title: 'Freelancer Pre-Pay',
            desc: 'Secure payments for freelance work. Funds are held in escrow until both parties confirm delivery.',
        },
        {
            icon: <ShoppingBag size={32} />,
            title: 'Marketplace Escrow',
            desc: 'Buy and sell with confidence. Your payment is protected until you receive and approve the goods.',
            comingSoon: true,
        },
        {
            icon: <Shield size={32} />,
            title: 'Rental Deposit',
            desc: 'Safeguard rental deposits for both tenants and landlords with transparent escrow management.',
            comingSoon: true,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Our Services</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Discover the secure and convenient solutions we offer for your transactions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -8, scale: 1.01 }}
                        className="group relative bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-100 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.1)]"
                    >
                        {/* Hover Indicator */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-[#3B82F6] rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />

                        <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors text-[#3B82F6]">
                            {service.icon}
                        </div>

                        <h3 className="text-[17px] font-bold text-slate-800 mb-4 group-hover:text-[#3B82F6] transition-colors">
                            {service.title}
                        </h3>

                        <p className="text-[13px] text-slate-400 leading-relaxed mb-8 px-2 font-medium">
                            {service.desc}
                        </p>

                        {service.comingSoon ? (
                            <span className="px-6 py-2.5 rounded-xl border-2 border-slate-100 text-slate-300 text-[13px] font-bold">
                                Coming Soon
                            </span>
                        ) : (
                            <button
                                onClick={() => setActiveTab('createSession')}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-blue-50 text-[#3B82F6] text-[13px] font-bold group-hover:bg-[#3B82F6] group-hover:text-white group-hover:border-[#3B82F6] transition-all duration-300 active:scale-95"
                            >
                                Start <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </motion.div>
                ))}

                {/* Coming Soon Placeholder */}
                <div className="bg-white/40 rounded-[32px] p-8 border-2 border-dashed border-slate-100 flex items-center justify-center min-h-[350px]">
                    <p className="text-slate-300 font-bold text-lg tracking-tight">More Coming Soon ...</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ServicesTab;
