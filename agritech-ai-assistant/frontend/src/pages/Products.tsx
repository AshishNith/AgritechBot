import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShoppingCart, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';

const MOCK_PRODUCTS = [
    { name: 'Organic Fertilizer Plus', price: 625, image: 'https://images.unsplash.com/photo-1585500739684-9e0ba4bfab0d?w=400&q=60', rating: 4.8, reviews: 120, tag: 'Top Pick', cropTag: 'Safe for Wheat' },
    { name: 'Premium Gold Seeds', price: 375, image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400&q=60', rating: 4.5, reviews: 89, cropTag: 'Safe for Wheat' },
    { name: 'NPK Complex 15-15', price: 750, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=60', rating: 4.2, reviews: 45, cropTag: 'Safe for Wheat' },
    { name: 'Neem Oil Pesticide', price: 550, image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=60', rating: 4.7, reviews: 63, cropTag: 'Safe for Wheat' },
    { name: 'BioGuard Natural 10x', price: 1140, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=60', rating: 4.5, reviews: 430, tag: 'Eco-Safe', cropTag: 'Organic' },
    { name: 'FungiStop Pro Liquid', price: 960, image: 'https://images.unsplash.com/photo-1585500739684-9e0ba4bfab0d?w=400&q=60', rating: 4.4, reviews: 290, tag: 'Fast Acting', cropTag: 'All Crops' },
];

const cropTypes = ['Wheat & Grains', 'Rice Varieties', 'Legumes', 'Vegetables'];
const growthStages = ['Pre-plant', 'Seedling', 'Vegetative', 'Flowering'];
const filters = ['Crop: Wheat', 'Growth Stage', 'Brand'];

export default function Products() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState(0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-full"
        >
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-10 flex items-center bg-white/90 backdrop-blur-md p-4 border-b border-primary/10 justify-between">
                <button onClick={() => navigate(-1)} className="text-primary flex w-10 h-10 items-center justify-center rounded-full hover:bg-primary/10">
                    <FiArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-bold flex-1 text-center">Shop Recommendations</h2>
                <button className="relative flex w-10 h-10 items-center justify-center rounded-full hover:bg-primary/10 text-primary">
                    <FiShoppingCart size={20} />
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">3</span>
                </button>
            </header>

            <div className="mx-auto w-full max-w-7xl flex gap-8 px-4 lg:px-8 xl:px-20 py-4 lg:py-8">
                {/* Desktop Sidebar Filters */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <div className="sticky top-24 flex flex-col gap-8">
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">🔧 Filters</h3>

                            <div className="mb-6">
                                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Crop Type</h4>
                                <div className="space-y-2">
                                    {cropTypes.map((c, i) => (
                                        <label key={c} className="flex items-center gap-3 cursor-pointer group">
                                            <input defaultChecked={i === 0} type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Growth Stage</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {growthStages.map((s, i) => (
                                        <button key={s} className={`rounded-lg border px-3 py-2 text-xs font-bold ${i === 0 ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-primary'} transition-colors`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Price Range (₹)</h4>
                                <div className="flex items-center gap-2">
                                    <input className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary" placeholder="Min" type="number" />
                                    <span className="text-slate-400">-</span>
                                    <input className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary" placeholder="Max" type="number" />
                                </div>
                            </div>

                            <button className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-light transition-all">
                                Apply Filters
                            </button>
                        </div>

                        <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">🤖</div>
                            <h4 className="text-sm font-bold">AI Recommendation</h4>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">Based on your recent soil test, we recommend Phosphorous-rich fertilizers for your upcoming wheat cycle.</p>
                            <a className="mt-3 inline-block text-xs font-bold text-primary hover:underline" href="#">View AI Plan →</a>
                        </div>
                    </div>
                </aside>

                {/* Main content area */}
                <div className="flex-1 min-w-0">
                    {/* Desktop page title */}
                    <div className="hidden lg:block mb-8">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Agricultural Essentials</h1>
                        <p className="mt-1 text-slate-500">Premium quality seeds, fertilizers, and pesticides vetted by AI agronomy.</p>
                    </div>

                    {/* Mobile Filters */}
                    <section className="lg:hidden flex gap-3 pb-4 overflow-x-auto no-scrollbar">
                        {filters.map((f, i) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(i)}
                                className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${
                                    i === activeFilter
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                                {f}
                                <FiChevronDown size={14} />
                            </button>
                        ))}
                    </section>

                    <div className="pb-2">
                        <p className="text-sm font-medium text-slate-500">Based on your Wheat crop health diagnosis</p>
                    </div>

                    {/* Product Grid — 2 cols mobile, 3 cols desktop */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pb-8">
                        {MOCK_PRODUCTS.map((p, i) => (
                            <ProductCard
                                key={i}
                                name={p.name}
                                price={p.price}
                                image={p.image}
                                rating={p.rating}
                                reviews={p.reviews}
                                tag={p.tag}
                                cropTag={p.cropTag}
                            />
                        ))}
                    </div>

                    {/* Bundle Deal */}
                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="font-bold mb-4 lg:text-xl">Complete Care Package</h3>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col lg:flex-row rounded-xl shadow-lg bg-white overflow-hidden border border-primary/10"
                        >
                            <div className="w-full lg:w-80 aspect-video lg:aspect-auto bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=60')]" />
                            <div className="p-4 lg:p-6 flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-primary text-xs font-bold uppercase tracking-wide">Bundle Deal</p>
                                        <p className="text-lg font-bold">Wheat Growth Kit</p>
                                    </div>
                                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">SAVE 15%</span>
                                </div>
                                <div className="flex items-end gap-3 justify-between mt-4">
                                    <div>
                                        <p className="text-slate-500 text-sm">Fertilizer + Pesticide + Zinc</p>
                                        <p className="text-primary text-xl font-bold">₹1375 <span className="text-slate-400 line-through text-sm ml-2">₹1625</span></p>
                                    </div>
                                    <button className="rounded-xl h-10 px-4 bg-primary text-white text-sm font-bold shadow-lg hover:bg-primary-light transition-colors">
                                        Add Kit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
