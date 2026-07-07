import React, { useState, useEffect, useRef } from 'react';
import { 
  Landmark, Flame, CheckCircle, AlertTriangle, ShieldCheck, 
  Map, BarChart2, TrendingUp, HelpCircle, Activity 
} from 'lucide-react';
import { motion } from 'motion/react';
import L from 'leaflet';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { Complaint } from '../types';
import { getTranslation } from '../translations';

interface PublicTransparencyProps {
  liteMode: boolean;
  complaints: Complaint[];
  selectedLanguage: string;
}

export const PublicTransparency: React.FC<PublicTransparencyProps> = ({
  liteMode,
  complaints,
  selectedLanguage,
}) => {
  const [activeSegment, setActiveSegment] = useState<'map' | 'charts'>('map');
  
  // Stats counters
  const totalReported = complaints.reduce((acc, c) => acc + c.affectedCount, 0);
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const activeCount = complaints.filter(c => c.status !== 'Resolved').length;
  const resolutionPercentage = complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : 100;

  // Chart 1: Category counts
  const getCategoryChartData = () => {
    const cats: Record<string, number> = {};
    complaints.forEach(c => {
      cats[c.category] = (cats[c.category] || 0) + 1;
    });
    return Object.keys(cats).map(name => ({
      name,
      value: cats[name]
    }));
  };

  const categoryData = getCategoryChartData();

  // Chart 2: Resolution time by dept (mocked but consistent)
  const deptResolutionTime = [
    { name: 'Roads Division', days: 4.8, count: 12 },
    { name: 'Sanitation Dept', days: 1.5, count: 24 },
    { name: 'Electricity Board', days: 1.2, count: 18 },
    { name: 'Water Board', days: 2.8, count: 9 },
    { name: 'Public Safety', days: 2.1, count: 6 }
  ];

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!liteMode && activeSegment === 'map' && mapContainerRef.current && !mapRef.current) {
      try {
        const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([11.0168, 76.9558], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Add complaints heat circles
        complaints.forEach((c) => {
          const color = 
            c.urgency === 'critical' ? '#EF4444' : 
            c.urgency === 'high' ? '#F59E0B' : 
            '#3B82F6';

          const radius = 100 + (c.affectedCount * 12); // larger circle for larger affected count

          const circle = L.circle([c.latitude, c.longitude], {
            color: color,
            fillColor: color,
            fillOpacity: 0.35,
            radius: Math.min(radius, 500)
          }).addTo(map);

          // Add clean information popup
          const popupContent = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 180px; padding: 2px;">
              <span style="font-size: 9px; text-transform: uppercase; font-weight: 800; color: #888;">${c.category}</span>
              <h4 style="margin: 3px 0; font-size: 13px; font-weight: 800; color: #111;">${c.title}</h4>
              <p style="margin: 0; font-size: 11px; color: #555; line-height: 1.3;">${c.description.substring(0, 60)}...</p>
              <div style="margin-top: 8px; display: flex; justify-between; align-items: center; border-top: 1px solid #eee; padding-top: 6px;">
                <span style="font-size: 10px; font-weight: bold; color: ${color};">${c.urgency.toUpperCase()}</span>
                <span style="font-size: 10px; font-weight: bold; background: #FFF7ED; color: #EA580C; padding: 1px 4px; border-radius: 2px;">🔥 ${c.affectedCount} Affected</span>
              </div>
            </div>
          `;

          circle.bindPopup(popupContent);
        });

        mapRef.current = map;
      } catch (err) {
        console.error("Transparency map initialization failed", err);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [liteMode, activeSegment, complaints]);

  const COLORS = ['#1A237E', '#FF8F00', '#FF5722', '#0D9488', '#475569'];

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Stats counters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b-2 border-primary-indigo/5 pb-4 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-primary-indigo dark:text-slate-100 flex items-center space-x-2">
            <Landmark className="w-6 h-6 text-primary-saffron" />
            <span>{getTranslation('transparencyHeader', selectedLanguage)}</span>
          </h2>
          <p className="text-xs text-primary-saffron font-black uppercase tracking-wider mt-0.5">
            {getTranslation('transparencySub', selectedLanguage)}
          </p>
        </div>

        {/* View Switcher buttons (Not shown in Lite mode) */}
        {!liteMode && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border-2 border-primary-indigo/5">
            <button
              onClick={() => setActiveSegment('map')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 ${
                activeSegment === 'map'
                  ? 'bg-primary-indigo text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{getTranslation('activeSegmentMap', selectedLanguage)}</span>
            </button>
            <button
              onClick={() => setActiveSegment('charts')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 ${
                activeSegment === 'charts'
                  ? 'bg-primary-indigo text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{getTranslation('activeSegmentCharts', selectedLanguage)}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Top level live count counters banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border-2 text-center font-bold ${
          liteMode ? 'border-2 border-black bg-white' : 'bg-white dark:bg-slate-900 border-primary-indigo/5 shadow-xs'
        }`}>
          <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">{getTranslation('voiceScaleTitle', selectedLanguage)}</span>
          <span className="text-3xl sm:text-4xl font-black text-primary-indigo dark:text-slate-100 mt-1 block tracking-tighter">
            {totalReported}
          </span>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">{getTranslation('voiceScaleSub', selectedLanguage)}</p>
        </div>

        <div className={`p-5 rounded-2xl border-2 text-center font-bold ${
          liteMode ? 'border-2 border-black bg-white' : 'bg-white dark:bg-slate-900 border-primary-indigo/5 shadow-xs'
        }`}>
          <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">{getTranslation('unresolvedGrievances', selectedLanguage)}</span>
          <span className="text-3xl sm:text-4xl font-black text-primary-vermilion mt-1 block tracking-tighter">
            {activeCount}
          </span>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">{getTranslation('unresolvedCountSub', selectedLanguage)}</p>
        </div>

        <div className={`p-5 rounded-2xl border-2 text-center font-bold ${
          liteMode ? 'border-2 border-black bg-white' : 'bg-white dark:bg-slate-900 border-primary-indigo/5 shadow-xs'
        }`}>
          <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">{getTranslation('resolvedGrievances', selectedLanguage)}</span>
          <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block tracking-tighter">
            {resolvedCount}
          </span>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">{getTranslation('resolvedCountSub', selectedLanguage)}</p>
        </div>

        <div className={`p-5 rounded-2xl border-2 text-center font-bold ${
          liteMode ? 'border-2 border-black bg-white' : 'bg-white dark:bg-slate-900 border-primary-indigo/5 shadow-xs'
        }`}>
          <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">{getTranslation('trustScoreSub', selectedLanguage)}</span>
          <span className="text-3xl sm:text-4xl font-black text-primary-saffron mt-1 block tracking-tighter">
            {resolutionPercentage}%
          </span>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">{getTranslation('avgDaysLabel', selectedLanguage)}</p>
        </div>
      </div>

      {/* 3. Main Dashboard Panels */}
      {liteMode || activeSegment === 'charts' ? (
        
        // CHARTS SEGMENT (or Lite Mode default)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
          
          {/* Chart Card 1 */}
          <div className={`p-6 rounded-2xl border-2 ${
            liteMode ? 'border-2 border-black bg-white' : 'bg-white dark:bg-slate-900 border-primary-indigo/5 shadow-md'
          }`}>
            <h3 className="text-xs font-black text-primary-indigo dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary-saffron" />
              <span>{getTranslation('chartCategoryTitle', selectedLanguage)}</span>
            </h3>

            {liteMode ? (
              <div className="space-y-2 font-bold uppercase">
                {categoryData.map((d, i) => (
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b font-mono">
                    <span>{d.name}:</span>
                    <span className="font-black text-primary-indigo">{d.value} complaints</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0D123F', color: '#fff', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart Card 2 */}
          <div className={`p-6 rounded-2xl border-2 ${
            liteMode ? 'border-2 border-black bg-white' : 'bg-white dark:bg-slate-900 border-primary-indigo/5 shadow-md'
          }`}>
            <h3 className="text-xs font-black text-primary-indigo dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>{getTranslation('chartResolutionTitle', selectedLanguage)}</span>
            </h3>

            {liteMode ? (
              <div className="space-y-2 font-bold uppercase">
                {deptResolutionTime.map((d, i) => (
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b font-mono">
                    <span>{d.name}:</span>
                    <span className="font-black text-primary-indigo">{d.days} Days avg</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptResolutionTime}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} style={{ fontWeight: 'bold' }} />
                    <YAxis stroke="#888888" fontSize={9} tickLine={false} label={{ value: 'Days to Resolve', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#888', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ background: '#0D123F', color: '#fff', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                      {deptResolutionTime.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF8F00' : '#1A237E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

      ) : (

        // MAP SEGMENT
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border-2 border-primary-indigo/5 h-[500px] flex flex-col shadow-lg">
          
          {/* Map sub header controls info */}
          <div className="flex items-center justify-between text-xs pb-3 border-b-2 border-primary-indigo/5 mb-3 px-2 font-bold">
            <span className="font-black text-primary-indigo dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-vermilion animate-ping"></span>
              <span>{getTranslation('liveHeatmapFeed', selectedLanguage)}</span>
            </span>
            <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>{getTranslation('criticalLegend', selectedLanguage)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>{getTranslation('warningLegend', selectedLanguage)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>{getTranslation('normalLegend', selectedLanguage)}</span>
              </span>
            </div>
          </div>

          {/* Map Leaflet Target Container */}
          <div className="flex-1 rounded-2xl overflow-hidden relative border-2 border-primary-indigo/5">
            <div ref={mapContainerRef} className="absolute inset-0" />
          </div>

        </div>

      )}

    </div>
  );
};
