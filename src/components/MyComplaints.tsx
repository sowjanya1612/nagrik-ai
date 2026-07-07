import React, { useState } from 'react';
import { 
  AlertTriangle, Clock, Flame, CheckCircle, ArrowRight, 
  MapPin, RefreshCw, ChevronRight, User, CalendarDays, Loader 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Complaint } from '../types';
import { getTranslation } from '../translations';

interface MyComplaintsProps {
  liteMode: boolean;
  complaints: Complaint[];
  selectedLanguage: string;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
  liteMode,
  complaints,
  selectedLanguage,
}) => {
  const [selectedId, setSelectedId] = useState<string>(complaints[0]?.id || '');
  const activeComplaint = complaints.find(c => c.id === selectedId) || complaints[0];

  const steps = [
    { name: 'Reported', label: 'Reported' },
    { name: 'Acknowledged', label: 'Acknowledged' },
    { name: 'In Progress', label: 'In Progress' },
    { name: 'Resolved', label: 'Resolved' }
  ];

  const getStepIndex = (status: string) => {
    return steps.findIndex(s => s.name === status);
  };

  const getStepProgressWidth = (status: string) => {
    const idx = getStepIndex(status);
    if (idx === -1) return '0%';
    return `${(idx / (steps.length - 1)) * 100}%`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="border-b-2 border-primary-indigo/5 pb-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-primary-indigo dark:text-slate-100 flex items-center space-x-2">
          <Clock className="w-6 h-6 text-primary-saffron" />
          <span>{getTranslation('myComplaintsHeader', selectedLanguage)}</span>
        </h2>
        <p className="text-xs text-primary-saffron font-black uppercase tracking-wider mt-0.5">
          {getTranslation('myComplaintsSub', selectedLanguage)}
        </p>
      </div>

      {complaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-primary-indigo/10 bg-white dark:bg-slate-900 shadow-xs">
          <div className="w-16 h-16 bg-primary-saffron/10 rounded-full flex items-center justify-center text-primary-saffron mx-auto mb-4 border border-primary-saffron/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-primary-indigo dark:text-slate-200 uppercase tracking-tight">{getTranslation('noComplaintsYet', selectedLanguage)}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT PANEL: Active list of complaints */}
          <div className="lg:col-span-1 space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('unresolvedGrievances', selectedLanguage)}</span>
            
            {complaints.map((c) => {
              const isSelected = c.id === selectedId;
              const stepIdx = getStepIndex(c.status);
              
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all text-left relative ${
                    isSelected
                      ? liteMode
                        ? 'border-2 border-black bg-slate-100'
                        : 'bg-white dark:bg-slate-900 border-primary-saffron shadow-md ring-1 ring-primary-saffron/20'
                      : liteMode
                      ? 'border-slate-300'
                      : 'bg-white dark:bg-slate-900/40 border-primary-indigo/5 hover:bg-white dark:hover:bg-slate-900 hover:border-primary-indigo/20'
                  }`}
                >
                  
                  {/* Urgent high intensity pulse for critical or high issues */}
                  {!liteMode && (c.urgency === 'critical' || c.urgency === 'high') && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-urgent-pulse"></span>
                  )}

                  <div className="space-y-1.5 font-bold">
                    <div className="flex justify-between items-start pr-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{c.category}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md capitalize tracking-wide border border-black/10 ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : c.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-primary-indigo dark:text-slate-100 line-clamp-1 uppercase tracking-tight">{c.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-bold">{c.description}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1.5 border-t-2 border-primary-indigo/5">
                      <span className="flex items-center text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <CalendarDays className="w-3.5 h-3.5 mr-1" />
                        {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      
                      {c.affectedCount > 1 && (
                        <span className="text-primary-vermilion inline-flex items-center font-black bg-primary-vermilion/10 px-2 py-0.5 rounded-lg text-[9px] uppercase border border-primary-vermilion/15">
                          <Flame className="w-3 h-3 text-primary-saffron mr-0.5 animate-bounce" />
                          <span>🔥 {c.affectedCount} {getTranslation('coSignsLabel', selectedLanguage)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* RIGHT PANEL: Tracker Timeline route details */}
          <div className="lg:col-span-2">
            {activeComplaint ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-primary-indigo/5 space-y-6 shadow-md">
                
                {/* Header detail */}
                <div className="border-b-2 border-primary-indigo/5 pb-4 flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{activeComplaint.category}</span>
                    <h3 className="text-xl font-black text-primary-indigo dark:text-slate-100 uppercase tracking-tight mt-1">{activeComplaint.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed mt-2">{activeComplaint.description}</p>
                  </div>
                  
                  {activeComplaint.imageUrl && !liteMode && (
                    <img
                      src={activeComplaint.imageUrl}
                      alt="Complaint snapshot"
                      className="w-24 h-24 rounded-lg object-cover border-2 border-primary-indigo/10 flex-shrink-0"
                    />
                  )}
                </div>

                {/* 2. INDIAN RAILWAY TRAIN ROUTE MAP TRACKER */}
                <div className="space-y-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('timelineUpdates', selectedLanguage)}</span>
                  
                  <div className="relative pt-6 pb-4 px-4 bg-slate-50 dark:bg-slate-950 rounded-xl border-2 border-primary-indigo/5">
                    
                    {/* The Track Line */}
                    <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full -translate-y-1/2"></div>
                    
                    {/* The Filled Route (Fills as train moves) */}
                    <div
                      className="absolute top-1/2 left-8 h-1.5 rounded-full -translate-y-1/2 transition-all duration-1000 train-track-filled"
                      style={{ width: getStepProgressWidth(activeComplaint.status), maxWidth: 'calc(100% - 4rem)' }}
                    ></div>

                    {/* Steps dots */}
                    <div className="relative z-10 flex justify-between items-center">
                      {steps.map((st, index) => {
                        const isCompleted = getStepIndex(activeComplaint.status) >= index;
                        const isActive = activeComplaint.status === st.name;
                        
                        return (
                          <div key={st.name} className="flex flex-col items-center">
                            
                            {/* Node icon */}
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              isActive
                                ? 'bg-primary-saffron border-white text-slate-950 scale-110 shadow-md shadow-primary-saffron/20'
                                : isCompleted
                                ? 'bg-emerald-500 border-white text-white'
                                : 'bg-white dark:bg-slate-900 text-slate-400 border-2 border-primary-indigo/10'
                            }`}>
                              {st.name === 'Resolved' && isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : isActive ? (
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                                  className="text-xs font-black block"
                                >
                                  🚂
                                </motion.span>
                              ) : (
                                <span className="text-[10px] font-black">{index + 1}</span>
                              )}
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-black mt-2.5 tracking-wider uppercase ${
                              isActive
                                ? 'text-primary-saffron'
                                : isCompleted
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-slate-400'
                            }`}>
                              {st.label}
                            </span>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                  
                  {/* Explanation text of state */}
                  <div className="p-4 bg-primary-saffron/5 rounded-xl border border-primary-saffron/15 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                    <div className="text-primary-saffron font-black text-sm mt-0.5">📢</div>
                    <div>
                      <span className="font-black text-primary-saffron block uppercase tracking-wider text-[10px] mb-0.5">{getTranslation('brandName', selectedLanguage)}:</span>
                      <p className="font-bold leading-relaxed">{activeComplaint.statusText}</p>
                    </div>
                  </div>

                </div>

                {/* 3. TIMELINE OF DETAILED EVENTS */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('timelineUpdates', selectedLanguage)}</span>
                  
                  <div className="border-l-2 border-primary-indigo/10 ml-4 space-y-4">
                    {activeComplaint.updates.map((up, idx) => (
                      <div key={idx} className="relative pl-6">
                        {/* Bullet point node */}
                        <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full -translate-x-1/2 border-2 ${
                          up.status === 'Resolved'
                            ? 'bg-emerald-500 border-white'
                            : up.status === 'In Progress'
                            ? 'bg-blue-500 border-white'
                            : 'bg-primary-saffron border-white'
                        }`}></div>

                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-400 font-bold">
                            <span className="font-black text-primary-indigo dark:text-slate-300 uppercase tracking-wide">{up.status} Stage</span>
                            <span className="font-mono text-[9px] font-black uppercase tracking-wider">{new Date(up.date).toLocaleDateString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{up.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Select a complaint from the left to view tracking status.</div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
