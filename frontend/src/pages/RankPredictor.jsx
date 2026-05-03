import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { TrendingUp, AlertCircle, Loader2, Target, BarChart3, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { EXAMS } from './ExamCatalog';
import { motion, AnimatePresence } from 'framer-motion';
import FuturisticButton from '../components/FuturisticButton';

// ─── Exam-specific score field configs ────────────────────────────────────────
const SCORE_FIELDS = {
  jee:  [{ key: 'physics', label: 'Physics Node' }, { key: 'chemistry', label: 'Chemistry Node' }, { key: 'maths', label: 'Maths Node' }, { key: 'attempts', label: 'Frequency' }],
  neet: [{ key: 'physics', label: 'Physics Node' }, { key: 'chemistry', label: 'Chemistry Node' }, { key: 'biology', label: 'Biology Node' }, { key: 'attempts', label: 'Frequency' }],
  upsc: [{ key: 'gs1', label: 'GS Paper 1' }, { key: 'gs2', label: 'GS Paper 2' }, { key: 'gs3', label: 'GS Paper 3' }, { key: 'gs4', label: 'GS Paper 4' }, { key: 'essay', label: 'Essay Node' }, { key: 'optional', label: 'Optional Subject' }],
  cat:  [{ key: 'varc', label: 'VARC Magnitude' }, { key: 'dilr', label: 'DILR Magnitude' }, { key: 'qa', label: 'QA Magnitude' }],
  gate: [{ key: 'subject', label: 'Subject Weight' }, { key: 'total', label: 'Raw Potential' }],
  ssc:  [{ key: 'tier1', label: 'Tier 1 Logic' }, { key: 'tier2', label: 'Tier 2 Logic' }],
  ibps: [{ key: 'reasoning', label: 'Reasoning Flux' }, { key: 'english', label: 'Lexical Link' }, { key: 'quant', label: 'Numeric Core' }, { key: 'ga', label: 'System Knowledge' }],
};
const DEFAULT_FIELDS = [{ key: 'overall', label: 'Overall Potency' }, { key: 'max', label: 'Capacity' }, { key: 'attempts', label: 'Iterations' }];

const rankHistory = [
  { test: 'M-01', score: 120, rank: 15000 },
  { test: 'M-02', score: 145, rank: 12000 },
  { test: 'M-03', score: 130, rank: 14000 },
  { test: 'M-04', score: 180, rank: 8000 },
  { test: 'M-05', score: 210, rank: 4500 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  }
};

const RankPredictor = () => {
  const { user, token } = useSelector(s => s.auth);
  const selectedExam = user?.selectedExam || null;
  const examObj = EXAMS.find(e => e.id === selectedExam);
  const fields = SCORE_FIELDS[selectedExam] || DEFAULT_FIELDS;

  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [analysisHTML, setAnalysisHTML] = useState('');
  const [error, setError] = useState('');

  const handleChange = (key, val) => setScores(prev => ({ ...prev, [key]: val }));

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysisHTML('');
    try {
      const totalScore = Object.values(scores).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
      const { data } = await api.post('/api/ai/analyze-exam', {
        score: totalScore,
        total: fields.length * 100,
        scores,
        selectedExam: examObj?.name || selectedExam,
      });
      setAnalysisHTML(data.analysisHTML);
    } catch (err) {
      setError(err.response?.data?.error || 'Neural computation failed. Please re-synchronize.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Topbar />
      <Sidebar />
      <main className="pl-72 pt-28 p-8 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]">
                   <TrendingUp className="text-white w-7 h-7" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Rank Projection</h1>
              </div>
              {examObj ? (
                <p className="text-primary font-black tracking-widest text-xs uppercase ml-1 opacity-80 flex items-center gap-2">
                  <Sparkles size={14} className="animate-pulse" /> Analying: {examObj.name} Logic Node
                </p>
              ) : (
                <p className="text-slate-500 font-bold text-xs uppercase ml-1 opacity-80">Awaiting Exam Module Identification</p>
              )}
            </div>
          </motion.div>

          {/* Alerts */}
          {!selectedExam && (
            <motion.div variants={itemVariants} className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-4 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="text-amber-500" />
              </div>
              <div>
                <p className="text-white font-bold tracking-tight">Exam Module Missing</p>
                <p className="text-slate-400 text-sm">Synchronize your profile in <Link to="/settings" className="text-amber-500 underline font-black">System Configurations</Link> to enable projection.</p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Node */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
               <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card p-8 rounded-[2.5rem] border-white/10 holographic-hover h-full"
              >
                <div className="flex items-center gap-3 mb-8">
                   <Target size={24} className="text-primary" />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Raw Input Nodes</h3>
                </div>
                <form onSubmit={handlePredict} className="space-y-6">
                  {fields.map(f => (
                    <div key={f.key} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{f.label}</label>
                      <input
                        type="number"
                        value={scores[f.key] || ''}
                        onChange={e => handleChange(f.key, e.target.value)}
                        placeholder="Node Capacity"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-slate-700 font-bold"
                      />
                    </div>
                  ))}
                  <FuturisticButton
                    type="submit"
                    disabled={loading || Object.keys(scores).length === 0}
                    className="w-full mt-4"
                  >
                    {loading ? 'Projecting Matrix...' : 'Compute Rank'}
                  </FuturisticButton>
                </form>
              </motion.div>
            </motion.div>

            {/* Matrix Result Section */}
            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-6 rounded-3xl border-rose-500/20 bg-rose-500/5 text-rose-500 font-bold text-center uppercase tracking-widest text-xs"
                  >
                    {error}
                  </motion.div>
                )}

                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-20 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-slate-400 h-full border-white/5"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 border-2 border-primary/20 rounded-full animate-ping absolute" />
                      <div className="w-24 h-24 border-t-2 border-primary rounded-full animate-spin relative" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <BarChart3 className="text-primary animate-pulse" size={32} />
                      </div>
                    </div>
                    <div className="text-center">
                       <p className="text-white font-black uppercase tracking-[0.3em] mb-2">Simulating Matrix</p>
                       <p className="text-xs text-slate-500 font-bold">Matching raw scores with historical {examObj?.name || 'module'} patterns…</p>
                    </div>
                  </motion.div>
                ) : analysisHTML ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 rounded-[3rem] border-white/10 inner-glow overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Sparkles size={80} className="text-primary" />
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                       <div className="p-3 bg-primary/10 rounded-xl">
                          <BarChart3 size={24} className="text-primary" />
                       </div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Synthetic Projection</h3>
                    </div>
                    <div
                      className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-medium [&_h3]:text-primary [&_h3]:font-black [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:text-sm [&_h3]:mb-4 [&_strong]:text-white [&_ul]:space-y-2 [&_li]:text-sm"
                      dangerouslySetInnerHTML={{ __html: analysisHTML }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-8 rounded-[3rem] border-white/5 h-full relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-8 px-2">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mock Rank Progression</h3>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Stream</span>
                       </div>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rankHistory}>
                          <defs>
                            <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis 
                            dataKey="test" 
                            stroke="#475569" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                          />
                          <YAxis 
                            stroke="#475569" 
                            reversed 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(10, 10, 15, 0.9)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '20px',
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }} 
                            itemStyle={{ color: '#3b82f6', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="rank" 
                            stroke="#3b82f6" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorRank)" 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 flex justify-center">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">Lower Magnitude = Superior Cognitive Standing (Y-Axis Inverted)</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RankPredictor;
