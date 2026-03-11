import { motion } from 'framer-motion';
import { FiStar, FiShoppingCart } from 'react-icons/fi';

interface ProductCardProps {
    name: string;
    price: number;
    image: string;
    rating?: number;
    reviews?: number;
    tag?: string;
    cropTag?: string;
    onBuy?: () => void;
}

export default function ProductCard({ name, price, image, rating = 4.5, reviews = 0, tag, cropTag, onBuy }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3 group"
        >
            <div className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-sm">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {tag && (
                    <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        {tag}
                    </span>
                )}
            </div>
            <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-1 mb-1">
                    <FiStar className="text-amber-500 fill-amber-500" size={12} />
                    <p className="text-slate-600 text-xs font-bold">{rating} {reviews > 0 && `(${reviews})`}</p>
                </div>
                <p className="text-slate-900 text-sm font-bold leading-tight line-clamp-1">{name}</p>
                <p className="text-primary text-lg font-bold mt-1">₹{price}</p>
                {cropTag && (
                    <div className="mt-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                            {cropTag}
                        </span>
                    </div>
                )}
                <button
                    onClick={onBuy}
                    className="mt-3 w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                    <FiShoppingCart size={14} />
                    Buy Now
                </button>
            </div>
        </motion.div>
    );
}
