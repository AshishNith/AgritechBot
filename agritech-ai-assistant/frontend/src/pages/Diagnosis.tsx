import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CropScanner from '../components/Diagnosis/CropScanner';

export default function Diagnosis() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-full"
        >
            <header className="lg:hidden flex items-center bg-white px-4 py-4 border-b border-primary/10 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary flex w-10 h-10 items-center justify-center rounded-full hover:bg-primary/10"
                >
                    <FiArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold leading-tight flex-1 ml-2 text-center mr-10">Anaaj AI Diagnosis</h1>
            </header>

            <main className="flex-1 p-4 lg:p-8 max-w-3xl mx-auto w-full">
                <h1 className="hidden lg:block text-3xl font-black tracking-tight text-slate-900 mb-6">Crop Diagnosis</h1>
                <CropScanner />
            </main>
        </motion.div>
    );
}
