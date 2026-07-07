import React from 'react';
import { Sunset, MessageSquareText, Compass, Camera, FileCheck, Landmark, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { getTranslation } from '../translations';

interface LandingPageProps {
  liteMode: boolean;
  profile: UserProfile;
  setCurrentTab: (tab: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  liteMode,
  profile,
  setCurrentTab,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  
  // Festive/season aware greeting based on local time (July is beautiful Monsoon in India!)
  const getMonsoonGreeting = () => {
    return {
      subTitle: getTranslation('monsoonTitle', selectedLanguage),
      greeting: getTranslation('monsoonGreeting', selectedLanguage),
      note: getTranslation('monsoonNote', selectedLanguage)
    };
  };

  const info = getMonsoonGreeting();

  const bentoItems = [
    {
      id: 'chat',
      title: getTranslation('chatHeader', selectedLanguage),
      desc: getTranslation('chatSub', selectedLanguage),
      icon: MessageSquareText,
      color: 'from-amber-500 to-orange-500',
      badge: 'Bilingual / Voice',
      actionText: getTranslation('heroButtonChat', selectedLanguage)
    },
    {
      id: 'matcher',
      title: getTranslation('matcherHeader', selectedLanguage),
      desc: getTranslation('matcherSub', selectedLanguage),
      icon: Compass,
      color: 'from-orange-500 to-red-500',
      badge: 'Signature Feature',
      actionText: getTranslation('heroButtonMatch', selectedLanguage)
    },
    {
      id: 'complaint',
      title: getTranslation('reportHeader', selectedLanguage),
      desc: getTranslation('reportSub', selectedLanguage),
      icon: Camera,
      color: 'from-indigo-500 to-blue-500',
      badge: 'Vision & Proximity Match',
      actionText: 'File a Report'
    },
    {
      id: 'document',
      title: getTranslation('docHeader', selectedLanguage),
      desc: getTranslation('docSub', selectedLanguage),
      icon: FileCheck,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Vision Scanner',
      actionText: getTranslation('scanBtn', selectedLanguage)
    },
    {
      id: 'dashboard',
      title: getTranslation('transparencyHeader', selectedLanguage),
      desc: getTranslation('transparencySub', selectedLanguage),
      icon: Landmark,
      color: 'from-purple-500 to-indigo-500',
      badge: 'No Login Required',
      actionText: 'View Public Ledger'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Cultural Header Greeting Banner */}
      {!liteMode && (
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border-2 border-primary-indigo/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary-indigo/5 flex items-center justify-center text-primary-saffron animate-pulse border border-primary-indigo/10">
              <Sunset className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-primary-saffron uppercase tracking-widest">{info.subTitle}</span>
              <h2 className="text-xl font-black text-primary-indigo dark:text-slate-100 uppercase tracking-tighter mt-0.5">{info.greeting}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">{info.note}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span>{getTranslation('preferredLanguage', selectedLanguage)}</span>
            <div className="flex gap-1.5">
              <button onClick={() => setSelectedLanguage('Hindi')} className="px-3 py-1 bg-white dark:bg-slate-800 border-2 border-primary-indigo/10 rounded-lg text-xs hover:bg-primary-indigo hover:text-white hover:border-primary-indigo text-primary-indigo dark:text-slate-200 font-black transition-colors uppercase">हिन्दी</button>
              <button onClick={() => setSelectedLanguage('Tamil')} className="px-3 py-1 bg-white dark:bg-slate-800 border-2 border-primary-indigo/10 rounded-lg text-xs hover:bg-primary-indigo hover:text-white hover:border-primary-indigo text-primary-indigo dark:text-slate-200 font-black transition-colors uppercase">தமிழ்</button>
              <button onClick={() => setSelectedLanguage('Telugu')} className="px-3 py-1 bg-white dark:bg-slate-800 border-2 border-primary-indigo/10 rounded-lg text-xs hover:bg-primary-indigo hover:text-white hover:border-primary-indigo text-primary-indigo dark:text-slate-200 font-black transition-colors uppercase">తెలుగు</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Hero Banner */}
      <div className={`rounded-3xl p-8 sm:p-12 relative overflow-hidden ${
        liteMode
          ? 'border-4 border-black bg-white text-black'
          : 'bg-gradient-to-br from-primary-indigo via-indigo-950 to-[#0D123F] text-slate-100 shadow-xl'
      }`}>
        
        {/* Cultural vector circles background for non-lite mode */}
        {!liteMode && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-saffron/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-vermilion/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </>
        )}

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-primary-saffron/20 text-primary-saffron px-3.5 py-1.5 rounded-full border border-primary-saffron/20 text-xs font-black uppercase tracking-widest">
            <Award className="w-4 h-4 text-primary-saffron" />
            <span>{getTranslation('heroBadge', selectedLanguage)}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] uppercase">
            {getTranslation('heroHeading', selectedLanguage)} <span className="text-primary-saffron">{getTranslation('heroHeadingSpan1', selectedLanguage)}</span> to the heart of <span className="text-primary-vermilion">{getTranslation('heroHeadingSpan2', selectedLanguage)}</span>.
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-bold">
            {getTranslation('heroSub', selectedLanguage)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => setCurrentTab('chat')}
              className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all transform hover:scale-[1.02] ${
                liteMode
                  ? 'bg-black text-white hover:bg-slate-800'
                  : 'bg-linear-to-tr from-primary-saffron to-primary-vermilion hover:shadow-lg hover:shadow-primary-saffron/20 text-slate-950'
              }`}
            >
              <MessageSquareText className="w-5 h-5 text-slate-950" />
              <span>{getTranslation('heroButtonChat', selectedLanguage)}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => setCurrentTab('matcher')}
              className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all border ${
                liteMode
                  ? 'border-black text-black hover:bg-slate-100'
                  : 'border-white/20 hover:bg-white/10 text-white'
              }`}
            >
              <Compass className="w-5 h-5 text-primary-saffron" />
              <span>{getTranslation('heroButtonMatch', selectedLanguage)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. National Impact Statistics Panel */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl ${
        liteMode ? 'border-2 border-black' : 'bg-white dark:bg-slate-900 border-2 border-primary-indigo/5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
      }`}>
        <div className="text-center p-2">
          <p className="text-3xl sm:text-4xl font-black text-primary-indigo dark:text-primary-saffron">12,430+</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider mt-1">{getTranslation('statsMatched', selectedLanguage)}</p>
        </div>
        <div className="text-center border-l-2 border-primary-indigo/5 p-2">
          <p className="text-3xl sm:text-4xl font-black text-primary-vermilion">94.8%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider mt-1">{getTranslation('statsResolution', selectedLanguage)}</p>
        </div>
        <div className="text-center border-l-2 border-primary-indigo/5 p-2">
          <p className="text-3xl sm:text-4xl font-black text-primary-indigo dark:text-primary-saffron">12 mins</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider mt-1">{getTranslation('statsResponse', selectedLanguage)}</p>
        </div>
        <div className="text-center border-l-2 border-primary-indigo/5 p-2">
          <p className="text-3xl sm:text-4xl font-black text-primary-vermilion">6+ Languages</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider mt-1">{getTranslation('statsLanguages', selectedLanguage)}</p>
        </div>
      </div>

      {/* 4. Bento Grid Modules Navigation */}
      <div>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-primary-indigo dark:text-slate-100 mb-6">
          {getTranslation('exploreSolutions', selectedLanguage)}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bentoItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`group cursor-pointer rounded-2xl p-6 transition-all duration-300 relative ${
                  liteMode
                    ? 'border-2 border-black hover:bg-slate-50'
                    : 'bg-white dark:bg-slate-900 border-2 border-primary-indigo/5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-lg hover:border-primary-saffron/40 hover:-translate-y-1'
                }`}
              >
                {/* Visual Icon Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-linear-to-br from-primary-indigo to-indigo-900 text-white ${
                    liteMode ? 'border border-black bg-none text-black rounded-none' : 'shadow-md shadow-indigo-900/10'
                  }`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    liteMode ? 'border border-black' : 'bg-primary-indigo/5 dark:bg-slate-800 text-primary-indigo dark:text-slate-300 border border-primary-indigo/10'
                  }`}>
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-black text-primary-indigo dark:text-slate-100 group-hover:text-primary-saffron uppercase tracking-tight transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-black uppercase tracking-wider text-primary-saffron group-hover:text-primary-vermilion space-x-1.5">
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
