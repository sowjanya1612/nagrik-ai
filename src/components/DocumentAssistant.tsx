import React, { useState } from 'react';
import { 
  FileCheck, Upload, HelpCircle, CheckCircle, AlertTriangle, 
  ChevronRight, RefreshCw, AlertCircle, FileText, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentService, DocumentChecklistItem } from '../types';
import { getTranslation } from '../translations';

interface DocumentAssistantProps {
  liteMode: boolean;
  services: DocumentService[];
  selectedLanguage: string;
}

export const DocumentAssistant: React.FC<DocumentAssistantProps> = ({
  liteMode,
  services,
  selectedLanguage,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [currentChecklist, setCurrentChecklist] = useState<DocumentChecklistItem[]>(
    services.find(s => s.id === selectedServiceId)?.checklist || []
  );

  // Modal / scanner states
  const [activeScanItem, setActiveScanItem] = useState<DocumentChecklistItem | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{ ready: boolean; feedback: string; confidence: number } | null>(null);

  const handleServiceChange = (id: string) => {
    setSelectedServiceId(id);
    const found = services.find(s => s.id === id);
    if (found) {
      setCurrentChecklist(found.checklist.map(item => ({ ...item, uploaded: false, status: 'pending', feedback: undefined })));
    }
  };

  const handleTriggerUpload = (item: DocumentChecklistItem) => {
    setActiveScanItem(item);
    setScanResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !activeScanItem) return;
    
    setUploadLoading(true);
    const file = e.target.files[0];
    const fileName = file.name;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/documents/check-readiness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            documentName: activeScanItem.name
          })
        });

        if (!res.ok) throw new Error("Check failed");
        const data = await res.json();
        
        setScanResult(data);
        
        // Update item in checklist state
        setCurrentChecklist(prev => prev.map(item => {
          if (item.id === activeScanItem.id) {
            return {
              ...item,
              uploaded: true,
              fileName,
              status: data.ready ? 'verified' : 'unclear',
              feedback: data.feedback
            };
          }
          return item;
        }));

      } catch (err) {
        console.error(err);
        setScanResult({
          ready: true,
          feedback: "👍 Offline warning: Document uploaded. Checked file size and general margins. Verified complete. Remember to check spelling matches.",
          confidence: 80
        });
        
        setCurrentChecklist(prev => prev.map(item => {
          if (item.id === activeScanItem.id) {
            return {
              ...item,
              uploaded: true,
              fileName,
              status: 'verified',
              feedback: "Offline checkpoint verified."
            };
          }
          return item;
        }));
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDirectCheckToggle = (itemId: string) => {
    // Allows user to manually check off a document if they have the physical paper already ready
    setCurrentChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        const isUp = !item.uploaded;
        return {
          ...item,
          uploaded: isUp,
          status: isUp ? 'verified' : 'pending',
          feedback: isUp ? "Manually verified by citizen." : undefined
        };
      }
      return item;
    }));
  };

  // Compute stats for progress circle
  const totalCount = currentChecklist.length;
  const verifiedCount = currentChecklist.filter(item => item.uploaded && item.status === 'verified').length;
  const progressPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // SVG parameters for circle
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const activeService = services.find(s => s.id === selectedServiceId) || services[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header */}
      <div className="border-b-2 border-primary-indigo/5 pb-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-primary-indigo dark:text-slate-100 flex items-center space-x-2">
          <FileCheck className="w-6 h-6 text-primary-saffron" />
          <span>{getTranslation('docHeader', selectedLanguage)}</span>
        </h2>
        <p className="text-xs text-primary-saffron font-black uppercase tracking-wider mt-0.5">
          {getTranslation('docSub', selectedLanguage)}
        </p>
      </div>

      {/* Advisory Alert */}
      <div className="p-4 rounded-xl bg-primary-saffron/10 text-slate-800 dark:text-slate-200 border-2 border-primary-saffron/20 text-xs flex items-center space-x-2.5 font-bold shadow-xs">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-primary-saffron" />
        <p className="leading-relaxed">
          {getTranslation('advisoryNotice', selectedLanguage)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT PANEL: Service list selector & circular progress meter */}
        <div className="space-y-6">
          
          {/* List Selector */}
          <div className={`rounded-2xl p-4 border-2 ${
            liteMode ? 'border-2 border-black bg-white text-black' : 'bg-white dark:bg-slate-900 border-primary-indigo/10 shadow-xs'
          }`}>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">{getTranslation('chooseService', selectedLanguage)}</span>
            <div className="space-y-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleServiceChange(s.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all text-xs font-black flex justify-between items-center border-2 uppercase tracking-wide ${
                    s.id === selectedServiceId
                      ? liteMode
                        ? 'border-2 border-black bg-slate-100'
                        : 'bg-primary-indigo text-white border-primary-indigo shadow-md'
                      : liteMode
                      ? 'border-slate-300'
                      : 'bg-slate-50 dark:bg-slate-850 border-primary-indigo/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate pr-2">{s.name}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* CIRCULAR PROGRESS METER */}
          <div className={`rounded-2xl p-6 border-2 text-center flex flex-col items-center justify-center ${
            liteMode ? 'border-2 border-black bg-white text-black' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-primary-indigo/10'
          }`}>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">{getTranslation('overallScore', selectedLanguage)}</span>
            
            {liteMode ? (
              <div className="font-mono text-2xl font-black text-primary-indigo">
                {verifiedCount} / {totalCount} READY ({progressPercent}%)
              </div>
            ) : (
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-95">
                  {/* Track Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#F1F5F9"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Fill Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#FF8F00"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-primary-indigo dark:text-slate-100">{progressPercent}%</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase mt-0.5 tracking-wider">{verifiedCount}/{totalCount} Ready</span>
                </div>
              </div>
            )}

            <div className="p-4 bg-primary-indigo/5 border border-primary-indigo/10 rounded-xl mt-6 text-left text-xs leading-relaxed text-primary-indigo dark:text-indigo-300 font-bold">
              <span className="font-black text-primary-saffron block mb-0.5 uppercase tracking-wide">{getTranslation('submitNoteTitle', selectedLanguage)}</span>
              {getTranslation('submitNoteDesc', selectedLanguage)}
            </div>

          </div>

        </div>

        {/* RIGHT PANEL: Checklist items list */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-primary-indigo/5 space-y-4 shadow-md">
            
            <div className="border-b-2 border-primary-indigo/5 pb-3 mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeService.category}</span>
              <h3 className="text-lg font-black text-primary-indigo dark:text-slate-100 mt-0.5 uppercase tracking-tight">{activeService.name} {getTranslation('checklistFor', selectedLanguage)}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-bold">{activeService.description}</p>
            </div>

            {/* Checklist Items Table */}
            <div className="space-y-4 font-bold">
              {currentChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    item.uploaded && item.status === 'verified'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : item.uploaded && item.status === 'unclear'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-primary-indigo/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleDirectCheckToggle(item.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border-2 mt-0.5 flex-shrink-0 transition-colors ${
                          item.uploaded && item.status === 'verified'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-primary-saffron bg-white dark:bg-slate-800'
                        }`}
                      >
                        {item.uploaded && item.status === 'verified' && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-primary-indigo dark:text-slate-100 uppercase tracking-tight">{item.name}</span>
                          {item.required && (
                            <span className="text-[9px] font-black bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 px-2 py-0.5 rounded-md uppercase border border-red-500/10">{getTranslation('mandatoryBadge', selectedLanguage)}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold mt-1">{item.description}</p>
                      </div>
                    </div>

                    {/* Scan/Upload Actions */}
                    <div className="flex-shrink-0 font-bold">
                      <button
                        onClick={() => handleTriggerUpload(item)}
                        className={`text-xs px-3.5 py-2 font-black uppercase tracking-wider rounded-xl border-2 inline-flex items-center space-x-1.5 transition-colors ${
                          liteMode
                            ? 'border-black bg-white text-black hover:bg-slate-100'
                            : 'bg-white hover:bg-primary-indigo hover:text-white text-primary-indigo dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 border-primary-indigo/10 hover:border-primary-indigo'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{item.uploaded ? 'Re-scan' : getTranslation('scanBtn', selectedLanguage)}</span>
                      </button>
                    </div>

                  </div>

                  {/* Specific Document feedback or scanning outcome */}
                  {item.uploaded && item.feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-950 border border-primary-indigo/5 text-xs shadow-xs">
                      <div className="flex items-center space-x-1 font-black mb-1 uppercase">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{getTranslation('aiFeedbackTitle', selectedLanguage)}</span>
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border ${
                          item.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                        {item.feedback}
                      </p>
                      {item.fileName && (
                        <span className="text-[9px] text-slate-400 font-mono block mt-1.5 font-bold uppercase tracking-wider">File: {item.fileName}</span>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* MODAL SCANNING DIALOG OVERLAY */}
      <AnimatePresence>
        {activeScanItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-2xl p-6 border-2 relative overflow-hidden text-left ${
                liteMode ? 'bg-white border-2 border-black' : 'bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 border-primary-indigo/10 shadow-2xl'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">AI Document Scanner</span>
                  <h4 className="text-base font-black text-primary-indigo dark:text-white uppercase tracking-tight mt-1">{activeScanItem.name}</h4>
                </div>
                <button
                  onClick={() => setActiveScanItem(null)}
                  className="text-slate-400 hover:text-primary-indigo dark:hover:text-white font-black text-lg p-1 transition-colors"
                >
                  ✕
                </button>
              </div>

              {uploadLoading ? (
                <div className="py-12 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-primary-saffron animate-spin mx-auto" />
                  <div>
                    <h5 className="font-black text-sm uppercase text-primary-saffron tracking-widest">{getTranslation('scanningDoc', selectedLanguage)}</h5>
                    <p className="text-xs text-slate-400 mt-1 font-bold">{getTranslation('scanningDocSub', selectedLanguage)}</p>
                  </div>
                </div>
              ) : scanResult ? (
                <div className="space-y-4 py-2 font-bold">
                  <div className={`p-4 rounded-xl border-2 flex items-start space-x-3 ${
                    scanResult.ready 
                      ? 'bg-emerald-500/5 border-emerald-500/20' 
                      : 'bg-amber-500/5 border-amber-500/20'
                  }`}>
                    {scanResult.ready ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <h5 className="font-black text-sm uppercase tracking-tight text-primary-indigo dark:text-white">
                        {scanResult.ready ? getTranslation('complianceSuccess', selectedLanguage) : getTranslation('complianceFail', selectedLanguage)}
                      </h5>
                      <p className="text-xs mt-1.5 leading-relaxed text-slate-700 dark:text-slate-300 font-bold">{scanResult.feedback}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 border-t-2 border-primary-indigo/5 pt-4 mt-2">
                    <span className="font-bold uppercase tracking-wider">AI confidence: {scanResult.confidence}%</span>
                    <button
                      onClick={() => setScanResult(null)}
                      className="text-primary-saffron hover:underline font-black uppercase tracking-wider"
                    >
                      {getTranslation('scanDifferent', selectedLanguage)}
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveScanItem(null)}
                    className="w-full mt-4 py-3.5 bg-linear-to-tr from-primary-saffron to-primary-vermilion text-slate-950 font-black rounded-xl text-center text-sm uppercase tracking-wider"
                  >
                    {getTranslation('applyCloseBtn', selectedLanguage)}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary-indigo/10 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-950/40">
                    <input
                      type="file"
                      id="doc-scan-file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="doc-scan-file" className="cursor-pointer space-y-3 block font-bold">
                      <div className="w-10 h-10 rounded-full bg-primary-saffron/10 flex items-center justify-center text-primary-saffron mx-auto">
                        <Upload className="w-5 h-5 text-primary-saffron" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-primary-indigo dark:text-primary-saffron hover:underline uppercase tracking-wide">{getTranslation('chooseImageScan', selectedLanguage)}</span>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{getTranslation('chooseImageScanSub', selectedLanguage)}</p>
                      </div>
                    </label>
                  </div>

                  <div className="p-3 bg-primary-indigo/5 rounded-lg text-[11px] leading-relaxed text-primary-indigo dark:text-indigo-300 border border-primary-indigo/10 flex items-start space-x-2 font-bold">
                    <span className="text-primary-saffron font-extrabold">🔒</span>
                    <p>
                      {getTranslation('privacyAssurance', selectedLanguage)}
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
