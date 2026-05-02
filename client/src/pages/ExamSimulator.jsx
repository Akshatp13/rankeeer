import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { 
  Clock, AlertCircle, CheckCircle2, XCircle, Loader2, BookOpen, 
  MessageSquare, BarChart3, ChevronRight, Zap, Play, Sparkles,
  ShieldAlert, BrainCircuit, Activity, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FuturisticButton from '../components/FuturisticButton';
import { EXAMS } from './ExamCatalog';
import { addTestResult, computeWeakTopics } from '../redux/testResultsSlice';

// ─── Exam-specific mock configs ──────────────────────────────────────────────
const EXAM_CONFIGS = {
  jee:  { sections: ['Physics', 'Chemistry', 'Mathematics'], totalQ: 75, duration: 180, marking: { correct: 4, wrong: -1 } },
  neet: { sections: ['Physics', 'Chemistry', 'Botany', 'Zoology'], totalQ: 180, duration: 200, marking: { correct: 4, wrong: -1 } },
  cat:  { sections: ['VARC', 'DILR', 'QA'], totalQ: 66, duration: 120, marking: { correct: 3, wrong: -1 } },
  gate: { sections: ['General Aptitude', 'Core Subject'], totalQ: 65, duration: 180, marking: { correct: 1, wrong: -0.33 } },
  ssc:  { sections: ['General Intelligence', 'English', 'Quantitative Aptitude', 'General Awareness'], totalQ: 100, duration: 60, marking: { correct: 2, wrong: -0.5 } },
  ibps: { sections: ['Reasoning', 'English', 'Quantitative Aptitude'], totalQ: 100, duration: 60, marking: { correct: 1, wrong: -0.25 } },
  upsc: { sections: ['General Studies'], totalQ: 100, duration: 120, marking: { correct: 2, wrong: -0.66 } },
};
const DEFAULT_CONFIG = { sections: ['General Aptitude'], totalQ: 50, duration: 90, marking: { correct: 1, wrong: -0.25 } };
const SCREEN = { SETUP: 'setup', LOADING: 'loading', EXAM: 'exam', RESULTS: 'results' };

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

const ExamSimulator = () => {
  const { user, token } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedExam = user?.selectedExam || null;
  const examObj = EXAMS.find(e => e.id === selectedExam);
  const config = EXAM_CONFIGS[selectedExam] || DEFAULT_CONFIG;

  const [screen, setScreen] = useState(SCREEN.SETUP);
  const [selectedSection, setSelectedSection] = useState(config.sections[0]);
  const [numQuestions, setNumQuestions] = useState(Math.min(20, config.totalQ));
  const [mockData, setMockData] = useState(null);
  const [activeQ, setActiveQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisHTML, setAnalysisHTML] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (screen === SCREEN.EXAM) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); handleSubmitExam(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleStartExam = async () => {
    setError('');
    setScreen(SCREEN.LOADING);
    try {
      const { data } = await axios.post('/api/ai/generate-mock', {
        selectedExam: examObj?.name || 'General',
        subject: selectedSection,
        numQuestions,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMockData(data);
      setActiveQ(0);
      setAnswers({});
      setMarkedForReview(new Set());
      setTimeLeft((data.duration || config.duration) * 60);
      setScreen(SCREEN.EXAM);
    } catch (err) {
      setError(err.response?.data?.error || 'Neural link failed. Attempt re-sync.');
      setScreen(SCREEN.SETUP);
    }
  };

  const handleSubmitExam = (auto = false) => {
    if (!auto && !window.confirm('Matrix finalization will terminate the neural link. Proceed?')) return;
    clearInterval(timerRef.current);
    setScreen(SCREEN.RESULTS);
  };

  const calcScore = () => {
    if (!mockData) return { correct: 0, wrong: 0, skipped: 0, raw: 0, accuracy: 0 };
    const ms = mockData.markingScheme || config.marking;
    let correct = 0, wrong = 0;
    mockData.questions.forEach((q, i) => {
      const a = answers[i];
      if (a === undefined) return;
      if (a === q.correct) correct++;
      else wrong++;
    });
    const skipped = mockData.questions.length - correct - wrong;
    const raw = correct * ms.correct + wrong * ms.wrong;
    const accuracy = mockData.questions.length ? Math.round((correct / mockData.questions.length) * 100) : 0;
    return { correct, wrong, skipped, raw, accuracy };
  };

  const computeTopicBreakdown = (questions, userAnswers) => {
    const map = {};
    questions.forEach((q, i) => {
      if (!map[q.topic]) {
        map[q.topic] = {
          name: q.topic,
          subject: q.subject || 'Mixed',
          attempted: 0, correct: 0, wrong: 0, skipped: 0
        };
      }
      const ua = userAnswers[i];
      map[q.topic].attempted++;
      if (ua === undefined || ua === null) map[q.topic].skipped++;
      else if (ua === q.correct) map[q.topic].correct++;
      else map[q.topic].wrong++;
    });
    return Object.values(map);
  };

  useEffect(() => {
    if (screen === SCREEN.RESULTS && mockData && !mockData._dispatched) {
      const r = calcScore();
      const timeTaken = (mockData.duration || config.duration) * 60 - timeLeft;
      dispatch(addTestResult({
        source: "mock",
        exam: user.selectedExam,
        subject: "Full Mock",
        score: r.raw,
        accuracy: r.accuracy,
        timeTaken: timeTaken,
        questions: mockData.questions.map((q, i) => ({
          id: q.id || i,
          topic: q.topic,
          subject: q.subject || 'Mixed',
          userAnswer: answers[i] ?? null,
          correct: q.correct,
          isCorrect: answers[i] === q.correct,
        })),
        topicBreakdown: computeTopicBreakdown(mockData.questions, answers),
      }));
      dispatch(computeWeakTopics());
      setMockData(prev => ({ ...prev, _dispatched: true }));
    }
  }, [screen]);

  const handleAnalyzeExam = async () => {
    setShowAnalysis(true);
    setAnalysisLoading(true);
    try {
      const r = calcScore();
      const timeTaken = formatTime((mockData.duration || config.duration) * 60 - timeLeft);
      const { data } = await axios.post('/api/ai/analyze-exam', {
        score: r.correct,
        total: mockData?.questions?.length || numQuestions,
        timeTaken,
        selectedExam: examObj?.name || selectedExam,
        scores: { Correct: r.correct, Wrong: r.wrong, Skipped: r.skipped, 'Raw Score': r.raw },
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAnalysisHTML(data.analysisHTML);
    } catch (err) {
      setAnalysisHTML('<p class="text-rose-400">Failed to generate AI analysis. Link unstable.</p>');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // ── SETUP screen ───────────────────────────────────────────────────────────
  if (screen === SCREEN.SETUP) return (
    <div className="min-h-screen">
      <Topbar /><Sidebar />
      <main className="pl-72 pt-28 p-8 max-w-3xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.3)]">
               <Activity className="text-rose-500 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Simulation Deck</h1>
              {examObj && <p className="text-rose-500 font-black tracking-widest text-[10px] uppercase ml-1 opacity-80 mt-1">Full Mock Sync: {examObj.name}</p>}
            </div>
          </motion.div>

          {!selectedExam && (
            <motion.div variants={itemVariants} className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-4 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="text-amber-500" />
              </div>
              <p className="text-white font-bold tracking-tight">
                Neural Link Missing: Select a trajectory in <Link to="/settings" className="text-amber-500 underline font-black">System Ops</Link>.
              </p>
            </motion.div>
          )}

          {error && <motion.div variants={itemVariants} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-black uppercase tracking-widest">{error}</motion.div>}

          <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] border-white/10 inner-glow holographic-hover space-y-10">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Complexity Nodes', value: config.totalQ, icon: <BrainCircuit size={14} /> },
                { label: 'Sync Duration', value: `${config.duration}m`, icon: <Clock size={14} /> },
                { label: 'Marking Logic', value: `+${config.marking.correct}/${config.marking.wrong}`, icon: <Zap size={14} /> },
              ].map(item => (
                <div key={item.label} className="bg-black/40 border border-white/5 rounded-2xl p-6 text-center inner-glow group hover:border-primary/30 transition-all">
                  <div className="text-primary mb-3 flex justify-center group-hover:scale-125 transition-transform">{item.icon}</div>
                  <p className="text-2xl font-black text-white tracking-tighter">{item.value}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Select Neural Sector</label>
              <div className="flex flex-wrap gap-3">
                {config.sections.map(s => (
                  <button key={s} onClick={() => setSelectedSection(s)}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${selectedSection === s ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/30'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Extraction Depth</label>
              <div className="grid grid-cols-3 gap-3">
                {[10, 20, 30].filter(n => n <= config.totalQ).map(n => (
                  <button key={n} onClick={() => setNumQuestions(n)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${numQuestions === n ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.2)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/30'}`}>
                    {n} Nodes
                  </button>
                ))}
              </div>
            </div>

            <FuturisticButton onClick={handleStartExam} className="w-full py-5 text-xl bg-rose-600 hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)]">
               Initiate Full Mock Protocol
            </FuturisticButton>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );

  // ── LOADING screen ─────────────────────────────────────────────────────────
  if (screen === SCREEN.LOADING) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.1),transparent_70%)]" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="w-48 h-48 border-[2px] border-rose-500/20 border-t-rose-500 rounded-full relative flex items-center justify-center"
      >
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-32 h-32 bg-rose-500/10 rounded-full blur-2xl"
        />
        <Activity size={60} className="text-rose-500 absolute" />
      </motion.div>
      <div className="text-center mt-12 relative z-10">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Neural Synchronization...</h2>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] max-w-sm leading-relaxed mx-auto">Establishing high-fidelity simulation link. Matrix alignment 84% complete. Do not disconnect.</p>
      </div>
    </div>
  );

  // ── EXAM screen ────────────────────────────────────────────────────────────
  if (screen === SCREEN.EXAM && mockData) {
    const q = mockData.questions[activeQ];
    return (
      <div className="min-h-screen">
        {/* HUD Topbar */}
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="h-20 bg-black/60 backdrop-blur-2xl border-b border-white/10 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 inner-glow"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                <Globe size={20} className="animate-spin-slow" />
             </div>
             <div className="hidden sm:block">
                <span className="font-black text-xs text-white uppercase tracking-widest">{mockData.title}</span>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Simulation Stream</p>
             </div>
          </div>

          <div className={`flex items-center gap-4 px-10 py-3 rounded-[1.2rem] font-black text-2xl tracking-tighter ${timeLeft < 300 ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)] animate-pulse' : 'bg-primary/10 text-primary border border-primary/20'}`}>
            <Clock size={20} />{formatTime(timeLeft)}
          </div>

          <button onClick={() => handleSubmitExam(false)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black px-8 py-3 rounded-xl transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:scale-105">
            <ShieldAlert size={16} /> Terminate
          </button>
        </motion.div>

        <div className="pt-20 flex h-screen">
          {/* Main question area */}
          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            <motion.div 
              key={activeQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto glass-card p-12 rounded-[3.5rem] border-white/10 inner-glow relative holographic-hover"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Data Point {activeQ + 1} // {mockData.questions.length}</span>
                <button onClick={() => {
                  const s = new Set(markedForReview);
                  s.has(activeQ) ? s.delete(activeQ) : s.add(activeQ);
                  setMarkedForReview(s);
                }} className={`text-[9px] px-5 py-2 rounded-full font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${markedForReview.has(activeQ) ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
                   {markedForReview.has(activeQ) ? <Activity size={12} /> : <Play size={12} className="rotate-[-90deg]" />}
                   {markedForReview.has(activeQ) ? 'Flagged for Review' : 'Flag Logic Node'}
                </button>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter leading-tight mb-12">{q.question}</h3>
              <div className="space-y-4">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [activeQ]: i }))}
                    className={`group w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-5 ${answers[activeQ] === i ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]' : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/20'}`}>
                    <span className={`font-black text-sm w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${answers[activeQ] === i ? 'bg-primary text-white' : 'bg-white/5 group-hover:bg-primary/20'}`}>{String.fromCharCode(65 + i)}</span>
                    <span className="flex-1 font-bold tracking-tight">{opt}</span>
                    {answers[activeQ] === i && <Sparkles size={20} className="text-primary animate-pulse" />}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                <button disabled={activeQ === 0} onClick={() => setActiveQ(p => p - 1)}
                  className="px-10 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-all">
                  Previous Link
                </button>
                {activeQ < mockData.questions.length - 1
                  ? <FuturisticButton onClick={() => setActiveQ(p => p + 1)} className="px-12 py-4">Next Node</FuturisticButton>
                  : <FuturisticButton onClick={() => handleSubmitExam(false)} className="px-12 py-4 bg-rose-600 hover:bg-rose-500">Finalize Matrix</FuturisticButton>
                }
              </div>
            </motion.div>
          </div>

          {/* Palette sidebar */}
          <div className="w-80 shrink-0 border-l border-white/10 bg-black/40 backdrop-blur-3xl overflow-y-auto p-8 inner-glow">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><BarChart3 size={14} /> Neural Grid</h4>
            <div className="grid grid-cols-4 gap-3 mb-10">
              {mockData.questions.map((_, i) => {
                const attempted = answers[i] !== undefined;
                const marked = markedForReview.has(i);
                let cls = 'bg-white/5 border border-white/5 text-slate-600 hover:border-white/20';
                if (i === activeQ) cls = 'ring-2 ring-primary ring-offset-4 ring-offset-black scale-110 bg-primary text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]';
                else if (marked) cls = 'bg-amber-500 border-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]';
                else if (attempted) cls = 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]';
                return (
                  <button key={i} onClick={() => setActiveQ(i)}
                    className={`h-11 text-[10px] font-black rounded-xl transition-all relative overflow-hidden flex items-center justify-center ${cls}`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="space-y-4 border-t border-white/5 pt-8">
              {[
                { color: 'bg-emerald-500', label: 'Synced Node', sub: 'Answer submitted' },
                { color: 'bg-amber-500', label: 'Flagged Node', sub: 'Review pending' },
                { color: 'bg-white/10', label: 'Open Node', sub: 'Awaiting sync' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 group">
                   <div className={`w-3 h-3 rounded-full ${item.color} group-hover:scale-125 transition-transform`} />
                   <div>
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">{item.label}</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.sub}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS screen ─────────────────────────────────────────────────────────
  if (screen === SCREEN.RESULTS && mockData) {
    const r = calcScore();
    return (
      <div className="min-h-screen">
        <Topbar /><Sidebar />
        <main className="pl-72 pt-28 p-8 max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10">
            <motion.div variants={itemVariants} className="glass-card p-12 rounded-[3.5rem] border-white/10 text-center relative overflow-hidden inner-glow holographic-hover">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="w-24 h-24 bg-rose-500/20 border-4 border-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-rose-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
              >
                <Activity size={48} />
              </motion.div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Simulation Terminated</h1>
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12">{mockData.title} · Sector {selectedSection}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Neural Power', value: r.raw.toFixed(1), cls: 'text-primary' },
                  { label: 'Sync Stability', value: `${r.accuracy}%`, cls: 'text-emerald-400' },
                  { label: 'Correct Nodes', value: r.correct, cls: 'text-emerald-400' },
                  { label: 'Data Loss', value: r.wrong, cls: 'text-rose-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-black/40 border border-white/5 rounded-3xl p-6 inner-glow group hover:border-primary/30 transition-all">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.cls} tracking-tighter`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-primary/5 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left inner-glow">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                    <BarChart3 size={32} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white tracking-tighter uppercase">Volatile Patterns Detected</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">Your performance data has been pushed to the central neural mainframe for weakness identification.</p>
                  </div>
                </div>
                <FuturisticButton onClick={() => navigate('/weakness')} className="px-10 py-4 whitespace-nowrap">
                  Access Logic report <ChevronRight size={18} className="ml-2" />
                </FuturisticButton>
              </div>
            </motion.div>

            {/* Answer review */}
            <div className="space-y-6">
               <motion.h2 variants={itemVariants} className="text-2xl font-black text-white tracking-tighter uppercase px-4 flex items-center gap-3"><Play size={20} className="text-rose-500 rotate-90" /> Neural Playback</motion.h2>
               <div className="space-y-4">
                {mockData.questions.map((q, i) => {
                  const ua = answers[i];
                  const correct = ua === q.correct;
                  const skipped = ua === undefined;
                  return (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      whileHover={{ x: 10 }}
                      className={`glass-card p-8 rounded-[2.5rem] border-l-[6px] transition-all relative overflow-hidden holographic-hover ${
                        skipped ? 'border-slate-500 bg-slate-500/5' : correct ? 'border-emerald-500 bg-emerald-500/5' : 'border-rose-500 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 mt-1">
                          {skipped ? <div className="w-6 h-6 rounded-full bg-slate-500/20" />
                            : correct ? <CheckCircle2 className="text-emerald-500" size={24} />
                            : <XCircle className="text-rose-500" size={24} />}
                        </div>
                        <div className="space-y-4 flex-1">
                          <p className="text-lg font-black text-white tracking-tight leading-snug">{i + 1}. {q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
                            {ua !== undefined && <p>Selection: <span className={correct ? 'text-emerald-400' : 'text-rose-400'}>{q.options[ua]}</span></p>}
                            {!correct && <p>Node Logic: <span className="text-emerald-400">{q.options[q.correct]}</span></p>}
                          </div>
                          <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[10px] text-primary/80 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Zap size={14} /> Extraction Summary</p>
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
              <button onClick={() => { setScreen(SCREEN.SETUP); setMockData(null); }}
                className="py-6 bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-white transition-all flex flex-col items-center gap-3 group">
                <Play size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                Initialize New Mock
              </button>
              <button onClick={handleAnalyzeExam}
                className="py-6 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] text-primary transition-all flex flex-col items-center gap-3 group">
                <Activity size={24} className="group-hover:scale-125 transition-transform" />
                Run AI Diagnostics
              </button>
              <button onClick={() => navigate('/chat')}
                className="py-6 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] text-purple-400 transition-all flex flex-col items-center gap-3 group">
                <MessageSquare size={24} className="group-hover:translate-y-[-5px] transition-transform" />
                Contact Neural Mentor
              </button>
            </div>

            {/* Analysis Modal */}
            <AnimatePresence>
              {showAnalysis && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 overflow-hidden" 
                  onClick={() => setShowAnalysis(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-black/60 border border-white/10 rounded-[3.5rem] p-12 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative inner-glow" 
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">AI Neural Diagnostics</h2>
                      <button onClick={() => setShowAnalysis(false)} className="text-slate-500 hover:text-white transition-colors">
                        <XCircle size={32} />
                      </button>
                    </div>
                    {analysisLoading
                      ? (
                        <div className="flex flex-col items-center py-20 gap-6">
                           <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                              <Loader2 className="text-primary" size={48} />
                           </motion.div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synthesizing Performance Matrix...</p>
                        </div>
                      )
                      : <div className="prose prose-invert max-w-none text-sm [&_h3]:text-primary [&_h3]:font-black [&_h3]:uppercase [&_h3]:tracking-widest [&_strong]:text-white [&_p]:text-slate-400 [&_p]:leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisHTML }} />
                    }
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    );
  }
  return null;
};

export default ExamSimulator;
