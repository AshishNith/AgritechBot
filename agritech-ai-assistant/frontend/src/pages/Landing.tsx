import { motion } from 'framer-motion';
import { FiCamera, FiMapPin, FiTrendingUp, FiCheck } from 'react-icons/fi';
import { RiPlantLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: <FiCamera size={22} />,
        title: 'Diagnose Crops',
        desc: 'Upload photos of your crops to identify pests and diseases instantly using AI vision with 98% accuracy.',
    },
    {
        icon: <FiMapPin size={22} />,
        title: 'Expert Advice',
        desc: 'Get personalized recommendations from virtual agronomists based on your soil type and local climate data.',
    },
    {
        icon: <FiTrendingUp size={22} />,
        title: 'Market Insights',
        desc: 'Access real-time commodity pricing and trends to sell your produce at the best possible time and price.',
    },
];

const stats = [
    { label: 'Farmers Empowered', value: '50,000+' },
    { label: 'Diagnosis Accuracy', value: '98.2%' },
    { label: 'Provinces Served', value: '12+' },
];

const basicFeatures = ['5 Crop Diagnoses / month', 'Local Weather Alerts', 'Community Forum Access'];
const proFeatures = ['Everything in Basic', 'Unlimited Expert Consults', 'Advanced Market Analytics', 'Priority 24/7 Support'];

const footerLinks = {
    Product: ['Features', 'Pricing', 'Success Stories'],
    Company: ['About Us', 'Blog', 'Careers'],
    Contact: ['support@anaaj.ai', '+1 (555) 123-4567'],
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
    return (
        <div className="min-h-screen bg-background-light text-slate-900 font-sans">
            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-20 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white">
                            <RiPlantLine size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tight">Anaaj AI</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#home" className="text-sm font-semibold hover:text-primary transition-colors">Home</a>
                        <a href="#features" className="text-sm font-semibold hover:text-primary transition-colors">Services</a>
                        <a href="#pricing" className="text-sm font-semibold hover:text-primary transition-colors">Pricing</a>
                        <a href="#footer" className="text-sm font-semibold hover:text-primary transition-colors">Contact</a>
                    </nav>
                    <Link
                        to="/dashboard"
                        className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-light transition-all"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section id="home" className="max-w-7xl mx-auto px-6 lg:px-20 py-16 lg:py-24">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -32 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1"
                    >
                        <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">The Future of Farming</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                            Empowering Farmers with <span className="text-primary">Anaaj AI</span>
                        </h1>
                        <p className="mt-6 text-slate-600 text-lg leading-relaxed max-w-lg">
                            Your modern agricultural assistant for crop diagnosis, expert advice, and real-time market insights.
                            Harvest smarter, not harder.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                to="/dashboard"
                                className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-light transition-all"
                            >
                                Try Anaaj AI Free
                            </Link>
                            <a
                                href="#features"
                                className="rounded-full border-2 border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary transition-all"
                            >
                                Watch Demo
                            </a>
                        </div>
                        <div className="mt-8 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white" />
                                <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-white" />
                                <div className="w-8 h-8 rounded-full bg-primary/40 border-2 border-white" />
                            </div>
                            <p className="text-sm text-slate-500">Joined by <span className="font-semibold text-slate-700">50,000+</span> farmers across 12 provinces</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 32 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 relative"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                            <img
                                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
                                alt="Golden wheat field"
                                className="w-full h-72 lg:h-96 object-cover"
                            />
                        </div>
                        {/* Floating diagnosis card */}
                        <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-primary/10 max-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Crop Diagnosis</span>
                            </div>
                            <p className="text-xs text-slate-700 italic leading-relaxed">
                                "Disease Identified: Wheat Rust. Recommended treatment…"
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-6 lg:px-20">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Cultivating Success with Technology</h2>
                        <p className="mt-4 text-slate-500 leading-relaxed">
                            Anaaj AI combines traditional farming wisdom with cutting-edge artificial intelligence to optimize
                            your harvest and maximize profitability.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-40px' }}
                                variants={fadeUp}
                                className="bg-white rounded-2xl p-8 border border-primary/10 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-20">
                    <div className="grid grid-cols-3 gap-4 lg:gap-8">
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                className="bg-white rounded-2xl p-6 lg:p-10 text-center border border-primary/10 shadow-sm"
                            >
                                <p className="text-primary text-[10px] lg:text-xs font-bold uppercase tracking-[0.15em] mb-2">{s.label}</p>
                                <p className="text-3xl lg:text-5xl font-black tracking-tight">{s.value}</p>
                                <div className="mt-3 mx-auto w-12 h-1 rounded-full bg-primary/20" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-6 lg:px-20">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Simple Plans for Every Farm</h2>
                        <p className="mt-4 text-slate-500 leading-relaxed">
                            Choose the toolkit that fits your scale. No hidden fees, just pure growth.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {/* Basic Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col"
                        >
                            <h3 className="text-xl font-bold">Basic</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-black">$0</span>
                                <span className="text-slate-500 text-sm">/month</span>
                            </div>
                            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                                Essential tools for individual farmers starting their digital journey.
                            </p>
                            <Link
                                to="/dashboard"
                                className="mt-6 block text-center rounded-full bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-colors"
                            >
                                Start Free
                            </Link>
                            <ul className="mt-8 space-y-3 flex-1">
                                {basicFeatures.map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                                        <FiCheck className="text-primary shrink-0" size={16} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Pro Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="relative bg-white rounded-2xl p-8 border-2 border-primary shadow-lg shadow-primary/10 flex flex-col"
                        >
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                                Most Popular
                            </span>
                            <h3 className="text-xl font-bold">Pro</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-black text-primary">$15</span>
                                <span className="text-slate-500 text-sm">/month</span>
                            </div>
                            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                                Advanced analytics and unlimited support for growing operations.
                            </p>
                            <Link
                                to="/dashboard"
                                className="mt-6 block text-center rounded-full bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-light transition-colors"
                            >
                                Go Pro
                            </Link>
                            <ul className="mt-8 space-y-3 flex-1">
                                {proFeatures.map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                                        <FiCheck className="text-primary shrink-0" size={16} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="bg-background-dark text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-20 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                                    <RiPlantLine size={20} />
                                </div>
                                <span className="text-lg font-black tracking-tight">Anaaj AI</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Combining the wisdom of the earth with the intelligence of the future to help farmers grow more.
                            </p>
                        </div>
                        {Object.entries(footerLinks).map(([heading, links]) => (
                            <div key={heading}>
                                <h4 className="font-bold mb-4">{heading}</h4>
                                <ul className="space-y-2">
                                    {links.map((l) => (
                                        <li key={l}>
                                            <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">{l}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 lg:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500">&copy; 2024 Anaaj AI Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <span className="text-xs text-slate-500 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                            <span className="text-xs text-slate-500 hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
