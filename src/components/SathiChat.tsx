import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareText, Send, Sparkles, Volume2, VolumeX, Mic, MicOff, 
  HelpCircle, ChevronRight, RefreshCw, BookOpen, User, BookOpenText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, Scheme } from '../types';
import { getTranslation } from '../translations';

interface SathiChatProps {
  liteMode: boolean;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  schemes: Scheme[];
  onViewScheme: (scheme: Scheme) => void;
}

export const SathiChat: React.FC<SathiChatProps> = ({
  liteMode,
  selectedLanguage,
  setSelectedLanguage,
  schemes,
  onViewScheme,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sathi',
      text: getTranslation('chatInitialGreeting', selectedLanguage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Update initial message when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
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
  const [readingLevel, setReadingLevel] = useState<'Simple' | 'Standard' | 'Detailed'>('Standard');
  
  // Voice settings
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechObj) {
      const rec = new SpeechObj();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Set language code based on selected language
      const langCodes: Record<string, string> = {
        'English': 'en-IN',
        'Hindi': 'hi-IN',
        'Tamil': 'ta-IN',
        'Telugu': 'te-IN',
        'Bengali': 'bn-IN',
        'Kannada': 'kn-IN',
        'Marathi': 'mr-IN',
      };
      rec.lang = langCodes[selectedLanguage] || 'en-IN';

      rec.onresult = (e: any) => {
        const result = e.results[0][0].transcript;
        setInput(result);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [selectedLanguage]);

  // Handle Speech Recognition Trigger
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Handle Web Speech Synthesis Output
  const speakText = (textId: string, textContent: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        if (isSpeaking === textId) {
          setIsSpeaking(null);
          return;
        }
      }

      // Strip markdown block quotes, asterisks, brackets for clean TTS
      const cleanText = textContent
        .replace(/\*+/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/#+/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Attempt to map selected language to suitable Indian voice
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      
      const voiceLangCodes: Record<string, string> = {
        'English': 'en-IN',
        'Hindi': 'hi-IN',
        'Tamil': 'ta-IN',
        'Telugu': 'te-IN',
        'Bengali': 'bn-IN',
        'Kannada': 'kn-IN',
        'Marathi': 'mr-IN',
      };
      
      const targetLang = voiceLangCodes[selectedLanguage] || 'en-IN';
      const matchVoice = voices.find(v => v.lang.startsWith(targetLang));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(null);
      };

      setIsSpeaking(textId);
      synth.speak(utterance);
    } else {
      alert("Text to speech is not supported in this browser.");
    }
  };

  const handleSend = async (textToSend?: string) => {
    const rawMsg = textToSend || input;
    if (!rawMsg.trim() || loading) return;

    // Stop speaking if active
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/sathi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawMsg,
          chatHistory: messages.map(m => ({ sender: m.sender, text: m.text })),
          readingLevel,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('API server is not responding.');
      }

      const data = await response.json();
      
      const sathiMsg: ChatMessage = {
        id: `sathi-${Date.now()}`,
        sender: 'sathi',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        jargon: data.jargon || [],
      };

      setMessages(prev => [...prev, sathiMsg]);

      // Speak result automatically if voice is enabled and not in lite-mode
      if (voiceEnabled && !liteMode) {
        speakText(sathiMsg.id, sathiMsg.text);
      }

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        sender: 'sathi',
        text: "I experienced a slight network issue connecting to my central database. Please ensure your backend is active or double check your Secrets configuration! 🧡",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Jargon click handler
  const handleJargonExplain = (term: string, explanation: string) => {
    setInput(`Explain the word "${term}" to me like I am 5 years old.`);
  };

  // Quick suggestion clicks
  const suggestions = [
    { label: "🚜 Farmer ₹6k Scheme?", text: "Can you explain the PM-Kisan scheme and who can apply for it?" },
    { label: "🏥 Free ₹5 Lakh Medical?", text: "Tell me about Ayushman Bharat health insurance card eligibility." },
    { label: "👧 Girl Child SSY?", text: "What is Sukanya Samriddhi Yojana and how much interest does it give?" },
    { label: "💳 What is Smart Ration Card?", text: "How to apply for a smart ration card in Tamil Nadu and what documents are required?" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto rounded-2xl border border-orange-500/15 overflow-hidden shadow-lg bg-orange-50/20 dark:bg-slate-950">
      
      {/* 1. Sathi Chat Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
        liteMode ? 'border-2 border-black bg-white text-black' : 'bg-primary-indigo text-white dark:bg-slate-950 dark:border-slate-800/80'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full bg-linear-to-tr from-primary-saffron to-primary-vermilion flex items-center justify-center text-slate-950 ${
            liteMode ? 'border border-black bg-none text-black rounded-none' : 'shadow-md shadow-primary-saffron/25'
          }`}>
            <MessageSquareText className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-black uppercase tracking-tight text-sm sm:text-base text-white">{getTranslation('brandName', selectedLanguage)} Sathi</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System grounded"></span>
            </div>
            <p className="text-[10px] sm:text-xs text-primary-saffron font-black uppercase tracking-widest">{getTranslation('subBrand', selectedLanguage)}</p>
          </div>
        </div>

        {/* Level Controls & Settings */}
        <div className="flex items-center space-x-2">
          
          {/* Reading Level Selector */}
          <div className="flex items-center space-x-1 bg-white/10 dark:bg-slate-900 p-1 rounded-xl border border-white/15 dark:border-slate-800">
            <span className="text-[10px] text-white/60 dark:text-slate-400 font-black uppercase tracking-wider px-1.5 hidden sm:inline">{getTranslation('liteMode', selectedLanguage)}:</span>
            {(['Simple', 'Standard', 'Detailed'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setReadingLevel(level)}
                className={`text-[10px] px-2.5 py-1 font-black rounded-lg transition-colors uppercase tracking-wider ${
                  readingLevel === level
                    ? 'bg-primary-saffron text-slate-950'
                    : 'text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Voice Output auto-read Toggle */}
          {!liteMode && (
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                voiceEnabled ? 'bg-primary-saffron/20 text-primary-saffron border-primary-saffron/30' : 'bg-white/10 text-white/50 border-white/10 dark:bg-slate-800'
              }`}
              title="Toggle Auto Read Aloud"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

        </div>
      </div>

      {/* 2. Chat Window Scroll Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
        liteMode ? 'bg-white' : 'bg-cream-bg dark:bg-slate-950/20 bg-radial'
      }`} style={{ backgroundImage: !liteMode ? 'radial-gradient(circle, #1A237E06 1.5px, transparent 1.5px)' : 'none', backgroundSize: '24px 24px' }}>
        
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={liteMode ? {} : { opacity: 0, y: 10, scale: 0.98 }}
              animate={liteMode ? {} : { opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm relative border ${
                msg.sender === 'user'
                  ? liteMode
                    ? 'bg-slate-100 border-2 border-black text-black'
                    : 'bg-gradient-to-br from-primary-indigo to-indigo-950 text-slate-100 border-indigo-950/20 rounded-tr-none shadow-md'
                  : liteMode
                  ? 'bg-white border-2 border-black text-black'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-tl-none'
              }`}>
                
                {/* Voice button on each message */}
                {!liteMode && msg.sender === 'sathi' && (
                  <button
                    onClick={() => speakText(msg.id, msg.text)}
                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary-saffron transition-colors"
                    title="Read Aloud"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeaking === msg.id ? 'text-primary-saffron animate-bounce' : ''}`} />
                  </button>
                )}

                {/* Message Body */}
                <div className="text-sm leading-relaxed pr-6 whitespace-pre-line font-bold">
                  {msg.text}
                </div>

                {/* Citation Pill Tags */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Source Grounding:</span>
                    {msg.citations.map((citeId) => {
                      const found = schemes.find(s => s.id === citeId);
                      return (
                        <button
                          key={citeId}
                          onClick={() => found && onViewScheme(found)}
                          className="text-[10px] font-black bg-primary-saffron/10 text-primary-saffron dark:bg-primary-saffron/20 dark:text-primary-saffron px-2.5 py-0.5 rounded-lg hover:bg-primary-saffron hover:text-slate-950 dark:hover:bg-primary-saffron transition-colors inline-flex items-center space-x-1 border border-primary-saffron/10"
                        >
                          <span>📜 {found ? found.name.split(' (')[0] : citeId}</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Jargon Explainer Block */}
                {msg.jargon && msg.jargon.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-primary-saffron/5 dark:bg-primary-saffron/10 border border-primary-saffron/15 space-y-1.5">
                    <div className="flex items-center space-x-1 text-[10px] font-black text-primary-saffron uppercase tracking-widest">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Sathi Jargon Helper: Explain like I'm new</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      {msg.jargon.map((j, idx) => (
                        <div key={idx} className="text-xs">
                          <button
                            onClick={() => handleJargonExplain(j.term, j.explanation)}
                            className="font-black text-primary-indigo dark:text-primary-saffron underline hover:text-primary-vermilion text-left text-xs mr-1 uppercase tracking-tight"
                          >
                            {j.term}
                          </button>
                          <span className="text-slate-600 dark:text-slate-400 font-bold">
                            : {j.explanation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[9px] text-slate-400 dark:text-slate-500 block text-right mt-1.5 font-bold">
                  {msg.timestamp}
                </span>

              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={`rounded-2xl p-4 ${
                liteMode ? 'border border-black bg-white text-black' : 'bg-white dark:bg-slate-900 border border-slate-250/20 text-slate-500'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-saffron animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-saffron animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-saffron animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1.5">{getTranslation('btnSaving', selectedLanguage)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Suggestions Grid */}
      <div className={`p-3 border-t flex flex-wrap gap-2 items-center justify-start ${
        liteMode ? 'border-2 border-black bg-slate-50' : 'bg-white border-primary-indigo/5 dark:bg-slate-900/30 border-t border-primary-indigo/5'
      }`}>
        <span className="text-[10px] text-primary-indigo dark:text-slate-400 font-black uppercase tracking-widest block w-full md:w-auto mr-2">{getTranslation('exploreSolutions', selectedLanguage)}:</span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(s.text);
              handleSend(s.text);
            }}
            className={`text-xs px-3.5 py-1.5 rounded-full border-2 text-left font-black transition-all uppercase tracking-wider ${
              liteMode
                ? 'border-black hover:bg-slate-200 text-black'
                : 'bg-white hover:bg-primary-indigo hover:text-white text-primary-indigo dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 border-primary-indigo/10 hover:border-primary-indigo'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Control */}
      <div className={`p-4 border-t ${
        liteMode ? 'border-2 border-black bg-white' : 'bg-white dark:bg-slate-950 border-t border-primary-indigo/10'
      }`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          
          {/* Micro Voice input */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3.5 rounded-xl transition-all border-2 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse border-red-600'
                : liteMode
                ? 'border-black text-black hover:bg-slate-100'
                : 'bg-primary-indigo/5 hover:bg-primary-indigo hover:text-white border-primary-indigo/10 text-primary-indigo'
            }`}
            title="Speech Voice Input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : getTranslation('chatPlaceholder', selectedLanguage)}
            className={`flex-1 py-3.5 px-4 rounded-xl text-sm transition-all focus:outline-hidden ${
              liteMode
                ? 'border-2 border-black bg-white text-black'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-2 border-primary-indigo/10 focus:border-primary-indigo focus:ring-1 focus:ring-primary-indigo font-bold'
            }`}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-3.5 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center ${
              !input.trim() || loading
                ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800'
                : liteMode
                ? 'bg-black text-white border-2 border-black'
                : 'bg-linear-to-tr from-primary-saffron to-primary-vermilion hover:scale-105 shadow-md shadow-primary-saffron/20 text-slate-950'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
