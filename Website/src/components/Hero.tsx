import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameCount = 192; // Configured for 192 total frames

  // Preload images once component mounts
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    imagesRef.current = loadedImages;
    let loadCount = 0;

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
        
        img.onload = () => {
            loadCount++;
            if (i === 1) {
                requestAnimationFrame(() => drawFrame(0));
            }
            if (loadCount === frameCount || loadCount % 20 === 0) {
              setImages([...loadedImages]);
            }
        };
        loadedImages.push(img);
    }
    
    setImages(loadedImages);
  }, []);

  const drawFrame = (index: number) => {
    const currentImages = imagesRef.current.length > 0 ? imagesRef.current : images;
    if (currentImages.length > 0 && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const img = currentImages[index];
            if (img && img.complete && img.naturalWidth !== 0) {
                // Match resolution to screen size dynamically
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                
                // Standard "object-cover" logic for canvas drawing
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio  = Math.max(hRatio, vRatio);
                const centerShift_x = (canvas.width - img.width * ratio) / 2;
                const centerShift_y = (canvas.height - img.height * ratio) / 2;  

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // The globalAlpha mimics the requested opacity: 60 from the previous <video className="opacity-60">
                ctx.globalAlpha = 0.6;
                ctx.drawImage(img, 0, 0, img.width, img.height,
                              centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);  
            }
        }
    }
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map progress (0.0 - 1.0) directly onto frames 0 through 191
    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(latest * frameCount)
    );
    requestAnimationFrame(() => drawFrame(frameIndex));
  });

  // Re-draw current frame when resizing window
  useEffect(() => {
    const handleResize = () => {
       const latest = scrollYProgress.get();
       const frameIndex = Math.min(frameCount - 1, Math.floor(latest * frameCount));
       drawFrame(frameIndex);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // Draw frame requires `images`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // Framer motion transforms for synchronized text overlays
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [1, 1, 0, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0, 0, -50, -50]);

  const opacity2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [50, 0, 0, -50]);

  const opacity3 = useTransform(scrollYProgress, [0.6, 0.8, 1, 1], [0, 1, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.6, 0.8, 1, 1], [50, 0, 0, 0]);

  return (
    // Height determines how long the scroll lasts. 400vh gives 4 viewports of scrolling.
    <section ref={containerRef} className="relative h-[400vh] bg-primary">
      {/* Sticky container holds the canvas sequence in view */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-primary">
        
        {/* Render sequence onto a full width/height background canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full pointer-events-none" 
        />

        {/* Text Area 1 */}
        <motion.div 
          style={{ opacity: opacity1, y: y1 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 md:px-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-8 shadow-2xl">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>colors_spark</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">{t('hero.tagline')}</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-headline font-bold text-white tracking-tight leading-[1] drop-shadow-2xl">
            {t('hero.title1')} <br />
            <span className="text-tertiary-fixed italic">{t('hero.title2')}</span> <br />
            {t('hero.title3')}
          </h1>
          <p className="mt-8 text-xl text-stone-200 font-body max-w-2xl drop-shadow-lg font-medium">
            {t('hero.description')}
          </p>
        </motion.div>

        {/* Text Area 2 */}
        <motion.div 
          style={{ opacity: opacity2, y: y2 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 md:px-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-headline font-bold text-tertiary-fixed tracking-tight drop-shadow-2xl">
            {t('hero.dataTitle')}
          </h2>
          <p className="mt-6 text-2xl text-white font-body max-w-2xl drop-shadow-lg font-medium">
            {t('hero.dataDesc')}
          </p>
        </motion.div>

        {/* Text Area 3 */}
        <motion.div 
          style={{ opacity: opacity3, y: y3 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 md:px-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-headline font-bold text-white tracking-tight drop-shadow-2xl">
            {t('hero.harvestTitle')}
          </h2>
          <p className="mt-6 text-2xl text-white font-body max-w-2xl drop-shadow-lg font-medium">
            {t('hero.harvestDesc')}
          </p>
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <button className="bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 md:px-10 md:py-5 rounded-2xl font-bold text-base md:text-xl shadow-xl hover:scale-105 transition-all w-full sm:w-auto">
              {t('common.startTrial')}
            </button>
            <button className="flex items-center justify-center gap-2 font-bold px-6 py-4 md:px-8 md:py-5 rounded-2xl border border-white/30 text-white backdrop-blur-md hover:bg-white/10 transition-colors w-full sm:w-auto text-base md:text-lg">
              <span className="material-symbols-outlined">play_circle</span>
              {t('common.watchDemo')}
            </button>
          </div>
        </motion.div>
        
        {/* Overlay gradient to blend bottom edge with the next section */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface to-transparent"></div>
      </div>
    </section>
  );
}
