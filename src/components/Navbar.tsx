import React from 'react';
import { Sunset, Moon, Sun, WifiOff, Languages, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types';
import { getTranslation } from '../translations';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  liteMode: boolean;
  setLiteMode: (val: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  profile: UserProfile;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  liteMode,
  setLiteMode,
  selectedLanguage,
  setSelectedLanguage,
  profile,
  currentTab,
  setCurrentTab,
}) => {
  const languages = [
    { code: 'English', label: 'English' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Tamil', label: 'தமிழ் (Tamil)' },
    { code: 'Telugu', label: 'తెలుగు (Telugu)' },
    { code: 'Bengali', label: 'বাংলা (Bengali)' },
    { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'Marathi', label: 'मराठी (Marathi)' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-colors ${
      darkMode ? 'bg-slate-950 text-slate-100 border-b border-slate-800' : 'bg-primary-indigo text-white shadow-md'
    } ${liteMode ? 'bg-white text-black border-slate-900 border-2 shadow-none' : 'backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo Brand Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('landing')}>
            <div className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-linear-to-tr from-primary-saffron to-primary-vermilion text-white ${
              liteMode ? 'border-2 border-black rounded-none bg-none text-black' : 'shadow-lg'
            }`}>
              <Sunset className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className={`font-black text-xl sm:text-2xl tracking-tighter uppercase ${
                  darkMode ? 'text-white' : 'text-white'
                } lite-mode-hide`}>
                  {getTranslation('brandName', selectedLanguage)}
                </span>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-800 dark:text-slate-100 hidden lite-mode-show">
                  {getTranslation('brandName', selectedLanguage)}
                </span>
                <span className="text-[10px] bg-white/15 text-white dark:bg-slate-800 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded-sm border border-white/10 uppercase tracking-widest">
                  v2.5
                </span>
              </div>
              <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                darkMode ? 'text-slate-400' : 'text-primary-saffron'
              }`}>
                {getTranslation('subBrand', selectedLanguage)}
              </p>
            </div>
          </div>

          {/* Configuration and Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Jurisdiction Badge from Design HTML */}
            {!liteMode && (
              <div className="hidden sm:flex items-center bg-white/10 dark:bg-slate-900/60 rounded-full px-3 py-1.5 gap-2 border border-white/5">
                <span className="text-xs text-primary-saffron animate-pulse">●</span>
                <span className="text-xs text-white dark:text-slate-300 font-bold font-mono tracking-wide">{profile.state === 'Tamil Nadu' ? 'Coimbatore, TN' : `${profile.state}`}</span>
              </div>
            )}

            {/* Low-bandwidth Lite Mode Toggle */}
            <button
              onClick={() => setLiteMode(!liteMode)}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-all uppercase tracking-wider ${
                liteMode
                  ? 'bg-black text-white border-black'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20 dark:bg-slate-800 dark:text-orange-400 dark:border-slate-700'
              }`}
              title="Simulate low-bandwidth rural 2G network (strips media & effects)"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{liteMode ? getTranslation('liteModeOn', selectedLanguage) : getTranslation('liteMode', selectedLanguage)}</span>
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <button className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg border font-bold transition-all uppercase tracking-wider ${
                liteMode ? 'border-black border' : 'bg-white/10 text-white border-white/20 hover:bg-white/20 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}>
                <Languages className="w-3.5 h-3.5 text-primary-saffron" />
                <span>{selectedLanguage}</span>
              </button>
              
              <div className={`absolute right-0 top-full mt-1.5 w-40 rounded-lg shadow-lg border hidden group-hover:block z-50 overflow-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 text-slate-800'
              } ${liteMode ? 'border-2 border-black rounded-none shadow-none' : ''}`}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-primary-indigo text-white font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            {!liteMode && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all border border-white/10 dark:border-slate-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-primary-saffron" />}
              </button>
            )}

            {/* Nagrik Badge Card Profile Button */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider ${
                currentTab === 'profile'
                  ? 'bg-primary-saffron text-slate-950 border-primary-saffron'
                  : liteMode
                  ? 'border-black border'
                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">{profile.fullName || getTranslation('guest', selectedLanguage)}</span>
              <span className="font-mono text-[10px] bg-white/25 text-white dark:bg-slate-800 dark:text-slate-300 px-1 py-0.5 rounded-sm">
                {profile.nagrikId}
              </span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
