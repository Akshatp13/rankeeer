import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedExam } from '../redux/authSlice';
import api from '../utils/api';
import {
  FlaskConical, HeartPulse, Landmark, TrendingUp, Cpu,
  Shield, Briefcase, Scale, GraduationCap, Train, Building2, Calculator, CheckCircle2, ArrowRight,
  Globe, Sparkles, Zap, Activity, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FuturisticButton from '../components/FuturisticButton';

export const EXAMS = [
  { id: 'jee', name: 'JEE Main & Advanced', category: 'Engineering', desc: 'IIT/NIT entrance', icon: FlaskConical, color: 'from-blue-500 to-cyan-400' },
  { id: 'neet', name: 'NEET', category: 'Medical', desc: 'MBBS/BDS entrance', icon: HeartPulse, color: 'from-red-500 to-pink-400' },
  { id: 'upsc', name: 'UPSC CSE', category: 'Government', desc: 'Civil services', icon: Landmark, color: 'from-amber-500 to-yellow-400' },
  { id: 'cat', name: 'CAT', category: 'MBA', desc: 'IIM entrance', icon: TrendingUp, color: 'from-purple-500 to-violet-400' },
  { id: 'gate', name: 'GATE', category: 'Engineering PG', desc: 'PSU/M.Tech', icon: Cpu, color: 'from-emerald-500 to-green-400' },
  { id: 'nda', name: 'NDA', category: 'Defence', desc: 'Army/Navy/Air Force', icon: Shield, color: 'from-slate-500 to-gray-400' },
  { id: 'ssc', name: 'SSC CGL', category: 'Government', desc: 'Staff selection', icon: Briefcase, color: 'from-orange-500 to-amber-400' },
  { id: 'clat', name: 'CLAT', category: 'Law', desc: 'Law school entrance', icon: Scale, color: 'from-teal-500 to-cyan-400' },
  { id: 'cuet', name: 'CUET', category: 'University', desc: 'Central university entrance', icon: GraduationCap, color: 'from-indigo-500 to-blue-400' },
  { id: 'rrb', name: 'RRB/NTPC', category: 'Railway', desc: 'Railway recruitment', icon: Train, color: 'from-sky-500 to-blue-400' },
  { id: 'ibps', name: 'IBPS/SBI', category: 'Banking', desc: 'Bank PO/Clerk', icon: Building2, color: 'from-green-500 to-emerald-400' },
  { id: 'ca', name: 'CA Foundation', category: 'Finance', desc: 'Chartered accountancy', icon: Calculator, color: 'from-rose-500 to-red-400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  }
};

const ExamCatalog = ({ isModal = false, onClose, onSaved }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(s => s.auth);

  const [selected, setSelected] = useState(user?.selectedExam || null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (token) {
        await api.put('/api/auth/exam-preference', { selectedExam: selected });
      }
      dispatch(setSelectedExam(selected));
      if (isModal) {
        setToast('Neural Link Established');
        setTimeout(() => { setToast(''); if (onSaved) onSaved(); if (onClose) onClose(); }, 1500);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      dispatch(setSelectedExam(selected));
      if (isModal) { if (onClose) onClose(); } else navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={isModal ? '' : 'min-h-screen text-white flex flex-col items-center justify-center p-8 relative overflow-hidden'}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`relative z-10 w-full ${isModal ? '' : 'max-w-6xl'}`}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
             <Globe size={16} className="text-primary animate-spin-slow" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Trajectory Selection Hub</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase mb-4 leading-none">
            {isModal ? 'Adjust Trajectory' : 'Define your path'}
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Select a target neural sector. All AI simulations and mentorship will align with this trajectory.
          </p>
        </motion.div>

        {/* Exam Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {EXAMS.map(exam => {
            const Icon = exam.icon;
            const isActive = selected === exam.id;
            return (
              <motion.button
                key={exam.id}
                variants={itemVariants}
                onClick={() => setSelected(exam.id)}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative group flex flex-col items-center text-center p-8 rounded-[2.5rem] border-2 transition-all duration-300 inner-glow ${
                  isActive
                    ? 'border-primary bg-primary/20 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)]'
                    : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="exam-active-indicator"
                    className="absolute top-4 right-4 text-primary"
                  >
                    <CheckCircle2 size={24} />
                  </motion.div>
                )}
                
                <motion.div 
                  animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${exam.color} flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden`}
                >
                   <div className="absolute inset-0 bg-white/10 group-hover:animate-pulse" />
                   <Icon size={32} className="text-white relative z-10" />
                </motion.div>
                
                <p className="font-black text-lg text-white uppercase tracking-tighter mb-1">{exam.name}</p>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-3">{exam.category}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">{exam.desc}</p>
                
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${exam.color} transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
              </motion.button>
            );
          })}
        </div>

        {/* Continue / Save Button */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <FuturisticButton
            onClick={handleContinue}
            disabled={!selected || saving}
            className="px-16 py-5 text-xl min-w-[280px]"
          >
            {saving ? (
               <div className="flex items-center gap-3">
                  <Zap className="animate-spin" size={20} /> Establishing Link...
               </div>
            ) : (
               <div className="flex items-center gap-3">
                  {isModal ? 'Finalize Protocol' : 'Sync Interface'} <ArrowRight size={20} />
               </div>
            )}
          </FuturisticButton>
        </motion.div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-12 left-1/2 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-2xl text-emerald-500 px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.2)] z-[100] flex items-center gap-3"
          >
            <ShieldCheck size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamCatalog;
