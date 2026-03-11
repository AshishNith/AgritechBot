export default function Loader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
            <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                    <span
                        key={i}
                        className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>
            <p className="text-sm text-slate-500">{text}</p>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 animate-pulse">
            <div className="h-32 bg-slate-100 rounded-lg mb-3" />
            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
    );
}
