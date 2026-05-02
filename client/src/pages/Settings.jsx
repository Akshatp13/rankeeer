import { useContext, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ThemeContext } from '../context/ThemeContext';
import { 
  Moon, Sun, Palette, BookOpen, ChevronRight, 
  Settings as SettingsIcon, Monitor, Zap, Sparkles,
  Command, Cpu, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/FuturisticButton';
import ExamCatalog, { EXAMS } from './ExamCatalog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

const Settings = () => {
  const { themeMode, setThemeMode, themeColor, setThemeColor } = useContext(ThemeContext);
  const { user } = useSelector(s => s.auth);
  const [showExamModal, setShowExamModal] = useState(false);
  const [toast, setToast] = useState('');

  const currentExam = EXAMS.find(e => e.id === user?.selectedExam);

  const handleExamSaved = () => {
    setToast('Settings saved successfully');
    setTimeout(() => setToast(''), 3000);
  };

  const colors = [
    { id: 'blue', name: 'Royal Blue', hex: '#2563eb' },
    { id: 'red', name: 'Classic Red', hex: '#dc2626' },
    { id: 'navy', name: 'Navy Blue', hex: '#1e3a8a' },
    { id: 'emerald', name: 'Forest Green', hex: '#059669' },
    { id: 'purple', name: 'Modern Purple', hex: '#7c3aed' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <Sidebar />
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                 <SettingsIcon className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your account and interface preferences</p>
              </div>
            </motion.div>
            
            <div className="space-y-6">
              {/* Appearance Section */}
              <motion.div variants={itemVariants} className="card p-8">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Monitor className="text-primary" size={18} />
                  Appearance Mode
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'light', label: 'Light Mode', icon: <Sun size={24} /> },
                    { id: 'dark', label: 'Dark Mode', icon: <Moon size={24} /> },
                  ].map(mode => (
                    <button 
                      key={mode.id}
                      onClick={() => setThemeMode(mode.id)}
                      className={`group relative p-6 rounded-xl border transition-all flex items-center gap-4 ${
                        themeMode === mode.id 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${themeMode === mode.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {mode.icon}
                      </div>
                      <span className={`font-semibold ${themeMode === mode.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {mode.label}
                      </span>
                      {themeMode === mode.id && (
                        <CheckCircle2 size={20} className="ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Theme Colors Section */}
              <motion.div variants={itemVariants} className="card p-8">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Palette className="text-primary" size={18} />
                  Brand Accent Color
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setThemeColor(c.id)}
                      className={`group flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                        themeColor === c.id 
                        ? 'bg-primary/[0.03] border-primary' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-full shadow-sm transition-transform group-hover:scale-110 ${themeColor === c.id ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-900' : ''}`}
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className={`text-[11px] font-bold ${themeColor === c.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Exam Preference Section */}
              <motion.div variants={itemVariants} className="card p-8">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Command className="text-primary" size={18} />
                  Exam Preference
                </h2>
                
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl gap-6">
                  <div className="flex items-center gap-6">
                    {currentExam ? (
                      <>
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${currentExam.color} flex items-center justify-center shadow-lg shrink-0`}>
                          <currentExam.icon size={32} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{currentExam.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-bold uppercase">{currentExam.category}</span>
                            {currentExam.desc}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-500">
                        <Zap size={20} />
                        <p className="text-sm font-semibold">No exam selected yet</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowExamModal(true)}
                    className="whitespace-nowrap"
                  >
                    Change Exam <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </motion.div>

              {/* System Info */}
              <motion.div variants={itemVariants} className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                   <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Premium Account Active</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">Your subscription will renew on June 12, 2024.</p>
                   </div>
                </div>
                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Manage Subscription</button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Exam picker modal */}
      <AnimatePresence>
        {showExamModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-hidden" 
            onClick={() => setShowExamModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" 
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowExamModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                 <XCircle size={28} />
              </button>
              <ExamCatalog isModal onClose={() => setShowExamModal(false)} onSaved={handleExamSaved} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full text-sm font-semibold shadow-xl z-[100] flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-500" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const XCircle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default Settings;
