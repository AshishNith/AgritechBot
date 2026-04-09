import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface GlassCardData {
    id: number;
    title: string;
    description: string;
    color: string;
    image?: string;
    role?: string;
    linkedin?: string;
    twitter?: string;
}

interface CardProps {
    card: GlassCardData;
    index: number;
    totalCards: number;
}

const Card: React.FC<CardProps> = ({ card, index, totalCards }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = cardRef.current;
        const container = containerRef.current;
        if (!el || !container) return;

        // Scaling down the cards that go behind
        const targetScale = 1 - (totalCards - 1 - index) * 0.05;

        // Set initial state
        gsap.set(el, {
            scale: 1,
            transformOrigin: "center top",
        });

        // Create scroll trigger for stacking effect
        ScrollTrigger.create({
            trigger: container,
            start: "top center",
            end: "bottom center",
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                const scale = gsap.utils.interpolate(1, targetScale, progress);

                gsap.set(el, {
                    scale: Math.max(scale, targetScale),
                    transformOrigin: "center top",
                });
            },
        });

        return () => {
             // Specific kill to avoid global trigger loss
             ScrollTrigger.getAll().forEach((trigger) => {
                if(trigger.trigger === container) trigger.kill();
             });
        };
    }, [index, totalCards]);

    return (
        <div
            ref={containerRef}
            className="flex items-start justify-center relative sticky top-0"
            style={{
                height: "85vh",
                zIndex: index,
            }}
        >
            <div
                ref={cardRef}
                className="w-[95%] md:w-[85%] max-w-6xl mt-[5vh]"
                style={{
                    position: "relative",
                    height: "500px",
                    borderRadius: "3rem",
                    isolation: "isolate",
                    top: `${index * 12}px`,
                    transformOrigin: "top",
                }}
            >
                {/* Electric Border Effect */}
                <div
                    className="absolute -inset-1 rounded-[3.2rem] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        padding: "4px",
                        background: `conic-gradient(
                            from 0deg,
                            transparent 0deg,
                            ${card.color} 60deg,
                            transparent 180deg,
                            ${card.color} 240deg,
                            transparent 360deg
                        )`,
                        zIndex: -1,
                        filter: "blur(8px)",
                    }}
                />

                {/* Main Card Content */}
                <div
                    className="relative w-full h-full flex flex-col md:flex-row items-stretch rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backgroundColor: '#ffffff',
                        backdropFilter: "blur(30px) saturate(180%)",
                    }}
                >
                    {/* Glass reflection overlay */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none z-10 opacity-30"
                        style={{
                            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)",
                        }}
                    />

                    {/* Left Side: Content */}
                    <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative z-20">
                        {card.role && (
                            <span className="text-secondary font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
                                {card.role}
                            </span>
                        )}
                        <h3 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-6 tracking-tight">
                            {card.title}
                        </h3>
                        <p className="text-xl text-on-surface-variant leading-relaxed font-body italic mb-8">
                            "{card.description}"
                        </p>

                        <div className="flex gap-4">
                            {card.linkedin && (
                                <a href={card.linkedin} className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                    <span className="material-symbols-outlined">link</span>
                                </a>
                            )}
                            {card.twitter && (
                                <a href={card.twitter} className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                    <span className="material-symbols-outlined">alternate_email</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Image */}
                    {card.image && (
                        <div className="w-full md:w-[45%] relative min-h-[300px] md:min-h-full">
                            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent z-10 md:hidden"></div>
                            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 hidden md:block"></div>
                            <img
                                src={card.image}
                                alt={card.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Texture overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

interface StackedCardsProps {
    cards: GlassCardData[];
}

export const StackedCards: React.FC<StackedCardsProps> = ({ cards }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="relative w-full">
            {cards.map((card, index) => (
                <Card
                    key={card.id}
                    card={card}
                    index={index}
                    totalCards={cards.length}
                />
            ))}
        </div>
    );
};
