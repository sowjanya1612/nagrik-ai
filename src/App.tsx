import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SathiChat } from './components/SathiChat';
import { SchemeMatcher } from './components/SchemeMatcher';
import { ComplaintReporting } from './components/ComplaintReporting';
import { MyComplaints } from './components/MyComplaints';
import { DocumentAssistant } from './components/DocumentAssistant';
import { PublicTransparency } from './components/PublicTransparency';
import { ProfilePage } from './components/ProfilePage';
import { initialSchemes, initialComplaints, initialDocumentServices } from './seedData';
import { UserProfile, Scheme, Complaint, DocumentService } from './types';
import { Flame, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from './translations';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [liteMode, setLiteMode] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [currentTab, setCurrentTab] = useState<string>('landing');

  // Core database state
  const [profile, setProfile] = useState<UserProfile>({
    nagrikId: 'NAG-489021',
    fullName: 'Sowjanya Saravanan',
    age: 24,
    state: 'Tamil Nadu',
    income: 180000,
    occupation: 'Education Counselor',
    category: 'OBC',
    gender: 'Female',
    isFarmer: false,
    isStudent: false,
  });

  const [schemes, setSchemes] = useState<Scheme[]>(initialSchemes);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [services, setServices] = useState<DocumentService[]>(initialDocumentServices);

  // View scheme modal
  const [selectedViewScheme, setSelectedViewScheme] = useState<Scheme | null>(null);

  // Duplicate-merge popup state
  const [mergedPopup, setMergedPopup] = useState<{
    active: boolean;
    complaint: Complaint;
    coSignsCount: number;
  } | null>(null);

  // Dark Mode class syncing
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleComplaintReported = (newComp: Complaint, isMerged: boolean, mergedId?: string) => {
    if (isMerged && mergedId) {
      // Find and update count of the merged complaint
      setComplaints(prev => {
        const updated = prev.map(c => {
          if (c.id === mergedId) {
            return {
              ...c,
              affectedCount: c.affectedCount + 1,
              updates: [
                {
                  date: new Date().toISOString(),
                  text: "🔥 Another affected citizen co-signed and merged their report to this centralized ticket.",
                  status: c.status
                },
                ...c.updates
              ]
            };
          }
          return c;
        });
        
        const mergedObj = updated.find(c => c.id === mergedId);
        if (mergedObj) {
          // Trigger the beautiful co-signature pop up!
          setMergedPopup({
            active: true,
            complaint: mergedObj,
            coSignsCount: mergedObj.affectedCount
          });
        }
        return updated;
      });
    } else {
      // Normal non-duplicate complaint addition
      setComplaints(prev => [newComp, ...prev]);
      setCurrentTab('my-complaints');
    }
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'landing':
        return (
          <LandingPage
            liteMode={liteMode}
            profile={profile}
            setCurrentTab={setCurrentTab}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        );
      case 'chat':
        return (
          <SathiChat
            liteMode={liteMode}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            schemes={schemes}
            onViewScheme={(sch) => setSelectedViewScheme(sch)}
          />
        );
      case 'matcher':
        return (
          <SchemeMatcher
            liteMode={liteMode}
            profile={profile}
            setProfile={setProfile}
            schemes={schemes}
            onViewScheme={(sch) => setSelectedViewScheme(sch)}
            selectedLanguage={selectedLanguage}
          />
        );
      case 'complaint':
        return (
          <ComplaintReporting
            liteMode={liteMode}
            onComplaintReported={handleComplaintReported}
            selectedLanguage={selectedLanguage}
          />
        );
      case 'my-complaints':
        return (
          <MyComplaints
            liteMode={liteMode}
            complaints={complaints}
            selectedLanguage={selectedLanguage}
          />
        );
      case 'document':
        return (
          <DocumentAssistant
            liteMode={liteMode}
            services={services}
            selectedLanguage={selectedLanguage}
          />
        );
      case 'dashboard':
        return (
          <PublicTransparency
            liteMode={liteMode}
            complaints={complaints}
            selectedLanguage={selectedLanguage}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            liteMode={liteMode}
            profile={profile}
            setProfile={setProfile}
            selectedLanguage={selectedLanguage}
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-cream-bg text-slate-900'
    }`}>
      
      {/* 1. Global Navigation Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        liteMode={liteMode}
        setLiteMode={setLiteMode}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        profile={profile}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* 2. Horizontal Mini Tab Controller (for rapid switching) */}
      <div className={`border-b ${
        darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-[#1A237E]/5 border-[#1A237E]/10'
      } ${liteMode ? 'border-2 border-black bg-white' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1.5 sm:space-x-2 min-w-max">
            {[
              { id: 'landing', label: getTranslation('tabHome', selectedLanguage) },
              { id: 'chat', label: getTranslation('tabChat', selectedLanguage) },
              { id: 'matcher', label: getTranslation('tabMatcher', selectedLanguage) },
              { id: 'complaint', label: getTranslation('tabReport', selectedLanguage) },
              { id: 'my-complaints', label: getTranslation('tabMyComplaints', selectedLanguage) },
              { id: 'document', label: getTranslation('tabDocument', selectedLanguage) },
              { id: 'dashboard', label: getTranslation('tabTransparency', selectedLanguage) },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`text-[11px] sm:text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all ${
                  currentTab === tab.id
                    ? liteMode
                      ? 'bg-black text-white border-black'
                      : 'bg-primary-indigo text-white border-primary-indigo shadow-md dark:bg-primary-saffron dark:text-slate-950 dark:border-primary-saffron'
                    : liteMode
                    ? 'border-slate-300 text-black bg-white'
                    : 'bg-white dark:bg-slate-900/60 hover:bg-[#1A237E]/5 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={liteMode ? {} : { opacity: 0, y: 15 }}
            animate={liteMode ? {} : { opacity: 1, y: 0 }}
            exit={liteMode ? {} : { opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Bold Typography Custom Live Stats Footer */}
      <footer className={`py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t ${
        liteMode
          ? 'border-2 border-black bg-white text-black font-mono'
          : 'bg-dark-footer text-slate-300 border-white/5'
      }`}>
        <div className="flex flex-wrap gap-8 items-center justify-center md:justify-start">
          
          {/* Live Heatmap Column */}
          <div>
            <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-1.5">Live Heatmap</p>
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 bg-white/5 rounded-md relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-full flex items-end gap-1 px-1.5">
                  <div className="h-[40%] w-2 bg-primary-saffron/50 rounded-t-sm animate-pulse"></div>
                  <div className="h-[75%] w-2 bg-primary-saffron rounded-t-sm"></div>
                  <div className="h-[50%] w-2 bg-primary-saffron/40 rounded-t-sm animate-pulse"></div>
                  <div className="h-[90%] w-2 bg-primary-saffron rounded-t-sm"></div>
                  <div className="h-[65%] w-2 bg-primary-saffron/50 rounded-t-sm"></div>
                </div>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">1,204</p>
                <p className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">Resolved Today</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-10 w-[1px] bg-white/10"></div>

          {/* AI Readiness Column */}
          <div>
            <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-1.5">AI Readiness</p>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full border-2 border-primary-vermilion border-t-transparent animate-spin"></div>
              <div>
                <p className="text-white font-black text-lg leading-none">99.8%</p>
                <p className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">Uptime Efficiency</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Right branding */}
        <div className="flex items-center gap-4 text-center md:text-right">
          <div>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-wider">Smart Bharat Civic Companion</p>
            <p className="text-xs text-primary-saffron font-bold">Designed with ♥ for the Citizens of India</p>
            <p className="text-[9px] text-white/30 mt-1">Grounded under National Data Sharing & Accessibility Policy (NDSAP) • v2.5</p>
          </div>
          <div className="hidden sm:flex h-10 w-10 rounded-full border border-white/10 items-center justify-center text-white/20">
            <svg className="w-5 h-5 text-primary-saffron" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
        </div>
      </footer>

      {/* DYNAMIC DUPLICATE MERGED OVERLAY PORTAL */}
      <AnimatePresence>
        {mergedPopup && mergedPopup.active && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-md p-6 rounded-3xl border text-center relative ${
                liteMode ? 'bg-white border-2 border-black' : 'bg-linear-to-br from-slate-900 to-indigo-950 text-slate-100 border-orange-500/25 shadow-2xl glow-saffron-strong'
              }`}
            >
              <button
                onClick={() => {
                  setMergedPopup(null);
                  setCurrentTab('my-complaints');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 mx-auto mb-4 animate-bounce">
                <Flame className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white">Semantic Duplicate Merged!</h3>
              <p className="text-xs text-orange-400 font-extrabold uppercase mt-1 tracking-wider">Duplicate Scanner Active</p>
              
              <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 my-4 text-xs text-left text-slate-300">
                <p className="font-bold text-slate-200">Active Centralized Ticket:</p>
                <p className="font-semibold text-orange-500 mt-1">#{mergedPopup.complaint.id} — {mergedPopup.complaint.title}</p>
                <p className="mt-2 text-[11px] leading-relaxed italic text-slate-400">
                  "Our AI scanned existing complaints within 100 meters. This issue is already registered. To prevent ward backlog, we have merged your filing into this ticket."
                </p>
              </div>

              <div className="py-2">
                <span className="text-3xl font-black text-white block">🔥 {mergedPopup.coSignsCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Citizens co-signing this issue</span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                By grouping municipal efforts, the urgency level of this pothole/leak has been boosted. Monitor the resolution timeline inside "My Complaints"!
              </p>

              <button
                onClick={() => {
                  setMergedPopup(null);
                  setCurrentTab('my-complaints');
                }}
                className="w-full mt-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-center text-sm transition-colors"
              >
                Go to Resolution Tracker
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW SCHEME DETAIL MODAL VIEW */}
      <AnimatePresence>
        {selectedViewScheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedViewScheme.ministry}</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{selectedViewScheme.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedViewScheme(null)}
                  className="p-1 text-slate-400 hover:text-slate-950 dark:hover:text-white font-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Scheme Abstract</span>
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{selectedViewScheme.description}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Standard Eligibility Rule</span>
                  <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{selectedViewScheme.eligibilitySummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Key Financial / Welfare Benefits</span>
                    <ul className="space-y-2">
                      {selectedViewScheme.benefits.map((b, i) => (
                        <li key={i} className="flex items-start space-x-1.5 font-medium text-slate-600 dark:text-slate-300 text-xs">
                          <span className="text-emerald-500 font-black mt-0.5">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Required Document Dossier</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedViewScheme.requiredDocs.map((d, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-sm text-[10px] font-semibold">
                          📋 {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap justify-between items-center gap-4 text-xs">
                <span className="text-orange-600 font-bold">⚠️ Confirm details on the official portal before applying.</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedViewScheme(null)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold"
                  >
                    Close Prospectus
                  </button>
                  <a
                    href={selectedViewScheme.officialLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg"
                  >
                    Visit Official Portal
                  </a>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
