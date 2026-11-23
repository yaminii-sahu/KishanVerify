import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  Landmark,
  FlaskConical,
  Store,
  Compass,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';
import { fetchOfficesApi, OfficeItem } from '../services/api';

const OFFICE_TYPE_CONFIG: Record<
  string,
  { labelEn: string; labelHi: string; icon: any; color: string; badgeBg: string; badgeText: string }
> = {
  All: {
    labelEn: 'All Offices',
    labelHi: 'सभी कार्यालय',
    icon: Building2,
    color: '#3D550C',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'All',
  },
  KVK: {
    labelEn: 'Krishi Vigyan Kendra (KVK)',
    labelHi: 'कृषि विज्ञान केंद्र (KVK)',
    icon: FlaskConical,
    color: '#2B5329',
    badgeBg: 'bg-green-100 text-green-900 border-green-300',
    badgeText: 'KVK',
  },
  APMC: {
    labelEn: 'Mandi Samiti (APMC)',
    labelHi: 'कृषि उपज मंडी (APMC)',
    icon: Store,
    color: '#8A5A00',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeText: 'APMC Mandi',
  },
  'Soil Lab': {
    labelEn: 'Soil Testing Lab',
    labelHi: 'मृदा परीक्षण लैब',
    icon: FlaskConical,
    color: '#0284C7',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    badgeText: 'Soil Lab',
  },
  Bank: {
    labelEn: 'Bank Branch (KCC)',
    labelHi: 'बैंक शाखा (केसीसी)',
    icon: Landmark,
    color: '#4338CA',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    badgeText: 'KCC Bank',
  },
  CSC: {
    labelEn: 'CSC Digital Seva',
    labelHi: 'कॉमन सर्विस सेंटर (CSC)',
    icon: Building2,
    color: '#7C2D12',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    badgeText: 'CSC Centre',
  },
  DDA: {
    labelEn: 'District Agriculture Office',
    labelHi: 'जिला कृषि कार्यालय',
    icon: Landmark,
    color: '#15803D',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeText: 'District Agri',
  },
};

const CHHATTISGARH_DISTRICTS = [
  'All',
  'Durg',
  'Raipur',
  'Rajnandgaon',
  'Bilaspur',
  'Balod',
  'Bemetara',
  'Dhamtari',
  'Mahasamund',
];

export const NearbyOfficesPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Durg');
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>({
    lat: 21.0362,
    lon: 81.5375, // Default Patan, Durg
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Load Offices
  const loadOffices = async () => {
    setLoading(true);
    try {
      const res = await fetchOfficesApi({
        lat: userLocation?.lat,
        lon: userLocation?.lon,
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        office_type: selectedType !== 'All' ? selectedType : undefined,
        radius_km: radiusKm > 0 ? radiusKm : undefined,
      });
      setOffices(res.offices || []);
    } catch (err) {
      console.error('Error fetching offices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffices();
  }, [userLocation, selectedDistrict, selectedType, radiusKm]);

  // Request GPS Geolocation
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(isHi ? 'आपके ब्राउज़र में जीपीएस सुविधा नहीं है।' : 'Geolocation not supported by browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGpsActive(true);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS position error:', err);
        setGpsError(
          isHi
            ? 'स्थान अनुमति नहीं मिली। डिफ़ॉल्ट पाटन (दुर्ग) स्थान का उपयोग किया जा रहा है।'
            : 'Location permission denied. Using Patan (Durg) default coordinates.'
        );
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lon]
        : [21.0362, 81.5375];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Don't destroy immediately on re-renders, let layer update
    };
  }, []);

  // Update Markers when offices or user location change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. User Location Marker
    if (userLocation) {
      const userMarkerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 18px; height: 18px; background: #2563EB; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userMarkerHtml,
        className: 'user-pin-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon }).addTo(markersGroup);
      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; text-align: center; padding: 4px;">
          <b style="color: #1E3A8A;">📍 ${isHi ? 'आपकी स्थिति' : 'Your Location'}</b><br/>
          <span style="color: #6B7280; font-size: 11px;">${gpsActive ? (isHi ? 'जीपीएस द्वारा' : 'GPS Detected') : (isHi ? 'पाटन, दुर्ग (डिफ़ॉल्ट)' : 'Patan, Durg (Default)')}</span>
        </div>
      `);
    }

    // 2. Office Markers
    const bounds = L.latLngBounds(userLocation ? [[userLocation.lat, userLocation.lon]] : []);

    offices.forEach((office) => {
      bounds.extend([office.lat, office.lon]);

      const typeConfig = OFFICE_TYPE_CONFIG[office.office_type] || OFFICE_TYPE_CONFIG['All'];
      const pinColor = typeConfig.color || '#3D550C';

      const officeMarkerHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${pinColor};
          border: 2px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            transform: rotate(45deg);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
          ">
            ${office.office_type.slice(0, 3)}
          </div>
        </div>
      `;

      const officeIcon = L.divIcon({
        html: officeMarkerHtml,
        className: 'office-pin-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([office.lat, office.lon], { icon: officeIcon }).addTo(markersGroup);

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; min-width: 200px; padding: 2px;">
          <div style="font-size: 10px; font-weight: 700; color: ${pinColor}; text-transform: uppercase; margin-bottom: 2px;">
            ${office.category_label || office.office_type}
          </div>
          <div style="font-weight: 600; font-size: 13px; color: #1F2937; margin-bottom: 4px;">
            ${isHi && office.name_hi ? office.name_hi : office.name}
          </div>
          <div style="font-size: 11px; color: #4B5563; margin-bottom: 6px;">
            📍 ${office.address}
          </div>
          ${office.distance_km !== undefined ? `
            <div style="display: inline-block; background: #ECFDF5; color: #065F46; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px;">
              ${office.distance_km} km ${isHi ? 'दूर' : 'away'}
            </div>
          ` : ''}
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            ${office.phone ? `
              <a href="tel:${office.phone}" style="display: inline-flex; align-items: center; gap: 4px; background: #3D550C; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 600;">
                📞 ${isHi ? 'कॉल करें' : 'Call'}
              </a>
            ` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lon}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; background: #E5E7EB; color: #1F2937; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 600;">
              🧭 ${isHi ? 'दिशा-निर्देश' : 'Directions'}
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedOfficeId(office.id);
      });
    });

    if (offices.length > 0 && map) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [offices, userLocation, isHi]);

  // Focus map on card click
  const handleSelectCard = (office: OfficeItem) => {
    setSelectedOfficeId(office.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([office.lat, office.lon], 14, { animate: true });
    }
  };

  const copyAddress = (office: OfficeItem) => {
    navigator.clipboard.writeText(`${office.name}, ${office.address}`);
    setCopiedId(office.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list by text search
  const filteredOffices = offices.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      (o.name_hi && o.name_hi.toLowerCase().includes(q)) ||
      o.address.toLowerCase().includes(q) ||
      o.office_type.toLowerCase().includes(q) ||
      (o.services_offered && o.services_offered.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>{isHi ? 'सरकारी कृषि सेवा केंद्र' : 'Government Agri Extension Directory'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#233316]">
              {isHi ? 'निकटतम कृषि कार्यालय एवं केंद्र' : 'Nearby Agriculture Offices & Centers'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6B4D] mt-1">
              {isHi
                ? 'केवीके, मंडी समिति, मृदा परीक्षण लैब, केसीसी बैंक और सीएससी केंद्रों की सटीक दूरी, संपर्क और दिशा-निर्देश।'
                : 'Find Krishi Vigyan Kendra (KVK), Mandi Samiti (APMC), Soil Testing Labs, KCC Banks, and CSC centers near you.'}
            </p>
          </div>

          {/* GPS Quick Action */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={requestGpsLocation}
              disabled={gpsLoading}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-sm ${
                gpsActive
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-white border border-[#D5CDBC] text-[#2C3B1E] hover:bg-[#F2ECE0]'
              }`}
            >
              <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>
                {gpsLoading
                  ? isHi
                    ? 'स्थान ढूँढ रहे हैं...'
                    : 'Locating...'
                  : gpsActive
                  ? isHi
                    ? 'जीपीएस स्थान सक्रिय'
                    : 'GPS Location Active'
                  : isHi
                  ? 'मेरा स्थान उपयोग करें'
                  : 'Use My GPS Location'}
              </span>
            </button>

            <button
              onClick={loadOffices}
              className="p-2.5 bg-white border border-[#D5CDBC] text-[#4A5D37] rounded-xl hover:bg-[#F2ECE0] transition-colors"
              title={isHi ? 'रिफ्रेश करें' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'नाम, सेवा या पता खोजें...' : 'Search name, service, address...'}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6B4D]"
            />
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-stone-600 whitespace-nowrap">
              {isHi ? 'जिला:' : 'District:'}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B6B4D]"
            >
              {CHHATTISGARH_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 'Durg' ? (isHi ? '(गृह जिला)' : '(Home)') : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-stone-600 whitespace-nowrap">
              {isHi ? 'दूरी:' : 'Radius:'}
            </label>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs sm:text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B6B4D]"
            >
              <option value={5}>5 km</option>
              <option value={15}>15 km</option>
              <option value={30}>30 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={0}>{isHi ? 'सभी दूरियाँ' : 'Any distance'}</option>
            </select>
          </div>

          {/* Summary Count */}
          <div className="flex items-center justify-between sm:justify-end px-3 py-2 bg-[#F7F5EE] rounded-xl text-xs text-[#3D550C] font-semibold">
            <span>{isHi ? 'कुल उपलब्ध केंद्र:' : 'Offices Available:'}</span>
            <span className="ml-2 px-2 py-0.5 bg-[#8B9A6E] text-white rounded-full">
              {filteredOffices.length}
            </span>
          </div>
        </div>

        {/* Office Type Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {Object.entries(OFFICE_TYPE_CONFIG).map(([typeKey, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = selectedType === typeKey;
            return (
              <button
                key={typeKey}
                onClick={() => setSelectedType(typeKey)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#3D550C] text-white border-[#3D550C] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#425032] border-[#E2DCce] hover:bg-[#EFEAE0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isHi ? cfg.labelHi : cfg.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Map & List Side-by-Side (or stacked on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Leaflet Map Column */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="sticky top-20 bg-white border border-[#E6E0D4] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E6E0D4] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2C3B1E]">
                <Layers className="w-4 h-4 text-[#5B6B4D]" />
                <span>{isHi ? 'इंटरैक्टिव मानचित्र (OpenStreetMap)' : 'Interactive Map (OpenStreetMap)'}</span>
              </div>
              <span className="text-[11px] text-stone-500">
                {isHi ? 'पिन पर टैप करके विवरण देखें' : 'Tap pin to inspect'}
              </span>
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              id="leaflet-offices-map"
              className="w-full h-[320px] sm:h-[420px] lg:h-[540px] z-0"
              style={{ minHeight: '320px' }}
            />

            {/* Map Legend */}
            <div className="p-3 bg-[#FAF7F2] border-t border-[#E6E0D4] flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
              <span className="font-semibold text-stone-700">{isHi ? 'संकेत:' : 'Legend:'}</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>{isHi ? 'आप' : 'You'}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2B5329]"></span>
                <span>KVK</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8A5A00]"></span>
                <span>Mandi</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
                <span>Soil Lab</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4338CA]"></span>
                <span>Bank</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C2D12]"></span>
                <span>CSC</span>
              </span>
            </div>
          </div>
        </div>

        {/* Office Cards List Column */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-3.5">
          {loading ? (
            <div className="bg-white border border-[#E6E0D4] rounded-2xl p-12 text-center">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#5B6B4D] mb-3" />
              <p className="text-sm font-medium text-stone-600">
                {isHi ? 'निकटतम कार्यालय लोड हो रहे हैं...' : 'Loading nearby agriculture offices...'}
              </p>
            </div>
          ) : filteredOffices.length === 0 ? (
            <div className="bg-white border border-[#E6E0D4] rounded-2xl p-10 text-center space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-stone-400" />
              <h3 className="text-base font-semibold text-stone-700">
                {isHi ? 'कोई कार्यालय नहीं मिला' : 'No offices found in this range'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {isHi
                  ? 'कृपया दूरी का दायरा बढ़ाएं या किसी अन्य जिले अथवा प्रकार का चयन करें।'
                  : 'Try increasing the radius distance or selecting another district or office type.'}
              </p>
              <button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedDistrict('All');
                  setRadiusKm(100);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#8B9A6E] text-white rounded-xl text-xs font-medium hover:bg-[#78885B] transition-colors"
              >
                {isHi ? 'सभी फ़िल्टर रीसेट करें' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            filteredOffices.map((office) => {
              const typeCfg = OFFICE_TYPE_CONFIG[office.office_type] || OFFICE_TYPE_CONFIG['All'];
              const Icon = typeCfg.icon;
              const isSelected = selectedOfficeId === office.id;

              return (
                <div
                  key={office.id}
                  onClick={() => handleSelectCard(office)}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-[#3D550C] ring-2 ring-[#3D550C]/20 bg-[#FAFBF7]'
                      : 'border-[#E6E0D4] hover:border-[#C8BEAB]'
                  }`}
                >
                  {/* Top Row: Type & Distance */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeCfg.badgeBg}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{office.category_label || typeCfg.badgeText}</span>
                    </span>

                    {office.distance_km !== undefined && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>
                          {office.distance_km} km {isHi ? 'दूर' : 'away'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Office Name */}
                  <h3 className="text-base sm:text-lg font-bold text-[#1F2E14] mb-1">
                    {isHi && office.name_hi ? office.name_hi : office.name}
                  </h3>
                  {isHi && office.name_hi && (
                    <p className="text-xs text-stone-500 mb-2">{office.name}</p>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-stone-600 mb-3">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-stone-400 flex-shrink-0" />
                    <span>{office.address}</span>
                  </div>

                  {/* Hours & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 mb-3.5 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                      <span>{office.opening_hours}</span>
                    </div>

                    {office.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <a
                          href={`tel:${office.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-emerald-700 hover:underline"
                        >
                          {office.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Services tags */}
                  {office.services_offered && office.services_offered.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[11px] font-semibold text-stone-500 mb-1.5">
                        {isHi ? 'उपलब्ध सेवाएँ:' : 'Services Available:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {office.services_offered.map((svc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#F4F1EA] text-[#425032] border border-[#E2DCCE] rounded-md text-[11px]"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {office.phone && (
                      <a
                        href={`tel:${office.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3D550C] text-white rounded-xl text-xs font-semibold hover:bg-[#2F4209] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isHi ? 'फ़ोन करें' : 'Call'}</span>
                      </a>
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F2EDE2] border border-[#DDD4C4] text-[#2C3B1E] rounded-xl text-xs font-semibold hover:bg-[#EAE2D2] transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#5B6B4D]" />
                      <span>{isHi ? 'दिशा-निर्देश' : 'Directions'}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyAddress(office);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-stone-500 hover:text-stone-700 text-xs rounded-lg hover:bg-stone-100 transition-colors"
                      title={isHi ? 'पता कॉपी करें' : 'Copy address'}
                    >
                      {copiedId === office.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">{isHi ? 'कॉपी हुआ!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isHi ? 'पता कॉपी' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Honest Attribution & Demo Footnote */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 text-xs text-[#5B6B4D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8B9A6E] flex-shrink-0" />
          <span>
            {isHi
              ? 'डेमो डेटा (छत्तीसगढ़ के सत्यापित सरकारी कृषि कार्यालय)। अंतिम सत्यापन: अप्रैल 2025'
              : 'Demo data (verified government agriculture offices in Chhattisgarh). Last verified: April 2025'}
          </span>
        </div>
        <div className="text-[11px] text-stone-500">
          {isHi ? 'स्रोतः कृषि विस्तार निदेशालय, भारत सरकार' : 'Source: Directorate of Agricultural Extension, GoI'}
        </div>
      </div>
    </div>
  );
};

export default NearbyOfficesPage;
