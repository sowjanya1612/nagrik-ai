import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, MapPin, AlertTriangle, ShieldCheck, Flame, 
  CheckCircle, ArrowRight, RefreshCw, Upload, Image, Trash2, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { Complaint } from '../types';
import { getTranslation } from '../translations';

interface ComplaintReportingProps {
  liteMode: boolean;
  onComplaintReported: (complaint: Complaint, isMerged: boolean, mergedId?: string) => void;
  selectedLanguage: string;
}

export const ComplaintReporting: React.FC<ComplaintReportingProps> = ({
  liteMode,
  onComplaintReported,
  selectedLanguage,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads & Footpaths');
  const [latitude, setLatitude] = useState<number>(11.0168); // Coimbatore Center
  const [longitude, setLongitude] = useState<number>(76.9558);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Vision classification states
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Leaflet map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  // Categories list
  const categories = [
    'Roads & Footpaths',
    'Sanitation & Garbage',
    'Electricity & Lighting',
    'Water & Sewage',
    'Public Safety'
  ];

  // Initialize leaf map
  useEffect(() => {
    if (!liteMode && mapRef.current && !mapInstance.current) {
      try {
        const map = L.map(mapRef.current, { zoomControl: true }).setView([latitude, longitude], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Custom orange pin icon
        const pinIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div class="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold text-[10px]">📍</div>`,
          iconSize: [24, 24]
        });

        // Click to drop marker
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          setLatitude(lat);
          setLongitude(lng);
          
          if (markerInstance.current) {
            markerInstance.current.setLatLng([lat, lng]);
          } else {
            markerInstance.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
            markerInstance.current.on('dragend', () => {
              const pos = markerInstance.current?.getLatLng();
              if (pos) {
                setLatitude(pos.lat);
                setLongitude(pos.lng);
              }
            });
          }
        });

        // Place initial marker
        markerInstance.current = L.marker([latitude, longitude], { icon: pinIcon, draggable: true }).addTo(map);
        markerInstance.current.on('dragend', () => {
          const pos = markerInstance.current?.getLatLng();
          if (pos) {
            setLatitude(pos.lat);
            setLongitude(pos.lng);
          }
        });

        mapInstance.current = map;
      } catch (err) {
        console.error("Leaflet initialization failed", err);
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [liteMode]);

  // Handle image conversion to Base64
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImage(base64);
      autoClassifyPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Auto classify photo using Gemini Vision API on server
  const autoClassifyPhoto = async (base64Str: string) => {
    setClassifying(true);
    try {
      const res = await fetch('/api/complaints/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Str })
      });
      
      if (!res.ok) throw new Error("Vision classification failed");
      const data = await res.json();
      
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.category && categories.includes(data.category)) {
        setCategory(data.category);
      }
      if (data.urgency) setUrgency(data.urgency);

    } catch (err) {
      console.error(err);
      // Quietly fall back without crashing
      setTitle("Auto-classified Civic Issue");
    } finally {
      setClassifying(false);
    }
  };

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || submitting) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/complaints/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          latitude,
          longitude,
          imageBase64: image,
          urgency
        })
      });

      if (!res.ok) throw new Error("Reporting failed");
      const data = await res.json();

      if (data.merged) {
        // Triggers the duplicate merge animated overlay in parent
        onComplaintReported(data.originalComplaint, true, data.originalComplaintId);
      } else {
        // Normal complaint addition
        onComplaintReported(data.complaint, false);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header */}
      <div className="border-b-2 border-primary-indigo/5 pb-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-primary-indigo dark:text-slate-100 flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-primary-saffron" />
          <span>{getTranslation('reportHeader', selectedLanguage)}</span>
        </h2>
        <p className="text-xs text-primary-saffron font-black uppercase tracking-wider mt-0.5">
          {getTranslation('reportSub', selectedLanguage)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: Photo Upload & Map */}
        <div className="space-y-6">
          
          {/* Photo upload container */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
              {getTranslation('uploadPhoto', selectedLanguage)}
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative overflow-hidden ${
                dragActive
                  ? 'border-primary-saffron bg-primary-saffron/5'
                  : image
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : liteMode
                  ? 'border-black'
                  : 'border-primary-indigo/10 dark:border-slate-850 hover:border-primary-saffron hover:bg-primary-saffron/5'
              }`}
            >
              <input
                type="file"
                id="photo-file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {image ? (
                <div className="space-y-3">
                  {!liteMode && (
                    <img
                      src={image}
                      alt="Uploaded civic hazard preview"
                      className="max-h-48 mx-auto rounded-lg object-cover shadow-sm border border-slate-200"
                    />
                  )}
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-xs text-emerald-600 font-bold flex items-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1" />
                      Image Loaded Successfully
                    </span>
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="photo-file" className="cursor-pointer space-y-3 block py-4 font-bold">
                  <div className="w-12 h-12 rounded-full bg-primary-saffron/10 text-primary-saffron mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6 animate-bounce text-primary-saffron" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-primary-indigo dark:text-primary-saffron hover:underline uppercase tracking-wide">{getTranslation('uploadPhotoSub', selectedLanguage)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Supports JPG, PNG, WebP up to 10MB</p>
                </label>
              )}

              {/* Loader overlay for Vision classification */}
              <AnimatePresence>
                {classifying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 text-white"
                  >
                    <RefreshCw className="w-8 h-8 text-primary-saffron animate-spin" />
                    <div>
                      <p className="text-xs font-black tracking-widest uppercase text-primary-saffron text-center">Gemini Vision Active</p>
                      <p className="text-[10px] text-slate-300 font-bold text-center mt-1">{getTranslation('btnSubmitting', selectedLanguage)}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Map Selector */}
          {!liteMode && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>Step 2: Drop Pin-location of Issue</span>
                <span className="text-primary-indigo dark:text-primary-saffron text-[10px] font-mono font-black uppercase tracking-wider">
                  {getTranslation('gpsActive', selectedLanguage)} - Lat: {latitude.toFixed(4)} | Lng: {longitude.toFixed(4)}
                </span>
              </div>
              <div className="h-[260px] rounded-2xl overflow-hidden border-2 border-primary-indigo/10 relative shadow-sm">
                <div ref={mapRef} className="absolute inset-0" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Click anywhere on the map to re-locate the pin to match where the pothole/issue is located.</p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Complaint form populated by Vision */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-primary-indigo/5 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="border-b-2 border-primary-indigo/5 pb-3 mb-4">
              <h3 className="font-black text-primary-indigo dark:text-slate-100 uppercase tracking-tight flex items-center">
                <span>{getTranslation('complaintFormTitle', selectedLanguage)}</span>
                {classifying && <span className="ml-2 text-[10px] bg-primary-saffron/15 text-primary-saffron border border-primary-saffron/25 px-2.5 py-0.5 rounded-lg animate-pulse font-black uppercase tracking-wider">Syncing...</span>}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Verify or adjust details generated by Gemini Vision before submitting.</p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('issueTitle', selectedLanguage)}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getTranslation('issueTitlePlaceholder', selectedLanguage)}
                className="w-full py-3.5 px-4 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/10 focus:border-primary-indigo focus:outline-hidden font-bold"
              />
            </div>

            {/* Category dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('selectCategory', selectedLanguage)}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/10 focus:border-primary-indigo focus:outline-hidden font-black uppercase tracking-wider text-primary-indigo dark:text-slate-300"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Urgency selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('urgencyLabel', selectedLanguage)}</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm bg-white dark:bg-slate-800 font-black border-2 focus:outline-hidden uppercase tracking-wider capitalize ${
                    urgency === 'critical'
                      ? 'text-red-600 border-red-500/30'
                      : urgency === 'high'
                      ? 'text-primary-vermilion border-primary-vermilion/30'
                      : 'text-primary-indigo border-primary-indigo/10'
                  }`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">🚨 Critical / Safety Hazard</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('issueDescription', selectedLanguage)}</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={getTranslation('issueDescriptionPlaceholder', selectedLanguage)}
                className="w-full py-3.5 px-4 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/10 focus:border-primary-indigo focus:outline-hidden font-bold"
              />
            </div>

            {/* Location Inputs for Lite Mode */}
            {liteMode && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full py-2 px-3 border border-black text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full py-2 px-3 border border-black text-xs"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!title.trim() || !description.trim() || submitting}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  !title.trim() || !description.trim() || submitting
                    ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800'
                    : liteMode
                    ? 'bg-black text-white border-2 border-black'
                    : 'bg-linear-to-tr from-primary-saffron to-primary-vermilion text-slate-950 shadow-md hover:shadow-primary-saffron/20 transform hover:scale-[1.01]'
                }`}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{getTranslation('btnSubmitting', selectedLanguage)}</span>
                  </>
                ) : (
                  <>
                    <span>{getTranslation('btnSubmit', selectedLanguage)}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 font-black" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
