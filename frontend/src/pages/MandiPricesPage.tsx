import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Store, 
  TrendingUp, 
  Star, 
  Calendar, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ChevronRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  CartesianGrid 
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  fetchMandiPricesApi, 
  fetchMandiTrendsApi, 
  MandiRecord, 
  MandiPricesResponse,
  MandiTrendPoint 
} from '../services/api';

const CHHATTISGARH_DISTRICTS = [
  'All Districts',
  'Durg',
  'Raipur',
  'Rajnandgaon',
  'Dhamtari',
  'Bilaspur',
  'Bemetara',
  'Kawardha',
  'Mahasamund',
  'Balod'
];

const POPULAR_COMMODITIES = [
  'All Commodities',
  'Paddy (Common)',
  'Paddy (Grade A)',
  'Wheat',
  'Soybean',
  'Chana',
  'Maize',
  'Mustard',
  'Tomato',
  'Onion',
  'Potato'
];

export const MandiPricesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Filters state
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All Commodities');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('modal_price');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Favorite crops saved in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kv_favorite_crops');
      return saved ? JSON.parse(saved) : ['Paddy (Common)', 'Soybean', 'Wheat'];
    } catch {
      return ['Paddy (Common)', 'Soybean', 'Wheat'];
    }
  });

  // Data state
  const [pricesData, setPricesData] = useState<MandiPricesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Trend chart state
  const [trendCommodity, setTrendCommodity] = useState<string>('Paddy (Common)');
  const [trendMarket, setTrendMarket] = useState<string>('Patan');
  const [trendDays, setTrendDays] = useState<number>(30);
  const [trendData, setTrendData] = useState<MandiTrendPoint[]>([]);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);

  const toggleFavorite = (cropName: string) => {
    setFavorites((prev) => {
      const next = prev.includes(cropName) ? prev.filter((c) => c !== cropName) : [...prev, cropName];
      localStorage.setItem('kv_favorite_crops', JSON.stringify(next));
      return next;
    });
  };

  // Fetch Mandi Prices
  const loadPrices = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMandiPricesApi({
        district: selectedDistrict === 'All Districts' ? undefined : selectedDistrict,
        commodity: selectedCommodity === 'All Commodities' ? undefined : selectedCommodity,
        search: searchQuery,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setPricesData(res);
    } catch (err) {
      console.warn('Failed to load mandi prices', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Trend Data for Mini Chart
  const loadTrends = async (crop: string, mkt: string, days: number) => {
    setIsLoadingTrend(true);
    try {
      const res = await fetchMandiTrendsApi({
        commodity: crop,
        market: mkt,
        days: days,
      });
      setTrendData(res.trend || []);
    } catch (err) {
      console.warn('Failed to load mandi trends', err);
    } finally {
      setIsLoadingTrend(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [selectedDistrict, selectedCommodity, sortBy, sortOrder]);

  useEffect(() => {
    loadTrends(trendCommodity, trendMarket, trendDays);
  }, [trendCommodity, trendMarket, trendDays]);

  const handleSelectRecordForTrend = (r: MandiRecord) => {
    setTrendCommodity(r.commodity);
    setTrendMarket(r.market);
  };

  // Filter records by favorite if toggle is on
  const displayedRecords = (pricesData?.records || []).filter((r) => {
    if (!onlyFavorites) return true;
    return favorites.includes(r.commodity);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
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
              <span>{language === 'hi' ? 'दैनिक मंडी भाव एवं एमएसपी तुलना' : 'Mandi Prices & MSP Comparison'}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-tint text-forest border border-forest/20">
                Agmarknet
              </span>
            </h1>
            <p className="text-xs text-muted">
              {language === 'hi'
                ? 'विभिन्न कृषि उपज मंडियों में फसलों के न्यूनतम, अधिकतम और मोडल भाव की लाइव व बेंचमार्क स्थिति।'
                : 'Track daily modal, min, and max market rates compared against official Government MSP benchmarks.'}
            </p>
          </div>
        </div>

        {/* Refresh & Last Updated Pill */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={loadPrices}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-surface border border-warm-border text-xs font-semibold text-charcoal hover:bg-tint transition-all shadow-soft min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-forest ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Demo / Live Status & Source Attribution Banner */}
      <div className="p-4 rounded-2xl bg-cream-surface border border-warm-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal">
                {pricesData?.source || 'Chhattisgarh APMC Agmarknet Dataset'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pricesData?.is_demo_data 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {pricesData?.data_mode || 'Demo data (not live)'}
              </span>
            </div>
            <p className="text-[11px] text-muted mt-0.5">
              Rates expressed in <strong>₹ per Quintal</strong>. Last updated: <span className="font-semibold text-charcoal">{pricesData?.last_updated || 'Today'}</span>
            </p>
          </div>
        </div>

        <a
          href="https://agmarknet.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-forest hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          <span>agmarknet.gov.in</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ============================================================== */}
      {/* PRICE TREND MINI-CHART (Recharts)                              */}
      {/* ============================================================== */}
      <div className="bg-cream-surface rounded-2xl p-5 border border-warm-border shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tint text-forest flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal">
                {language === 'hi' ? `${trendCommodity} भाव प्रवृत्ति (${trendMarket} मंडी)` : `${trendCommodity} Price Trend (${trendMarket} Mandi)`}
              </h2>
              <p className="text-[11px] text-muted">
                Daily modal price compared against Government MSP (₹/quintal)
              </p>
            </div>
          </div>

          {/* Days Toggle (7d, 14d, 30d) */}
          <div className="flex items-center gap-1.5 p-1 bg-cream rounded-xl border border-warm-border self-start sm:self-auto">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setTrendDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendDays === d
                    ? 'bg-forest text-white shadow-soft'
                    : 'text-muted hover:text-charcoal'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-64 w-full">
          {isLoadingTrend ? (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              Loading trend graph...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#F5F1E9', borderColor: '#D1D5DB', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${val}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line 
                  type="monotone" 
                  dataKey="modal_price" 
                  name="Modal Price (₹)" 
                  stroke="#5B7A47" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#5B7A47' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="max_price" 
                  name="Max Price (₹)" 
                  stroke="#9CA3AF" 
                  strokeDasharray="2 2" 
                  strokeWidth={1.5} 
                />
                {trendData[0]?.msp_benchmark && (
                  <ReferenceLine 
                    y={trendData[0].msp_benchmark} 
                    stroke="#DC2626" 
                    strokeDasharray="4 4" 
                    label={{ value: `MSP: ₹${trendData[0].msp_benchmark}`, fill: '#DC2626', fontSize: 11, position: 'insideTopLeft' }} 
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTER CONTROLS                                                */}
      {/* ============================================================== */}
      <div className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border shadow-soft space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
          
          {/* District Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-muted mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 bg-cream rounded-xl border border-warm-border text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[40px]"
            >
              {CHHATTISGARH_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Commodity Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-muted mb-1">Commodity</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full px-3 py-2 bg-cream rounded-xl border border-warm-border text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[40px]"
            >
              {POPULAR_COMMODITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-muted mb-1">Sort By</label>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so as any);
              }}
              className="w-full px-3 py-2 bg-cream rounded-xl border border-warm-border text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[40px]"
            >
              <option value="modal_price_desc">Modal Price (Highest First)</option>
              <option value="modal_price_asc">Modal Price (Lowest First)</option>
              <option value="arrival_date_desc">Arrival Date (Newest)</option>
              <option value="max_price_desc">Max Price (Highest)</option>
            </select>
          </div>

          {/* Search Input (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-muted mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadPrices()}
                placeholder="Market or crop..."
                className="w-full pl-8 pr-3 py-2 bg-cream rounded-xl border border-warm-border text-xs font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[40px]"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Favorite Crops Quick Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-warm-border/60">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              onlyFavorites 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-cream text-muted border border-warm-border hover:bg-tint'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{onlyFavorites ? 'Showing Starred Crops Only' : 'Filter by Starred Crops'}</span>
          </button>

          <span className="text-[11px] text-muted">
            Click on any crop row to chart its price trend
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MANDI PRICES TABLE (DESKTOP) / CARDS (MOBILE)                  */}
      {/* ============================================================== */}
      <div className="bg-cream-surface rounded-2xl border border-warm-border shadow-soft overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream border-b border-warm-border text-charcoal font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-10">★</th>
                <th className="py-3 px-4">Commodity / Variety</th>
                <th className="py-3 px-4">Mandi Market</th>
                <th className="py-3 px-4 text-right">Min Price</th>
                <th className="py-3 px-4 text-right">Max Price</th>
                <th className="py-3 px-4 text-right font-extrabold text-forest">Modal Price</th>
                <th className="py-3 px-4 text-center">MSP Benchmark</th>
                <th className="py-3 px-4 text-center">MSP Comparison</th>
                <th className="py-3 px-4 text-right">Arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/60">
              {displayedRecords.map((r) => {
                const isFav = favorites.includes(r.commodity);
                const isSelected = trendCommodity === r.commodity && trendMarket === r.market;
                return (
                  <tr
                    key={r.id}
                    onClick={() => handleSelectRecordForTrend(r)}
                    className={`hover:bg-tint/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-tint/50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4" onClick={(e) => { e.stopPropagation(); toggleFavorite(r.commodity); }}>
                      <Star className={`w-4 h-4 cursor-pointer ${isFav ? 'fill-amber-400 text-amber-500' : 'text-muted/40 hover:text-amber-400'}`} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-charcoal">{r.commodity}</div>
                      <div className="text-[10px] text-muted">{r.variety}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal">{r.market}</div>
                      <div className="text-[10px] text-muted">{r.district}, {r.state}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-muted font-mono">₹{r.min_price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-muted font-mono">₹{r.max_price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-forest text-sm font-mono">₹{r.modal_price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-mono text-charcoal">
                      {r.msp ? `₹${r.msp.toLocaleString()}` : <span className="text-muted text-[10px]">No MSP</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.msp_comparison === 'Above MSP' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          Above MSP (+₹{r.msp_difference})
                        </span>
                      ) : r.msp_comparison === 'Below MSP' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                          Below MSP (-₹{Math.abs(r.msp_difference || 0)})
                        </span>
                      ) : r.msp ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                          At MSP (₹{r.msp})
                        </span>
                      ) : (
                        <span className="text-muted text-[10px]">Market Driven</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[11px] text-muted font-mono">{r.arrival_date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-warm-border/60">
          {displayedRecords.map((r) => {
            const isFav = favorites.includes(r.commodity);
            return (
              <div
                key={r.id}
                onClick={() => handleSelectRecordForTrend(r)}
                className="p-4 space-y-2 hover:bg-tint/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(r.commodity); }}
                      className="p-1"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : 'text-muted/40'}`} />
                    </button>
                    <div>
                      <h4 className="font-bold text-charcoal text-sm">{r.commodity}</h4>
                      <p className="text-[10px] text-muted">{r.variety} • {r.market} ({r.district})</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-forest font-mono">₹{r.modal_price}</div>
                    <div className="text-[10px] text-muted">₹/quintal</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-muted">Range: ₹{r.min_price} - ₹{r.max_price}</span>
                  {r.msp_comparison === 'Above MSP' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                      Above MSP (+₹{r.msp_difference})
                    </span>
                  ) : r.msp_comparison === 'Below MSP' ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold">
                      Below MSP (-₹{Math.abs(r.msp_difference || 0)})
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
