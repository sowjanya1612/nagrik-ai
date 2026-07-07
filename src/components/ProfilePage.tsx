import React, { useState } from 'react';
import { 
  ShieldCheck, Award, User, Compass, CheckCircle2, 
  MapPin, Landmark, ArrowRight, Download, RefreshCw, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { getTranslation } from '../translations';

interface ProfilePageProps {
  liteMode: boolean;
  profile: UserProfile;
  setProfile: (prof: UserProfile) => void;
  selectedLanguage: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  liteMode,
  profile,
  setProfile,
  selectedLanguage,
}) => {
  const [fullName, setFullName] = useState(profile.fullName || 'Sowjanya Saravanan');
  const [age, setAge] = useState(profile.age || 24);
  const [state, setState] = useState(profile.state || 'Tamil Nadu');
  const [income, setIncome] = useState(profile.income || 180000);
  const [occupation, setOccupation] = useState(profile.occupation || 'Education Counselor');
  const [category, setCategory] = useState(profile.category || 'OBC');
  const [gender, setGender] = useState(profile.gender || 'Female');
  const [isFarmer, setIsFarmer] = useState(profile.isFarmer || false);
  const [isStudent, setIsStudent] = useState(profile.isStudent || false);

  const [saving, setSaving] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const indianStates = [
    'Tamil Nadu', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Kerala', 
    'Maharashtra', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Gujarat', 
    'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Delhi'
  ];

  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      setProfile({
        nagrikId: profile.nagrikId,
        fullName,
        age: Number(age),
        state,
        income: Number(income),
        occupation,
        category,
        gender,
        isFarmer,
        isStudent,
      });
      setSaving(false);
    }, 600);
  };

  const handleDownloadCard = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b-2 border-primary-indigo/5 pb-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-primary-indigo dark:text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-primary-saffron" />
          <span>{getTranslation('profileHeader', selectedLanguage)}</span>
        </h2>
        <p className="text-xs text-primary-saffron font-black uppercase tracking-wider mt-0.5">
          {getTranslation('profileSub', selectedLanguage)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: Premium Virtual Nagrik Card */}
        <div className="space-y-6">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">{getTranslation('profileCardTitle', selectedLanguage)}</span>
          
          <div className={`rounded-3xl p-6 relative overflow-hidden aspect-[1.586/1] border-2 transition-all ${
            liteMode
              ? 'border-4 border-black bg-white text-black'
              : 'bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950 text-slate-100 border-primary-indigo/10 shadow-xl shadow-primary-indigo/10 glow-saffron-strong'
          }`}>
            
            {/* National motif overlay */}
            {!liteMode && (
              <>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-saffron/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <div className="absolute right-6 bottom-6 w-20 h-20 opacity-5 border border-slate-500 rounded-full flex items-center justify-center font-mono text-[6px]">
                  <span>SATYAMEVA JAYATE</span>
                </div>
              </>
            )}

            <div className="h-full flex flex-col justify-between relative z-10">
              
              {/* Card Top Header */}
              <div className="flex justify-between items-start border-b border-slate-800/60 pb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg bg-primary-saffron text-slate-950 flex items-center justify-center font-black text-sm ${
                    liteMode ? 'border border-black bg-none text-black' : ''
                  }`}>
                    🇮🇳
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm tracking-tight uppercase">{getTranslation('govtBharat', selectedLanguage)}</h4>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{getTranslation('nationalIdSys', selectedLanguage)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 font-black px-2 py-0.5 rounded-md border border-emerald-900/30 uppercase tracking-widest">
                    {getTranslation('activeCardBadge', selectedLanguage)}
                  </span>
                </div>
              </div>

              {/* Card Body Profile Details */}
              <div className="flex items-center space-x-4 py-4">
                {/* Photo mock */}
                <div className={`w-16 h-20 rounded-lg flex items-center justify-center ${
                  liteMode ? 'border-2 border-black' : 'bg-slate-850 border border-slate-800'
                }`}>
                  <User className="w-8 h-8 text-slate-400" />
                </div>

                {/* Details list */}
                <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] sm:text-xs font-mono">
                  <div className="col-span-2">
                    <span className="text-[8px] text-slate-400 block uppercase font-black tracking-wider font-sans">{getTranslation('fullNameCard', selectedLanguage)}</span>
                    <span className="font-black text-slate-100 line-clamp-1 uppercase tracking-tight">{profile.fullName || 'Sowjanya Saravanan'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase font-black tracking-wider font-sans">{getTranslation('ageGenderCard', selectedLanguage)}</span>
                    <span className="font-black text-slate-100 uppercase tracking-tight">{profile.age || 24} / {profile.gender || 'F'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase font-black tracking-wider font-sans">{getTranslation('domicileCard', selectedLanguage)}</span>
                    <span className="font-black text-slate-100 uppercase tracking-tight">{profile.state || 'Tamil Nadu'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[8px] text-slate-400 block uppercase font-black tracking-wider font-sans">{getTranslation('occupationCard', selectedLanguage)}</span>
                    <span className="font-black text-slate-100 line-clamp-1 uppercase tracking-tight">{profile.occupation || 'Education Counselor'} ({profile.category || 'OBC'})</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="flex justify-between items-end border-t border-slate-800/60 pt-3 text-[10px]">
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase font-black tracking-wider font-sans">{getTranslation('idCardNo', selectedLanguage)}</span>
                  <span className="font-black text-primary-saffron font-mono tracking-widest">{profile.nagrikId}</span>
                </div>
                
                <div className="text-right text-[8px] text-slate-500 font-black tracking-widest uppercase italic">
                  {getTranslation('mottoCard', selectedLanguage)}
                </div>
              </div>

            </div>
          </div>

          {/* Card Download Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDownloadCard}
              className={`flex items-center space-x-1.5 text-xs px-4 py-2.5 rounded-xl font-black uppercase tracking-wider transition-all border-2 ${
                liteMode
                  ? 'border-black text-black hover:bg-slate-100 bg-white'
                  : 'bg-white hover:bg-primary-indigo hover:text-white text-primary-indigo dark:bg-slate-800 dark:text-orange-400 dark:border-slate-700 border-primary-indigo/10'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{getTranslation('btnDownloadCard', selectedLanguage)}</span>
            </button>
          </div>

          {/* Success message popup */}
          <AnimatePresence>
            {downloadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 rounded-lg bg-emerald-100 text-emerald-800 border-2 border-emerald-200 text-xs text-center font-black uppercase tracking-wide"
              >
                {getTranslation('cardSavedSuccess', selectedLanguage)}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: Interactive profile Editor form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-primary-indigo/5 shadow-md">
          <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
            
            <div className="border-b-2 border-primary-indigo/5 pb-3 mb-4">
              <h3 className="font-black text-sm sm:text-base text-primary-indigo dark:text-slate-100 uppercase tracking-tight">{getTranslation('configureVariables', selectedLanguage)}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{getTranslation('configureVariablesSub', selectedLanguage)}</p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase block tracking-widest">{getTranslation('citizenName', selectedLanguage)}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full py-3 px-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 focus:border-primary-indigo focus:outline-hidden font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase block tracking-widest">{getTranslation('ageYears', selectedLanguage)}</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full py-3 px-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 focus:border-primary-indigo focus:outline-hidden font-bold"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase block tracking-widest">{getTranslation('genderLabel', selectedLanguage)}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 focus:border-primary-indigo focus:outline-hidden font-bold"
                >
                  <option value="Female">{getTranslation('female', selectedLanguage)}</option>
                  <option value="Male">{getTranslation('male', selectedLanguage)}</option>
                  <option value="Other">{getTranslation('otherGender', selectedLanguage)}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Domicile State */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase block tracking-widest">{getTranslation('domicileState', selectedLanguage)}</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 focus:border-primary-indigo focus:outline-hidden font-bold"
                >
                  {indianStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Caste Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase block tracking-widest">{getTranslation('categoryQuotas', selectedLanguage)}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 focus:border-primary-indigo focus:outline-hidden font-bold"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Annual Income */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase block tracking-widest">{getTranslation('annualIncome', selectedLanguage)}</label>
                <input
                  type="number"
                  required
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full py-3 px-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 focus:border-primary-indigo focus:outline-hidden font-bold"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase block tracking-widest">{getTranslation('occupationLabel', selectedLanguage)}</label>
                <input
                  type="text"
                  required
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border-2 border-primary-indigo/5 focus:border-primary-indigo focus:outline-hidden font-bold"
                />
              </div>
            </div>

            {/* Checkbox fields */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={isFarmer}
                  onChange={(e) => setIsFarmer(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-md border-slate-300 text-primary-indigo focus:ring-primary-indigo"
                />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{getTranslation('isFarmerLabel', selectedLanguage)}</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-md border-slate-300 text-primary-indigo focus:ring-primary-indigo"
                />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{getTranslation('isStudentLabel', selectedLanguage)}</span>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-linear-to-tr from-primary-indigo to-indigo-900 hover:opacity-90 disabled:bg-slate-300 text-white font-black rounded-xl text-center text-sm transition-all flex items-center justify-center space-x-2 uppercase tracking-wider shadow-md"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>{getTranslation('btnSaving', selectedLanguage)}</span>
                  </>
                ) : (
                  <span>{getTranslation('btnSaveProfile', selectedLanguage)}</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
