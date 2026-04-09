import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  pubDate: string;
}

const CHANNEL_ID = 'UC9TcIfQZKP53Vx4zyN6fRaw';
const RSS_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const PROXY_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;

export default function YouTubeSection() {
  const { t, i18n } = useTranslation();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(PROXY_URL);
        const data = await response.json();
        
        if (data.status === 'ok') {
          const formattedVideos = data.items.map((item: any) => ({
            id: item.guid.split(':')[2], // Extracts the video ID from 'yt:video:VIDEO_ID'
            title: item.title,
            thumbnail: item.thumbnail,
            link: item.link,
            pubDate: item.pubDate,
          }));
          setVideos(formattedVideos.slice(0, 4)); // Get top 4
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch YouTube videos:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-surface flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-fixed"></div>
        <span className="ml-4 text-stone-400 font-body">{t('common.loading')}</span>
      </section>
    );
  }

  if (error || videos.length === 0) {
    return null; // Or show a fallback UI
  }

  const mainVideo = videos[0];
  const otherVideos = videos.slice(1);

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary-fixed/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              <span className="text-xs font-bold uppercase tracking-widest font-label font-body">{t('youtube.label')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface-variant leading-tight">
              {t('youtube.title')} <br />
              <span className="text-tertiary-fixed">{t('youtube.subtitle')}</span>
            </h2>
          </motion.div>

          <motion.a
            href={`https://youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-stone-400 hover:text-tertiary-fixed transition-colors font-body font-medium"
          >
            {t('youtube.visit')}
            <span className="material-symbols-outlined">trending_flat</span>
          </motion.a>
        </div>

        {/* Dynamic Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Spotlight Video */}
          <motion.div
            className="lg:col-span-2 group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/10 border border-white/10 shadow-2xl bento-card">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${mainVideo.id}`}
                title={mainVideo.title}
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-6">
              <h3 className="text-2xl font-headline font-bold text-on-surface hover:text-tertiary-fixed transition-colors line-clamp-1">
                {mainVideo.title}
              </h3>
              <p className="text-stone-400 mt-2 font-body font-medium">
                {new Date(mainVideo.pubDate).toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </motion.div>

          {/* Side Videos / Mobile Grid Extension */}
          <div className="flex flex-col gap-8">
            {otherVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 group cursor-pointer"
                onClick={() => window.open(video.link, '_blank')}
              >
                <div className="relative flex-shrink-0 w-32 h-20 md:w-40 md:h-24 rounded-2xl overflow-hidden shadow-lg glass-nav bento-card border border-white/5">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <span className="material-symbols-outlined text-white text-3xl">play_circle</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-base md:text-lg font-headline font-bold text-on-surface leading-tight line-clamp-2 group-hover:text-tertiary-fixed transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 font-body font-medium">
                    {new Date(video.pubDate).toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {/* CTA Card for Mobile/Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2 p-6 rounded-3xl bg-tertiary-fixed/10 border border-tertiary-fixed/20 flex items-center justify-between group cursor-pointer hover:bg-tertiary-fixed/20 transition-all shadow-xl"
              onClick={() => window.open(`https://youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`, '_blank')}
            >
              <div>
                <span className="text-tertiary-fixed font-bold block text-lg font-headline">{t('youtube.join')}</span>
                <span className="text-stone-400 text-sm font-body">{t('youtube.subscribe')}</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-white flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined">add</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
