import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Send, Sparkles, AlertCircle, FileText, CheckCircle2, 
  HelpCircle, ChevronRight, UserCheck, RefreshCw, Undo2, Award, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Scheme } from '../types';
import { getTranslation } from '../translations';

interface SchemeMatcherProps {
  liteMode: boolean;
  profile: UserProfile;
  setProfile: (prof: UserProfile) => void;
  schemes: Scheme[];
  onViewScheme: (scheme: Scheme) => void;
  selectedLanguage: string;
}

export const SchemeMatcher: React.FC<SchemeMatcherProps> = ({
  liteMode,
  profile,
  setProfile,
  schemes,
  onViewScheme,
  selectedLanguage,
}) => {
  const [onboardHistory, setOnboardHistory] = useState<Array<{ id: string; sender: 'user' | 'assistant'; text: string }>>([
    {
      id: 'onboard-welcome',
      sender: 'assistant',
      text: getTranslation('chatInitialGreeting', selectedLanguage),
    },
  ]);

  // Update initial message when language changes
  useEffect(() => {
    setOnboardHistory(prev => {
      if (prev.length === 1 && prev[0].id === 'onboard-welcome') {
        return [{
          ...prev[0],
          text: getTranslation('chatInitialGreeting', selectedLanguage),
        }];
      }
      return prev;
    });
  }, [selectedLanguage]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchingResults, setMatchingResults] = useState<Array<{ schemeId: string; reason: string; confidence: number }>>([]);
  const [viewState, setViewState] = useState<'onboarding' | 'results'>('onboarding');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [onboardHistory, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user' as const,
      text: text,
    };

    setOnboardHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/schemes/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: onboardHistory.concat(userMsg).map(h => ({ sender: h.sender, text: h.text })),
          currentProfile: profile,
        }),
      });

      if (!response.ok) {
        throw new Error('Onboarding service unreachable.');
      }

      const data = await response.json();

      // Update virtual profile on side
      if (data.capturedProfile) {
        setProfile(data.capturedProfile);
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'assistant' as const,
        text: data.text,
      };

      setOnboardHistory(prev => [...prev, aiMsg]);

      // If Gemini returned matched results, trigger results display
      if (data.type === 'results' && data.matches && data.matches.length > 0) {
        setMatchingResults(data.matches);
        setViewState('results');
      }

    } catch (err) {
      console.error(err);
      setOnboardHistory(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I was unable to analyze your profile details. Let me load standard matches for your location. Please check your API key in Settings.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOnboardHistory([
      {
        id: 'onboard-welcome',
        sender: 'assistant',
        text: getTranslation('chatInitialGreeting', selectedLanguage),
      },
    ]);
    setProfile({
      nagrikId: `NAG-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: '',
      age: 0,
      state: '',
      income: 0,
      occupation: '',
      category: 'General',
      gender: '',
      isFarmer: false,
      isStudent: false,
    });
    setMatchingResults([]);
    setViewState('onboarding');
  };

  // Quick inputs for demographic options to ease chat typing
  const getOnboardingSuggestions = () => {
    const lastMsg = onboardHistory[onboardHistory.length - 1]?.text || '';
    const lower = lastMsg.toLowerCase();
    
    if (lower.includes('state') || lower.includes('from?')) {
      return ['Tamil Nadu', 'Karnataka', 'Telangana', 'Kerala', 'Maharashtra'];
    }
    if (lower.includes('income')) {
      return ['₹50,000 per year', '₹1.5 Lakhs per year', '₹3 Lakhs per year', '₹6 Lakhs per year'];
    }
    if (lower.includes('occupation') || lower.includes('work')) {
      return ['Farmer / Agriculture', 'Business Owner', 'Student', 'Homemaker', 'Daily Wage Laborer'];
    }
    if (lower.includes('category') || lower.includes('caste')) {
      return ['General', 'OBC', 'SC', 'ST', 'EWS (Economical)'];
    }
    if (lower.includes('gender')) {
      return ['Female', 'Male', 'Other'];
    }
    if (lower.includes('age')) {
      return ['19 years', '25 years', '42 years', '65 years'];
    }
    return [];
  };

  const suggs = getOnboardingSuggestions();

  return (
    <div className="space-y-6">
      
      {/* Dynamic Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-primary-indigo/10 pb-4 gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-primary-indigo dark:text-slate-100 flex items-center space-x-2">
            <Compass className="w-6 h-6 text-primary-saffron" />
            <span>{getTranslation('matcherHeader', selectedLanguage)}</span>
          </h2>
          <p className="text-xs text-primary-saffron font-black uppercase tracking-wider mt-0.5">
            {getTranslation('matcherSub', selectedLanguage)}
          </p>
        </div>

        {viewState === 'results' && (
          <button
            onClick={handleReset}
            className={`text-xs px-4 py-2 font-black uppercase tracking-wider rounded-xl border-2 inline-flex items-center space-x-1.5 transition-all ${
              liteMode
                ? 'border-black bg-white text-black hover:bg-slate-100'
                : 'bg-white border-primary-indigo/10 text-primary-indigo hover:bg-primary-indigo hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{getTranslation('btnSaveProfile', selectedLanguage)}</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* 1. ONBOARDING CHAT & EXTRACTOR SPLIT VIEW */}
        {viewState === 'onboarding' && (
          <motion.div
            key="onboarding-view"
            initial={liteMode ? {} : { opacity: 0, scale: 0.98 }}
            animate={liteMode ? {} : { opacity: 1, scale: 1 }}
            exit={liteMode ? {} : { opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
          >
            
            {/* Left Column: WhatsApp conversational flow */}
            <div className="lg:col-span-2 flex flex-col h-[520px] rounded-2xl border-2 border-primary-indigo/10 overflow-hidden bg-white dark:bg-slate-900 shadow-md">
              
              {/* Mini Assistant Info Bar */}
              <div className="bg-primary-indigo text-white p-3.5 flex justify-between items-center text-xs font-black uppercase tracking-wider dark:bg-slate-950 dark:border-b dark:border-slate-800">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-saffron animate-pulse"></span>
                  <span>{getTranslation('chatHeader', selectedLanguage)}</span>
                </span>
                <span className="text-primary-saffron">Turn {onboardHistory.length}</span>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {onboardHistory.map((h) => (
                  <div
                    key={h.id}
                    className={`flex ${h.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed border ${
                      h.sender === 'user'
                        ? liteMode
                          ? 'bg-slate-100 border-2 border-black text-black'
                          : 'bg-gradient-to-br from-primary-indigo to-indigo-950 text-slate-100 rounded-tr-none border-indigo-950/20 shadow-sm font-bold'
                        : liteMode
                        ? 'bg-white border-2 border-black text-black'
                        : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border-2 border-primary-indigo/5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] font-bold'
                    }`}>
                      <p className="whitespace-pre-wrap">{h.text}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-primary-saffron/10 border border-primary-saffron/20 rounded-xl text-xs text-primary-saffron font-black uppercase tracking-widest animate-pulse flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-primary-saffron animate-spin" />
                      <span>{getTranslation('btnSaving', selectedLanguage)}</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions Helper Bar */}
              {suggs.length > 0 && (
                <div className="p-2 border-t border-primary-indigo/5 bg-slate-50 dark:bg-slate-950/20 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-primary-indigo dark:text-slate-400 font-black uppercase tracking-widest pl-1">{getTranslation('exploreSolutions', selectedLanguage)}:</span>
                  {suggs.map((sg, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(sg);
                        handleSend(sg);
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-full border-2 font-black uppercase tracking-wider transition-all ${
                        liteMode
                          ? 'border-black hover:bg-slate-200 text-black bg-white'
                          : 'bg-white dark:bg-slate-800 hover:bg-primary-indigo hover:text-white text-primary-indigo dark:text-slate-300 border-primary-indigo/10'
                      }`}
                    >
                      {sg}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Control */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 border-t border-primary-indigo/10 bg-white dark:bg-slate-950/50 flex space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getTranslation('chatPlaceholder', selectedLanguage)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm bg-white dark:bg-slate-800 border-2 border-primary-indigo/10 focus:border-primary-indigo focus:outline-hidden dark:text-slate-100 font-bold"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-5 py-3 bg-linear-to-tr from-primary-saffron to-primary-vermilion hover:scale-102 text-slate-950 font-black rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

            {/* Right Column: Dynamic Profile Card Extractor */}
            <div className={`rounded-2xl p-6 border-2 flex flex-col justify-between shadow-md ${
              liteMode
                ? 'border-2 border-black bg-white text-black'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-primary-indigo/10'
            }`}>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b-2 border-primary-indigo/5 pb-3">
                  <UserCheck className="w-5 h-5 text-primary-saffron" />
                  <div>
                    <h3 className="font-black text-primary-indigo dark:text-slate-100 uppercase tracking-tight text-sm sm:text-base">{getTranslation('configureVariables', selectedLanguage)}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{getTranslation('configureVariablesSub', selectedLanguage)}</p>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('nagrikIdLabel', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100">{profile.nagrikId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('citizenName', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100 uppercase">{profile.fullName || '---'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('ageYears', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100">{profile.age ? `${profile.age} Yrs` : '---'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('domicileState', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100 uppercase">{profile.state || '---'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('annualIncome', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100">
                      {profile.income ? `₹${profile.income.toLocaleString()}` : '---'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('occupationLabel', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100 uppercase">{profile.occupation || '---'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('categoryQuotas', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100 uppercase">{profile.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-indigo/5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('genderLabel', selectedLanguage)}:</span>
                    <span className="font-black text-primary-indigo dark:text-slate-100 uppercase">{profile.gender || '---'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400 font-black uppercase tracking-wide">{getTranslation('isFarmerLabel', selectedLanguage)}:</span>
                    <span className={`font-black px-2 py-0.5 rounded-lg text-[10px] uppercase ${profile.isFarmer ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                      {profile.isFarmer ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informational tip */}
              <div className="p-4 bg-primary-indigo/5 border border-primary-indigo/10 rounded-xl mt-6 text-xs text-primary-indigo dark:text-indigo-300 font-bold leading-relaxed">
                <span className="font-black uppercase tracking-wider block mb-1 text-primary-saffron">{getTranslation('preferredLanguage', selectedLanguage)}:</span>
                {getTranslation('designedWithLove', selectedLanguage)}
              </div>

            </div>

          </motion.div>
        )}

        {/* 2. MATCHED RESULTS VIEW */}
        {viewState === 'results' && (
          <motion.div
            key="results-view"
            initial={liteMode ? {} : { opacity: 0, y: 15 }}
            animate={liteMode ? {} : { opacity: 1, y: 0 }}
            exit={liteMode ? {} : { opacity: 0, y: 15 }}
            className="space-y-6"
          >
            
            {/* Disclaimer Banner */}
            <div className="p-4 rounded-xl bg-primary-saffron/10 text-slate-800 dark:text-slate-200 border-2 border-primary-saffron/20 text-xs flex items-center space-x-2 font-bold leading-relaxed shadow-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-primary-saffron" />
              <p>
                <strong>{getTranslation('brandName', selectedLanguage)} Disclaimer:</strong> {getTranslation('nationalPolicy', selectedLanguage)}
              </p>
            </div>

            {/* Matching Stats */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-primary-indigo/5 shadow-xs">
              <div className="text-xs">
                <span className="text-slate-400 block uppercase tracking-wider font-black">{getTranslation('fullNameCard', selectedLanguage)}</span>
                <span className="font-black text-primary-indigo dark:text-slate-200 text-sm uppercase">{profile.fullName || 'Citizen Partner'}</span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-400 block uppercase tracking-wider font-black">{getTranslation('profileCardTitle', selectedLanguage)}</span>
                <span className="font-black text-primary-vermilion text-base uppercase">{matchingResults.length} {getTranslation('statsMatched', selectedLanguage)}</span>
              </div>
            </div>

            {/* Match Cards List */}
            <div className="space-y-6">
              {matchingResults.map((match, index) => {
                const scheme = schemes.find(s => s.id === match.schemeId);
                if (!scheme) return null;

                return (
                  <motion.div
                    key={scheme.id}
                    initial={liteMode ? {} : { opacity: 0, y: 10 }}
                    animate={liteMode ? {} : { opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-2xl p-6 border-2 relative transition-all ${
                      liteMode
                        ? 'border-2 border-black bg-white text-black'
                        : 'bg-white dark:bg-slate-900 border-primary-indigo/5 hover:border-primary-saffron/40 hover:shadow-lg'
                    }`}
                  >
                    
                    {/* Badge header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-primary-indigo/5 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{scheme.ministry}</span>
                        <h3 className="text-lg font-black text-primary-indigo dark:text-slate-100 uppercase tracking-tight mt-0.5">
                          {scheme.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Match Confidence Badge */}
                        <div className="px-3.5 py-1.5 rounded-full text-xs font-black inline-flex items-center space-x-1.5 bg-primary-saffron/10 text-primary-saffron border border-primary-saffron/25">
                          <Award className="w-3.5 h-3.5" />
                          <span>{match.confidence}% {getTranslation('readyText', selectedLanguage)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Matching Reason / Explanation */}
                    <div className="space-y-4">
                      
                      {/* Sathi's Explanation */}
                      <div className="p-4 bg-primary-saffron/5 rounded-xl border border-primary-saffron/15 text-xs sm:text-sm">
                        <span className="text-[10px] font-black text-primary-saffron uppercase tracking-widest block mb-1">{getTranslation('aiFeedbackTitle', selectedLanguage)}:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                          {match.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Benefits list */}
                        <div>
                          <span className="text-primary-indigo dark:text-slate-400 font-black uppercase tracking-wider block mb-2">{getTranslation('submitNoteTitle', selectedLanguage)}:</span>
                          <ul className="space-y-1.5">
                            {scheme.benefits.map((b, i) => (
                              <li key={i} className="flex items-start space-x-1.5 font-bold text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Documents needed list */}
                        <div>
                          <span className="text-primary-indigo dark:text-slate-400 font-black uppercase tracking-wider block mb-2">{getTranslation('checklistFor', selectedLanguage)}:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {scheme.requiredDocs.map((doc, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-primary-indigo/5 dark:bg-slate-800 text-primary-indigo dark:text-slate-300 rounded-lg text-[10px] font-black border border-primary-indigo/10 uppercase"
                              >
                                📋 {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Action buttons on card */}
                    <div className="mt-6 pt-4 border-t-2 border-primary-indigo/5 flex justify-between items-center gap-2">
                      <button
                        onClick={() => onViewScheme(scheme)}
                        className="text-xs font-black uppercase tracking-wider text-primary-saffron hover:text-primary-vermilion flex items-center space-x-1"
                      >
                        <span>{getTranslation('viewProspectus', selectedLanguage)}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      
                      <a
                        href={scheme.officialLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-black uppercase tracking-wider text-primary-indigo dark:text-indigo-400 hover:underline flex items-center space-x-1"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
