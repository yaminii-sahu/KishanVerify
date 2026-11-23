import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CloudSun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Eye, 
  MapPin, 
  Navigation, 
  Bell, 
  Check, 
  ExternalLink, 
  RefreshCw,
  Sun,
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchWeatherApi, WeatherResponse, WeatherAdvisory } from '../services/api';

const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Durg': { lat: 21.19, lon: 81.28 },
  'Patan': { lat: 21.03, lon: 81.53 },
  'Raipur': { lat: 21.25, lon: 81.63 },
  'Rajnandgaon': { lat: 21.10, lon: 81.03 },
  'Dhamtari': { lat: 20.71, lon: 81.55 },
  'Bilaspur': { lat: 22.08, lon: 82.14 },
  'Bemetara': { lat: 21.70, lon: 81.54 },
  'Kawardha': { lat: 22.01, lon: 81.24 },
};

export const WeatherPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Location state
  const [selectedDistrict, setSelectedDistrict] = useState<string>(farmer?.district || 'Durg');
  const [coords, setCoords] = useState<{ lat: number; lon: number }>(
    DISTRICT_COORDINATES[farmer?.district || 'Durg'] || { lat: 21.03, lon: 81.53 }
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationName, setLocationName] = useState<string>(`${farmer?.district || 'Durg'}, Chhattisgarh`);

  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Notification opt-in state
  const [notifPermission, setNotifPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Load weather data
  const loadWeather = async (latitude: number, longitude: number, district: string) => {
    setIsLoading(true);
    try {
      const data = await fetchWeatherApi({
        lat: latitude,
        lon: longitude,
        district: district,
        state: 'Chhattisgarh',
      });
      setWeatherData(data);
    } catch (err) {
      console.warn('Weather fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(coords.lat, coords.lon, selectedDistrict);
  }, [coords.lat, coords.lon, selectedDistrict]);

  // Browser Geolocation trigger
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setLocationName('Current GPS Location');
        setIsLocating(false);
        loadWeather(lat, lon, 'Local GPS');
      },
      (err) => {
        console.warn('Geolocation denied or failed', err);
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Browser Notification opt-in
  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported in this environment.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification('KisanVerify Weather Alerts', {
          body: 'Severe weather and agro-advisory notifications enabled for your farm.',
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.warn('Notification permission error', e);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-8 h-8 text-amber-500" />;
    if (code >= 61 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (code >= 95) return <CloudLightning className="w-8 h-8 text-indigo-500" />;
    return <CloudSun className="w-8 h-8 text-olive" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-warm-border/60">
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint transition-colors shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              <span>{language === 'hi' ? 'मौसम पूर्वानुमान एवं कृषि सलाह' : 'Weather Alerts & Farming Advisories'}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-tint text-forest border border-forest/20">
                Agromet IMD
              </span>
            </h1>
            <p className="text-xs text-muted">
              {language === 'hi'
                ? '7 दिवसीय मौसम पूर्वानुमान, वर्षा संभावना और फसल सुरक्षा हेतु नियम-आधारित कृषि परामर्श।'
                : '7-day local forecast, rain probabilities, and deterministic agricultural advisory rules.'}
            </p>
          </div>
        </div>

        {/* Location Picker & GPS Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <select
            value={selectedDistrict}
            onChange={(e) => {
              const dist = e.target.value;
              setSelectedDistrict(dist);
              if (DISTRICT_COORDINATES[dist]) {
                setCoords(DISTRICT_COORDINATES[dist]);
                setLocationName(`${dist}, Chhattisgarh`);
              }
            }}
            className="px-3 py-1.5 bg-cream-surface rounded-full border border-warm-border text-xs font-semibold text-charcoal shadow-soft focus:outline-none min-h-[38px]"
          >
            {Object.keys(DISTRICT_COORDINATES).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft transition-all min-h-[38px]"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'GPS'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEVERE WEATHER WARNING BANNER (IF ANY WARNING LEVEL IS ACTIVE) */}
      {/* ============================================================== */}
      {weatherData?.has_severe_warning && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-300 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-soft mt-0.5">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-full">
                  Severe Weather Alert
                </span>
                <span className="text-xs text-rose-900 font-bold">Action Recommended</span>
              </div>
              <h3 className="text-sm font-bold text-rose-950 mt-1">
                {language === 'hi' 
                  ? weatherData.advisories.find(a => a.level === 'Warning')?.title_hi 
                  : weatherData.advisories.find(a => a.level === 'Warning')?.title}
              </h3>
              <p className="text-xs text-rose-900 mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? weatherData.advisories.find(a => a.level === 'Warning')?.action_hi
                  : weatherData.advisories.find(a => a.level === 'Warning')?.action}
              </p>
            </div>
          </div>

          {notifPermission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all self-end sm:self-center min-h-[38px]"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Alerts</span>
            </button>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CURRENT WEATHER CARD + NOTIFICATION OPT-IN                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Main Current Weather Card (7 cols) */}
        <div className="md:col-span-7 bg-cream-surface rounded-2xl p-6 border border-warm-border shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted font-semibold">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>{locationName}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
                {weatherData?.current.temperature.toFixed(1)}°C
              </h2>
              <p className="text-sm font-bold text-forest">
                {language === 'hi' ? weatherData?.current.condition_hi : weatherData?.current.condition}
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-tint/60 flex items-center justify-center shrink-0">
              {weatherData && getWeatherIcon(weatherData.current.weather_code)}
            </div>
          </div>

          {/* Key Metrics Row: Humidity, Wind, Rain Prob */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-warm-border/60">
            <div className="p-3 bg-cream rounded-xl border border-warm-border text-center">
              <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <div className="text-xs font-bold text-charcoal">{weatherData?.current.humidity}%</div>
              <div className="text-[10px] text-muted">Humidity</div>
            </div>

            <div className="p-3 bg-cream rounded-xl border border-warm-border text-center">
              <Wind className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs font-bold text-charcoal">{weatherData?.current.wind_speed} km/h</div>
              <div className="text-[10px] text-muted">Wind Speed</div>
            </div>

            <div className="p-3 bg-cream rounded-xl border border-warm-border text-center">
              <CloudRain className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <div className="text-xs font-bold text-charcoal">{weatherData?.current.rain_prob}%</div>
              <div className="text-[10px] text-muted">Rain Chance</div>
            </div>
          </div>
        </div>

        {/* Official IMD & Notification Opt-in Card (5 cols) */}
        <div className="md:col-span-5 bg-cream-surface rounded-2xl p-6 border border-warm-border shadow-soft flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-charcoal">
                {weatherData?.source || 'Open-Meteo & IMD Agromet'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                weatherData?.is_demo_data 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {weatherData?.is_demo_data ? 'Demo benchmark' : 'Live forecast'}
              </span>
            </div>

            <h3 className="text-sm font-bold text-charcoal leading-snug">
              Official India Meteorological Department (IMD)
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              KisanVerify agricultural advisories are deterministic decision-support suggestions. For official disaster alerts, visit mausam.imd.gov.in.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-warm-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Browser Alerts:</span>
              <span className="font-semibold text-charcoal capitalize">
                {notifPermission === 'granted' ? 'Enabled' : notifPermission === 'denied' ? 'Blocked' : 'Optional'}
              </span>
            </div>

            {notifPermission !== 'granted' ? (
              <button
                onClick={handleEnableNotifications}
                className="w-full py-2 px-3 rounded-xl bg-tint hover:bg-tint/80 text-forest text-xs font-bold border border-forest/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Opt-in for Severe Weather Alerts</span>
              </button>
            ) : (
              <div className="py-2 px-3 rounded-xl bg-status-eligible-bg border border-status-eligible-text/20 text-status-eligible-text text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Severe Weather Alerts Active</span>
              </div>
            )}

            <a
              href="https://mausam.imd.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-forest hover:underline flex items-center justify-center gap-1 pt-1"
            >
              <span>Visit Official IMD Portal (mausam.imd.gov.in)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* AGRICULTURAL ADVISORIES SECTION                                */}
      {/* ============================================================== */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest" />
            <span>{language === 'hi' ? 'मौसम अनुसार कृषि सलाह' : 'Agricultural Advisories for Your Crops'}</span>
          </h3>
          <span className="text-[11px] text-muted">
            Deterministic Decision Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weatherData?.advisories.map((adv) => {
            const isWarning = adv.level === 'Warning';
            const isWatch = adv.level === 'Watch';
            return (
              <div
                key={adv.id}
                className={`rounded-2xl p-5 border shadow-soft space-y-2.5 transition-all ${
                  isWarning
                    ? 'bg-rose-50/80 border-rose-300'
                    : isWatch
                    ? 'bg-amber-50/80 border-amber-300'
                    : 'bg-cream-surface border-warm-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isWarning 
                      ? 'bg-rose-600 text-white' 
                      : isWatch 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-forest text-white'
                  }`}>
                    {adv.level} Alert
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {adv.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-charcoal leading-tight">
                  {language === 'hi' ? adv.title_hi : adv.title}
                </h4>

                <p className="text-xs text-muted leading-relaxed">
                  {language === 'hi' ? adv.description_hi : adv.description}
                </p>

                <div className="p-3 bg-white/70 rounded-xl border border-warm-border/60 text-xs">
                  <span className="font-bold text-charcoal">
                    {language === 'hi' ? 'सुझाया गया कदम:' : 'Recommended Action:'}
                  </span>{' '}
                  <span className="text-charcoal/90">
                    {language === 'hi' ? adv.action_hi : adv.action}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7-DAY FORECAST GRID                                            */}
      {/* ============================================================== */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-bold text-charcoal">
          {language === 'hi' ? '7 दिवसीय पूर्वानुमान' : '7-Day Forecast'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {weatherData?.forecast.map((day, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl bg-cream-surface border text-center space-y-2 shadow-soft hover:border-olive transition-all ${
                idx === 0 ? 'border-forest ring-1 ring-forest/30' : 'border-warm-border'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-charcoal">{idx === 0 ? 'Today' : day.day}</div>
                <div className="text-[10px] text-muted">{day.date}</div>
              </div>

              <div className="flex justify-center py-1">
                {getWeatherIcon(day.weather_code)}
              </div>

              <div className="text-xs font-bold text-charcoal">
                {day.temp_max.toFixed(0)}° / <span className="text-muted font-normal">{day.temp_min.toFixed(0)}°</span>
              </div>

              {/* Rain Probability Pill */}
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  day.rain_prob >= 50 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-cream text-muted border border-warm-border'
                }`}>
                  <CloudRain className="w-2.5 h-2.5" />
                  <span>{day.rain_prob}%</span>
                </span>
              </div>

              <div className="text-[10px] text-muted line-clamp-1">
                {language === 'hi' ? day.condition_hi : day.condition}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
