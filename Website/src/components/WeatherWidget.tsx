import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  humidity: number;
  rain: number;
  windSpeed: number;
  locationName: string;
  isDay: boolean;
}

export default function WeatherWidget() {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, name: string) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,is_day&timezone=auto`
        );
        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          rain: data.current.rain > 0 ? 100 : 0, // Simplified rain prob for now or use another field
          windSpeed: Math.round(data.current.wind_speed_10m),
          locationName: name,
          isDay: data.current.is_day === 1
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude, t('weather.currentLocation'));
          },
          () => {
            // Fallback to Ludhiana
            fetchWeather(30.9010, 75.8573, t('weather.location'));
          }
        );
      } else {
        // Fallback to Ludhiana
        fetchWeather(30.9010, 75.8573, t('weather.location'));
      }
    };

    getLocation();
  }, [t]);

  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  if (loading) {
    return (
      <div className="py-32 bg-primary-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-primary-container text-on-primary"
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="editorial-grid gap-8">
          <div className="col-span-12 lg:col-span-4 bg-primary p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-2xl font-bold">{weather?.locationName || t('weather.location')}</h3>
                <p className="opacity-70 capitalize">{formattedDate}</p>
              </div>
              <span className="material-symbols-outlined text-5xl text-tertiary-fixed">
                {weather?.isDay ? 'light_mode' : 'dark_mode'}
              </span>
            </div>
            <div className="text-6xl font-headline font-bold mb-8">{weather?.temp}°C</div>
            <div className="flex justify-between border-t border-white/10 pt-6">
              <div className="text-center">
                <p className="text-xs opacity-60 mb-1">{t('weather.humidity')}</p>
                <p className="font-bold">{weather?.humidity}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-60 mb-1">{t('weather.rain')}</p>
                <p className="font-bold">{weather?.rain}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-60 mb-1">{t('weather.wind')}</p>
                <p className="font-bold">{weather?.windSpeed}km/h</p>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low text-on-surface p-12 rounded-[2rem] flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="text-xs font-bold uppercase tracking-widest">{t('weather.aiAlert')}</span>
              </div>
              <h3 className="text-4xl font-headline font-bold text-primary max-w-xl">
                {weather && weather.temp > 35 ? t('weather.heatAlertTitle') : t('weather.alertTitle')}
              </h3>
              <p className="text-lg text-on-surface-variant max-w-lg">
                {weather && weather.temp > 35 ? t('weather.heatAlertDesc') : t('weather.alertDesc')}
              </p>
              <div className="flex gap-4">
                <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">{t('weather.setAlert')}</button>
                <button className="border border-outline-variant px-6 py-3 rounded-xl font-bold hover:bg-surface-container-highest transition-colors">{t('weather.viewDetail')}</button>
              </div>
            </div>
            
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[400px]" style={{ fontVariationSettings: "'wght' 100" }}>
                {weather?.rain && weather.rain > 50 ? 'rainy' : 'cloud'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
