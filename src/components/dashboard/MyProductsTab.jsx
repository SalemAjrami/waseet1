import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Code, FileText, Bookmark, Plus, Download, Search } from 'lucide-react';

const MyProductsTab = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Software', 'Documents', 'Licenses'];

    // Mock stats based on screenshot
    const stats = [
        { title: 'TOTAL PRODUCTS', value: '3', icon: <Package size={20} className="text-blue-500" />, color: 'bg-blue-50' },
        { title: 'SOFTWARES', value: '1', icon: <Code size={20} className="text-teal-500" />, color: 'bg-teal-50' },
        { title: 'DOCUMENTS', value: '1', icon: <FileText size={20} className="text-purple-500" />, color: 'bg-purple-50' },
        { title: 'LICENSES', value: '1', icon: <Bookmark size={20} className="text-amber-500" />, color: 'bg-amber-50' }
    ];

    // Mock products based on screenshot
    const products = [
        {
            id: 1,
            title: 'Software License Transfer',
            category: 'SOFTWARE',
            description: 'Transfer of perpetual license for Adobe Creative Suite 6 Master Collection.',
            price: '$500.00',
            badgeBg: 'bg-blue-50',
            badgeText: 'text-blue-500'
        },
        {
            id: 2,
            title: 'Project Documentation',
            category: 'DOCUMENTS',
            description: 'Complete technical architecture for a Fintech application.',
            price: '$150.00',
            badgeBg: 'bg-purple-50',
            badgeText: 'text-purple-500'
        },
        {
            id: 3,
            title: 'Enterprise SSL',
            category: 'LICENSES',
            description: 'Standard validation certificate for enterprise subdomains.',
            price: '$200.00',
            badgeBg: 'bg-amber-50',
            badgeText: 'text-amber-500'
        }
    ];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || p.category.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">My Products</h1>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">Manage your digital products and inventory</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200">
                    <Plus size={16} strokeWidth={3} /> Add Product
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[140px]">
                        <div className="flex justify-start items-start mb-6">
                            <div className={`p-3 rounded-2xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-[28px] leading-none font-bold text-slate-800 tracking-tight mb-2">{stat.value}</p>
                            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-slate-100 bg-slate-50/50 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === filter
                                    ? 'bg-blue-50 text-[#3B82F6] shadow-sm'
                                    : 'bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-slate-800 text-[15px] max-w-[70%]">{product.title}</h3>
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase ${product.badgeBg} ${product.badgeText}`}>
                                {product.category}
                            </span>
                        </div>

                        <p className="text-[13px] text-slate-500 leading-relaxed mb-6 flex-1">
                            {product.description}
                        </p>

                        <div className="flex justify-between items-center mb-6">
                            <p className="font-extrabold text-slate-800 text-xl tracking-tight">{product.price}</p>
                            <button className="flex items-center gap-1.5 text-blue-500 text-xs font-bold hover:text-blue-600 transition-colors">
                                <Download size={14} strokeWidth={2.5} /> Download
                            </button>
                        </div>

                        <div className="flex border-t border-slate-50 pt-4 mt-auto">
                            <button className="flex-1 flex justify-center py-2 text-slate-400 text-xs font-bold hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                Edit
                            </button>
                            <button className="flex-1 flex justify-center py-2 text-slate-400 text-xs font-bold hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border-x border-slate-50">
                                View
                            </button>
                            <button className="flex-1 flex justify-center py-2 text-slate-400 text-xs font-bold hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-50 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Products Found</h3>
                        <p className="text-sm text-slate-400 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MyProductsTab;
