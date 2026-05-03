import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { 
  Target, AlertCircle, Loader2, Sparkles, TrendingUp, TrendingDown, 
  Minus, Play, BookOpen, Clock, Calendar, BarChart3, ChevronRight, 
  Brain, Zap, Layout, Search, BarChart, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FuturisticButton from '../components/FuturisticButton';
import { EXAMS } from './ExamCatalog';

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

const WeaknessDetection = () => {
  const { user, token } = useSelector(s => s.auth);
  const { results, weakTopics, subjectStats } = useSelector(s => s.testResults);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedExam = user?.selectedExam || null;
  const examObj = EXAMS.find(e => e.id === selectedExam);

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const fetchHistory = async () => {
    if (!token) return;
    setFetchingHistory(true);
    try {
      const { data } = await api.get('/api/stats/history');
      
      const mappedData = data.map(r => ({
        ...r,
        date: r.created_at,
        timeTaken: r.time_taken
      }));

      dispatch({ type: 'testResults/setResults', payload: mappedData });
      dispatch({ type: 'testResults/computeWeakTopics' });
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (results.length === 0) fetchHistory();
  }, [token]);

  // Compute Overall Readiness
  const avgAccuracy = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / results.length)
    : 0;

  const getStatusColor = (score) => {
    if (score < 40) return 'text-rose-400';
    if (score < 70) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const handleGetAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.post('/api/ai/detect-weakness', {
        weakTopics,
        subjectStats,
        selectedExam,
        totalTests: results.length
      });

      setAiAnalysis(data.analysis);
    } catch (err) {
      setAiAnalysis('Neural decryption failed. Matrix re-synchronization required.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── EMPTY STATE ────────────────────────────────────────────────────────────
  if (fetchingHistory) {
    return (
      <div className="min-h-screen">
        <Topbar /><Sidebar />
        <main className="pl-72 pt-28 p-8 flex flex-col items-center justify-center min-h-[80vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="mt-4 text-slate-500 font-black uppercase tracking-widest text-xs">Synchronizing Neural History...</p>
        </main>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen">
        <Topbar /><Sidebar />
        <main className="pl-72 pt-28 p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-600 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <Search size={48} className="relative z-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">No Neural Data Found</h1>
          <p className="text-slate-500 font-medium max-w-md mb-10 leading-relaxed">
            Initialize an AI Synthetic Test or a full Mock Simulation to populate your weakness detection matrix.
          </p>
          <div className="flex gap-6">
            <FuturisticButton onClick={() => navigate('/test-gen')}>
              <Brain size={20} /> Initialize Test
            </FuturisticButton>
            <button onClick={() => navigate('/simulator')} className="px-10 py-3.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 transition-all">
              Launch Simulator
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Topbar /><Sidebar />
      <main className="pl-72 pt-28 p-8 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-10"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]">
                   <ShieldAlert className="text-white w-7 h-7" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Precision Analysis</h1>
              </div>
              <p className="text-primary font-black tracking-widest text-[10px] uppercase ml-1 opacity-80 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" /> Synced with {results.length} Data Packets · Iteration 0.4.1
              </p>
            </div>
            {examObj && <span className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary tracking-[0.2em] uppercase backdrop-blur-xl">{examObj.name} Logic Node</span>}
          </motion.div>

          {/* TOP ROW: Readiness + Subject Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col items-center justify-center text-center h-full holographic-hover inner-glow"
              >
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse-slow" />
                  <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]">
                    <circle cx="96" cy="96" r="86" stroke="rgba(255,255,255,0.03)" strokeWidth="14" fill="none" />
                    <circle cx="96" cy="96" r="86" stroke="currentColor" strokeWidth="14" fill="none" 
                      strokeDasharray={540} strokeDashoffset={540 - (540 * avgAccuracy) / 100} strokeLinecap="round" 
                      className={`transition-all duration-1000 ${avgAccuracy < 40 ? 'text-rose-500' : avgAccuracy < 70 ? 'text-amber-500' : 'text-emerald-500'}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-white tracking-tighter">{avgAccuracy}%</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mt-1">Readiness</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Matrix Stability</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Integrated accuracy across cumulative neural attempts.</p>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-8">
              <div className="glass-card p-10 rounded-[3rem] border-white/10 h-full inner-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <BarChart size={80} className="text-primary" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-3">
                   <div className="p-2.5 bg-primary/10 rounded-xl"><BarChart3 className="text-primary" size={20} /></div>
                   Node Performance Metrics
                </h3>
                <div className="space-y-8">
                  {Object.entries(subjectStats)
                    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
                    .map(([subj, stats]) => {
                      const acc = Math.round((stats.correct / stats.total) * 100);
                      return (
                        <div key={subj} className="space-y-3 group">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Neural Branch</span>
                               <span className="text-lg font-black text-white tracking-tight leading-none">{subj}</span>
                            </div>
                            <span className={`text-2xl font-black ${getStatusColor(acc)} tracking-tighter`}>{acc}%</span>
                          </div>
                          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${acc}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className={`absolute top-0 left-0 h-full rounded-full ${
                                acc < 40 ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 
                                acc < 70 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 
                                'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(5,150,105,0.4)]'}`} 
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-80 pt-1">
                            <span>{stats.total} Vectors Processed</span>
                            <span>{stats.correct} Correct · {stats.wrong} Loss · {stats.skipped} Neutral</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* WEAK TOPICS GRID */}
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-2">
               <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <AlertCircle className="text-rose-500" size={24} />
               </div>
               <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Critical Volatility Nodes</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {weakTopics.filter(t => t.accuracy < 75).map((topic, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`glass-card p-8 rounded-[2.5rem] border-t-4 transition-all relative overflow-hidden group holographic-hover ${
                    topic.severity === 'Critical' ? 'border-rose-500 bg-rose-500/5' : 'border-amber-500 bg-amber-500/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{topic.subject}</span>
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                      topic.severity === 'Critical' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-amber-500 text-black'
                    }`}>
                      {topic.severity}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white tracking-tighter mb-6 group-hover:text-primary transition-colors">{topic.topic}</h4>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Accuracy</span>
                      <span className={`text-xl font-black ${getStatusColor(topic.accuracy)}`}>{topic.accuracy}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.accuracy}%` }}
                        className={`h-full rounded-full ${getStatusColor(topic.accuracy).replace('text-', 'bg-')}`} 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      <span>{topic.totalAttempts} Iterations</span>
                      <span className="flex items-center gap-1">
                        Trend: <Minus size={12} /> Stable Link
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => navigate('/test-gen')} className="flex-1 py-3 bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-2">
                      <Target size={14} /> Practice
                    </button>
                    <button onClick={() => navigate('/revision')} className="flex-1 py-3 bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-2">
                      <BookOpen size={14} /> Revise
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI INSIGHT PANEL */}
          <motion.div variants={itemVariants} className="glass-card p-1 rounded-[3rem] bg-gradient-to-br from-primary/20 via-purple-500/20 to-transparent border-white/10 inner-glow overflow-hidden group">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.4)] group-hover:scale-110 transition-transform duration-500">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Synthesis</h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">High-level improvement vector generated from test history matrix.</p>
                  </div>
                </div>
                {!aiAnalysis && (
                  <FuturisticButton onClick={handleGetAIAnalysis} disabled={analyzing} className="px-10 py-4">
                    {analyzing ? 'Synthesizing...' : 'Generate Insight'}
                  </FuturisticButton>
                )}
              </div>

              <AnimatePresence>
                {aiAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-black/40 border border-white/5 rounded-[2rem] p-8 inner-glow relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Zap size={60} className="text-primary" />
                    </div>
                    <div className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed prose-strong:text-primary prose-strong:font-black" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>') }} />
                    <button onClick={() => setAiAnalysis('')} className="mt-8 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] border-b border-slate-800 pb-1 transition-colors">Clear Synthesis</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* TEST HISTORY TIMELINE */}
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-2">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Clock className="text-slate-400" size={24} />
               </div>
               <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Data Stream History</h3>
            </motion.div>
            <div className="space-y-4">
              {[...results].reverse().map((res, i) => (
                <motion.div 
                  key={res.id} 
                  variants={itemVariants}
                  whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="glass-card p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-6 border-white/5 transition-all holographic-hover"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      res.source === 'mock' 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {res.source === 'mock' ? <Layout size={28} /> : <Brain size={28} />}
                    </div>
                    <div>
                      <h5 className="text-xl font-black text-white tracking-tight">{res.subject || 'Full Module Simulation'}</h5>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
                        {res.source === 'mock' ? 'Mock Simulation' : 'Synthetic Test'} · Node Link: {new Date(res.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Raw Score</p>
                      <p className="text-2xl font-black text-primary tracking-tighter">{res.score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Stability</p>
                      <p className={`text-2xl font-black tracking-tighter ${getStatusColor(res.accuracy)}`}>{res.accuracy}%</p>
                    </div>
                    <button className="w-12 h-12 bg-white/5 hover:bg-primary/20 rounded-xl text-slate-500 hover:text-primary transition-all flex items-center justify-center border border-white/5">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10">
            {[
              { label: 'Trajectory Plan', icon: <Calendar />, path: '/revision', color: 'primary' },
              { label: 'Stability Practice', icon: <Target />, path: '/test-gen', color: 'purple' },
              { label: 'Full Diagnostic', icon: <Zap />, path: '/simulator', color: 'amber' }
            ].map((action, i) => (
              <motion.button 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                onClick={() => navigate(action.path)}
                className={`py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all flex flex-col items-center gap-4 group border border-white/5 holographic-hover bg-${action.color}-500/5`}
              >
                <div className={`p-4 bg-${action.color}-500/10 rounded-2xl group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--color-${action.color}-rgb),0.3)] transition-all`}>
                  {action.icon}
                </div>
                <span className="text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      <style jsx>{`
        .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default WeaknessDetection;
