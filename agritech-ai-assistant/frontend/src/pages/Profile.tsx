import { motion } from 'framer-motion';
import { FiArrowLeft, FiSettings, FiCamera, FiMapPin, FiSun, FiGlobe, FiLogOut } from 'react-icons/fi';
import { RiPlantLine, RiVerifiedBadgeFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const profileItems = [
    { icon: <FiMapPin size={20} />, label: 'Location', value: 'Mehsana, Gujarat' },
    { icon: <RiPlantLine size={20} />, label: 'Crop Types', value: 'Wheat, Cotton' },
    { icon: <FiSun size={20} />, label: 'Soil Type', value: 'Alluvial' },
    { icon: <FiGlobe size={20} />, label: 'Preferred Language', value: 'Gujarati' },
];

export default function Profile() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-full"
        >
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center p-4 justify-between border-b border-primary/10 bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-primary flex w-10 h-10 items-center justify-center hover:bg-primary/10 rounded-full">
                    <FiArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-bold flex-1 text-center">Farmer Profile</h2>
                <button className="text-primary flex w-10 h-10 items-center justify-center hover:bg-primary/10 rounded-full">
                    <FiSettings size={20} />
                </button>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center py-8 px-4 lg:py-12 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
                        RP
                    </div>
                    <button className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-2 border-white shadow-lg">
                        <FiCamera size={14} />
                    </button>
                </div>
                <div className="mt-4 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Ramesh Patel</h1>
                    <p className="text-primary font-medium flex items-center justify-center gap-1">
                        <RiVerifiedBadgeFill size={16} />
                        Premium Farmer
                    </p>
                </div>
            </div>

            {/* Profile Details */}
            <div className="px-4 lg:px-0 max-w-3xl mx-auto w-full space-y-2 pb-8">
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider px-2 pb-2">Profile Details</h3>
                {profileItems.map((item) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-primary/5 group"
                    >
                        <div className="text-primary flex items-center justify-center rounded-lg bg-white shadow-sm w-12 h-12">
                            {item.icon}
                        </div>
                        <div className="flex flex-col flex-1">
                            <p className="text-slate-500 text-xs font-medium">{item.label}</p>
                            <p className="text-slate-900 text-base font-semibold">{item.value}</p>
                        </div>
                        <button className="hidden lg:block text-xs text-primary font-bold hover:underline">Edit</button>
                    </motion.div>
                ))}

                {/* Logout */}
                <div className="pt-6">
                    <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-xl border border-red-100 hover:bg-red-100 transition-all">
                        <FiLogOut size={18} />
                        Log out
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
