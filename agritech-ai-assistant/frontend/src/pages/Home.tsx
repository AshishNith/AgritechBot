import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMic, FiCamera, FiSearch, FiChevronRight } from 'react-icons/fi';
import { RiPlantLine, RiBugLine, RiSeedlingLine, RiCloudLine, RiLineChartLine, RiShoppingCartLine } from 'react-icons/ri';

const helpCards = [
    { icon: <RiPlantLine size={20} />, title: 'Diagnose Crop', desc: 'Identify diseases', color: 'bg-orange-100 text-orange-600', link: '/diagnosis' },
    { icon: <RiBugLine size={20} />, title: 'Pest Problem', desc: 'Control & solutions', color: 'bg-red-100 text-red-600', link: '/chat' },
    { icon: <RiSeedlingLine size={20} />, title: 'Fertilizer Advice', desc: 'Optimal soil health', color: 'bg-green-100 text-green-600', link: '/chat' },
    { icon: <RiCloudLine size={20} />, title: 'Weather', desc: 'Rain & wind alerts', color: 'bg-blue-100 text-blue-600', link: '/chat' },
    { icon: <RiLineChartLine size={20} />, title: 'Market Prices', desc: 'Latest Mandi rates', color: 'bg-yellow-100 text-yellow-600', link: '/chat' },
    { icon: <RiShoppingCartLine size={20} />, title: 'Shop Products', desc: 'Seeds & equipment', color: 'bg-purple-100 text-purple-600', link: '/products' },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};
const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

export default function Home() {
    const navigate = useNavigate();

    return (
        <main className="p-4 md:p-8 lg:px-20 xl:px-40 space-y-6 lg:space-y-10 pb-8 max-w-7xl mx-auto w-full">
            {/* Desktop Hero — two-column layout */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-primary text-white shadow-lg shadow-primary/20"
            >
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=60')] bg-cover bg-center" />
                <div className="relative p-6 md:p-10 lg:p-16 flex flex-col items-start gap-4 lg:gap-6 lg:max-w-2xl">
                    <div className="bg-white/20 backdrop-blur-md p-2 lg:p-3 rounded-lg">
                        <span className="text-3xl lg:text-4xl">🧠</span>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold lg:font-black leading-tight">Ask Anaaj AI</h1>
                        <p className="text-white/80 text-sm lg:text-lg mt-1 lg:mt-3 lg:max-w-lg">Talk to your assistant about your crops, pests, or market trends. Harvest smarter, not harder.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="flex items-center gap-2 bg-white text-primary px-6 py-3 lg:px-8 lg:py-4 rounded-full font-bold text-sm lg:text-base shadow-sm active:scale-95 transition-transform"
                        >
                            <FiMic size={18} />
                            Voice Assistant
                        </button>
                        <button
                            onClick={() => navigate('/chat')}
                            className="hidden lg:flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-colors"
                        >
                            Start Chatting
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Search Bar */}
            <div className="flex gap-2 lg:max-w-xl">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="w-full bg-white border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary shadow-sm"
                        placeholder="Ask a question..."
                        onFocus={() => navigate('/chat')}
                    />
                </div>
                <button
                    onClick={() => navigate('/diagnosis')}
                    className="bg-primary text-white p-3 rounded-xl flex items-center justify-center shadow-md shadow-primary/30"
                >
                    <FiCamera size={20} />
                </button>
            </div>

            {/* Quick Help Grid */}
            <section>
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <h3 className="text-slate-900 text-lg lg:text-2xl font-bold">How can we help?</h3>
                    <button className="text-primary text-sm font-medium flex items-center gap-1">
                        View All <FiChevronRight size={14} />
                    </button>
                </div>
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                >
                    {helpCards.map((card) => (
                        <motion.div
                            key={card.title}
                            variants={item}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(card.link)}
                            className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all"
                        >
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{card.title}</p>
                                <p className="text-[10px] lg:text-xs text-slate-500">{card.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Stats + Weather row on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-primary/5 rounded-xl p-4 lg:p-6 flex items-center justify-between border border-primary/10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⛅</span>
                        <div>
                            <p className="font-bold text-slate-900">32°C / 24°C</p>
                            <p className="text-xs text-slate-500">Mostly Sunny</p>
                        </div>
                    </div>
                    <button className="text-primary font-bold text-xs uppercase tracking-wider">Details</button>
                </div>
                <div className="hidden lg:flex bg-white rounded-xl p-6 items-center gap-4 border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-2xl">🌾</div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">50,000+ Farmers</p>
                        <p className="text-xs text-slate-500">Trust Anaaj AI</p>
                    </div>
                </div>
                <div className="hidden lg:flex bg-white rounded-xl p-6 items-center gap-4 border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-2xl">🎯</div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">98.2% Accuracy</p>
                        <p className="text-xs text-slate-500">AI Crop Diagnosis</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
