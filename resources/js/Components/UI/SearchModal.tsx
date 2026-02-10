import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    X, 
    Package, 
    User, 
    Receipt, 
    ArrowRight, 
    Command,
    Loader2
} from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface SearchResults {
    products: any[];
    customers: any[];
    sales: any[];
}

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ products: [], customers: [], sales: [] });
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const performSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults({ products: [], customers: [], sales: [] });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/search?q=${q}`);
            setResults(response.data);
            setActiveIndex(0);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => performSearch(query), 300);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && !isOpen) {
                e.preventDefault();
                onClose(); // This might be used differently in parent
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const navigateTo = (url: string) => {
        router.visit(url);
        onClose();
        setQuery('');
    };

    const totalResults = results.products.length + results.customers.length + results.sales.length;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative"
                    >
                        {/* Search Input Area */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                            <Search className="w-6 h-6 text-indigo-500" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search products, customers, or bills... (Esc to close)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-gray-400 dark:text-white"
                            />
                            {loading ? (
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <Command className="w-3 h-3 text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-400">ESC</span>
                                </div>
                            )}
                        </div>

                        {/* Results Area */}
                        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                            {query.length < 2 && !loading && (
                                <div className="py-12 text-center">
                                    <Search className="w-12 h-12 text-gray-100 dark:text-gray-800 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">Type at least 2 characters to search...</p>
                                    <div className="mt-4 flex justify-center gap-2">
                                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">Products</span>
                                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Customers</span>
                                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">Invoices</span>
                                    </div>
                                </div>
                            )}

                            {totalResults > 0 && (
                                <div className="space-y-6">
                                    {/* Products */}
                                    {results.products.length > 0 && (
                                        <div>
                                            <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Products</h3>
                                            {results.products.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => navigateTo(route('inventory.index'))} // Add specific show routes if needed
                                                    className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-2xl flex items-center justify-between group transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white">{p.productName}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{p.productCode} • {p.quantity} in stock</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Customers */}
                                    {results.customers.length > 0 && (
                                        <div>
                                            <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Customers</h3>
                                            {results.customers.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => navigateTo(route('customers.index'))}
                                                    className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-2xl flex items-center justify-between group transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                                                            <User className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{c.customerId} • {c.contactNumber}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Sales */}
                                    {results.sales.length > 0 && (
                                        <div>
                                            <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Invoices</h3>
                                            {results.sales.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => navigateTo(route('billing.index'))}
                                                    className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-2xl flex items-center justify-between group transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                                                            <Receipt className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white">{s.billNumber || 'Unsaved Bill'}</p>
                                                            <p className="text-xs text-gray-500 font-medium">Rs. {Number(s.totalAmount).toLocaleString()} • {new Date(s.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {query.length >= 2 && totalResults === 0 && !loading && (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-bold">No results found for "{query}"</p>
                                    <p className="text-gray-500 text-sm mt-1">Try searching for something else.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-4 text-gray-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-gray-600">Enter</span> to select</span>
                                <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-gray-600">↑↓</span> to navigate</span>
                            </div>
                            <div className="text-indigo-500 font-black tracking-widest uppercase">
                                Quick Search
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
