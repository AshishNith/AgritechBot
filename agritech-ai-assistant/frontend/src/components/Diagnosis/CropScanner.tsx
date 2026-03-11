import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiImage, FiRefreshCw, FiCheckCircle, FiShoppingCart, FiEye } from 'react-icons/fi';
import { diagnoseCrop } from '../../services/api';
import Loader from '../UI/Loader';

interface DiagnosisResult {
    disease: string;
    confidence: number;
    treatment: string;
    products: { name: string; price: number; image: string }[];
}

export default function CropScanner() {
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const selectedFileRef = useRef<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        selectedFileRef.current = file;
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError('');
    };

    const handleCapture = () => {
        fileRef.current?.click();
    };

    const handleAnalyze = async () => {
        if (!selectedFileRef.current) return;
        setLoading(true);
        setError('');
        try {
            const data = await diagnoseCrop(selectedFileRef.current);
            setResult(data);
        } catch {
            setError('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setPreview(null);
        setResult(null);
        selectedFileRef.current = null;
        setError('');
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Camera Preview */}
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 border-4 border-primary/20 shadow-inner">
                {preview ? (
                    <img src={preview} alt="Crop preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <FiCamera size={48} />
                        <p className="text-sm font-medium">Take or upload a photo of your crop</p>
                    </div>
                )}
                {/* Scan overlay */}
                {preview && !result && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-56 h-56 border-2 border-primary border-dashed rounded-lg opacity-60" />
                    </div>
                )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={() => { fileRef.current?.removeAttribute('capture'); fileRef.current?.click(); }}
                        className="flex items-center justify-center rounded-full w-12 h-12 bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    >
                        <FiImage size={20} />
                    </button>
                    <button
                        onClick={handleCapture}
                        className="flex items-center justify-center rounded-full w-20 h-20 bg-primary text-white shadow-lg border-4 border-white ring-2 ring-primary"
                    >
                        <FiCamera size={32} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center rounded-full w-12 h-12 bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    >
                        <FiRefreshCw size={20} />
                    </button>
                </div>

                {preview && !result && (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white text-lg font-bold rounded-xl shadow-md disabled:opacity-60"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Crop'}
                    </motion.button>
                )}
            </div>

            {loading && <Loader text="AI is analyzing your crop..." />}
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            {/* Diagnosis Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white border border-primary/10 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b border-primary/10">
                            <span className="text-primary font-bold flex items-center gap-2">
                                <FiCheckCircle size={18} />
                                AI Result
                            </span>
                            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                {Math.round(result.confidence * 100)}% Confidence
                            </span>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{result.disease}</h2>
                                <p className="text-slate-600 mt-1 leading-relaxed">{result.treatment}</p>
                            </div>

                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <h3 className="text-amber-800 font-bold text-sm flex items-center gap-2">
                                    ⚕️ Immediate Treatment
                                </h3>
                                <p className="text-amber-900 text-sm mt-1">{result.treatment}</p>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <button className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2">
                                    <FiEye size={18} />
                                    View Treatment Plan
                                </button>
                                <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-lg flex items-center justify-center gap-2 border border-primary/20">
                                    <FiShoppingCart size={18} />
                                    Recommended Products
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
