import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { 
  Sparkles, BookOpen, Clock, Calendar, StickyNote, RefreshCw, 
  Brain, Zap, AlertCircle, Loader2, Upload, Trash2, CheckCircle2, Download, HelpCircle, FileText
} from 'lucide-react';
import { EXAMS } from './ExamCatalog';
import { motion, AnimatePresence } from 'framer-motion';
import FuturisticButton from '../components/FuturisticButton';

const MODES = { PLAN: 'plan', NOTES: 'notes', TOPIC: 'topic', SPACED: 'spaced' };

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

const SmartRevision = () => {
  const { user, token, weakTopics } = useSelector(s => s.auth);
  const selectedExam = user?.selectedExam || null;
  const examObj = EXAMS.find(e => e.id === selectedExam);

  const [activeMode, setActiveMode] = useState(MODES.PLAN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Tab 1: AI Study Plan State ─────────────────────────────────────────────
  const [planHours, setPlanHours] = useState(6);
  const [planDays, setPlanDays] = useState(30);
  const [studyPlan, setStudyPlan] = useState(null);

  // ── Tab 2: Revise from Notes State ─────────────────────────────────────────
  const [notesData, setNotesData] = useState(null);
  const [notesView, setNotesView] = useState('summary'); // summary, cards, map, quiz
  const [flippedCard, setFlippedCard] = useState(null);

  // ── Tab 3: Topic Revision State ────────────────────────────────────────────
  const [revTopic, setRevTopic] = useState('');
  const [revisionSheet, setRevisionSheet] = useState(null);

  // ── Tab 4: Spaced Repetition State ─────────────────────────────────────────
  const [spacedSchedule, setSpacedSchedule] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('spacedSchedule');
    if (saved) setSpacedSchedule(JSON.parse(saved));
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleGeneratePlan = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/ai/generate-study-plan', {
        hoursPerDay: planHours,
        daysUntilExam: planDays,
        weakTopics: weakTopics,
        selectedExam: examObj?.name
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStudyPlan(data);
    } catch (err) { setError('Neural engine failed to compute plan.'); }
    finally { setLoading(false); }
  };

  const handleTopicRevision = async () => {
    if (!revTopic) return;
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/ai/generate-revision-sheet', {
        topic: revTopic,
        subject: '',
        selectedExam: examObj?.name
      }, { headers: { Authorization: `Bearer ${token}` } });
      setRevisionSheet(data.sheetHTML);
    } catch (err) { setError('Neural link error in sheet generation.'); }
    finally { setLoading(false); }
  };

  const handleReviseNotes = async (file) => {
    setLoading(true); setError('');
    try {
      const text = await file.text();
      const { data } = await axios.post('/api/ai/revise-from-notes', {
        notesText: text,
        selectedExam: examObj?.name
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNotesData(data);
    } catch (err) { setError('Failed to decrypt notes node.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Topbar /><Sidebar />
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
                   <Sparkles className="text-white w-7 h-7" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Smart Revision</h1>
              </div>
              {examObj && (
                <p className="text-primary font-black tracking-widest text-xs uppercase ml-1 opacity-80">
                  Cognitive Optimization for {examObj.name}
                </p>
              )}
            </div>
          </motion.div>

          {!selectedExam && (
            <motion.div variants={itemVariants} className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-4 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="text-amber-500" />
              </div>
              <div>
                <p className="text-white font-bold tracking-tight">Exam Module Missing</p>
                <p className="text-slate-400 text-sm">Select an exam in <Link to="/settings" className="text-amber-500 underline font-black">System Configurations</Link> to enable AI revision.</p>
              </div>
            </motion.div>
          )}

          {/* Mode Selector Tabs */}
          <motion.div variants={itemVariants} className="flex p-1.5 bg-white/5 border border-white/10 rounded-3xl w-fit backdrop-blur-2xl">
            {[
              { id: MODES.PLAN, label: 'Study Plan', icon: <Calendar size={18} /> },
              { id: MODES.NOTES, label: 'Notes Node', icon: <StickyNote size={18} /> },
              { id: MODES.TOPIC, label: 'Topic Core', icon: <BookOpen size={18} /> },
              { id: MODES.SPACED, label: 'Spaced Sync', icon: <RefreshCw size={18} /> },
            ].map(m => (
              <button key={m.id} onClick={() => setActiveMode(m.id)}
                className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 relative overflow-hidden group ${
                  activeMode === m.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {activeMode === m.id && (
                  <motion.div
                    layoutId="mode-bg"
                    className="absolute inset-0 bg-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{m.icon}</span>
                <span className="relative z-10">{m.label}</span>
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[500px]"
            >
              {activeMode === MODES.PLAN && (
                <div className="space-y-8">
                  {!studyPlan ? (
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="glass-card p-12 rounded-[3rem] max-w-2xl mx-auto text-center space-y-10 border-white/10 holographic-hover"
                    >
                      <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.5)]">
                        <Calendar size={48} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Initialize Neural Study Matrix</h2>
                        <p className="text-slate-500 font-medium mt-2">Our algorithms will synthesize a custom trajectory based on your exam parameters.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3 text-left">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Core Hours / Day</label>
                          <input type="number" value={planHours} onChange={(e) => setPlanHours(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-white font-bold" />
                        </div>
                        <div className="space-y-3 text-left">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Days Until Iteration</label>
                          <input type="number" value={planDays} onChange={(e) => setPlanDays(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-white font-bold" />
                        </div>
                      </div>
                      {weakTopics?.length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 flex items-center gap-5 text-left inner-glow">
                          <div className="p-3 bg-primary/20 rounded-xl">
                            <Zap className="text-primary" size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary uppercase tracking-widest">Weak Topics Synchronized</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">Matrix will prioritize {weakTopics.length} detected volatility nodes.</p>
                          </div>
                        </div>
                      )}
                      <FuturisticButton onClick={handleGeneratePlan} disabled={loading} className="w-full py-5 text-xl">
                        {loading ? 'Synthesizing...' : 'Generate Matrix'}
                      </FuturisticButton>
                    </motion.div>
                  ) : (
                    <div className="space-y-10">
                      <div className="flex justify-between items-end px-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Trajectory: {studyPlan.totalDays} Days</h2>
                        <button onClick={() => setStudyPlan(null)} className="text-xs font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-widest border-b border-slate-800 pb-1">Reset Matrix</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {studyPlan.plan.map((day, idx) => (
                          <motion.div 
                            key={day.day} 
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="glass-card p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group holographic-hover"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                               <span className="text-6xl font-black italic">{day.day}</span>
                            </div>
                            <div className="flex justify-between items-start mb-6">
                              <span className="text-sm font-black text-primary uppercase tracking-widest">ITERATION {day.day}</span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day.date}</span>
                            </div>
                            <div className="space-y-6">
                              {day.sessions.map((s, idx) => (
                                <div key={idx} className="space-y-2 group/session">
                                  <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.subject} Node</span>
                                  </div>
                                  <p className="text-lg font-black text-white tracking-tight group-hover/session:text-primary transition-colors">{s.topic}</p>
                                  <div className="flex items-center gap-5 pt-1">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Clock size={12} /> {s.hours}H Link</span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-primary/60 uppercase tracking-widest"><Zap size={12} /> {s.type}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMode === MODES.NOTES && (
                <div className="space-y-8">
                  {!notesData ? (
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="glass-card p-16 rounded-[3.5rem] text-center space-y-10 max-w-2xl mx-auto border-white/10 holographic-hover"
                    >
                      <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.5)]">
                        <Upload size={48} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Synchronize Study Nodes</h2>
                        <p className="text-slate-500 font-medium mt-2">Upload data packets (PDF/Img). AI will decrypt key vectors and synthesize flash-nodes.</p>
                      </div>
                      <input type="file" id="notes-rev" className="hidden" onChange={(e) => handleReviseNotes(e.target.files[0])} />
                      <label htmlFor="notes-rev" className="inline-block px-12 py-5 bg-primary hover:bg-blue-600 rounded-2xl font-black text-white cursor-pointer transition-all shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)] uppercase tracking-[0.2em] text-sm">
                        {loading ? 'Decrypting Packet...' : 'Initialize Data Link'}
                      </label>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* Left Sidebar */}
                      <div className="lg:col-span-1 space-y-3">
                        {[
                          { id: 'summary', label: 'Summary Packet', icon: <FileText size={18} /> },
                          { id: 'cards', label: 'Flash-Nodes', icon: <RefreshCw size={18} /> },
                          { id: 'map', label: 'Neural Map', icon: <Brain size={18} /> },
                          { id: 'quiz', label: 'Rapid Assessment', icon: <HelpCircle size={18} /> },
                        ].map(v => (
                          <button key={v.id} onClick={() => setNotesView(v.id)}
                            className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all relative group overflow-hidden ${
                              notesView === v.id ? 'text-white' : 'hover:bg-white/5 text-slate-500'
                            }`}>
                            {notesView === v.id && (
                               <motion.div layoutId="notes-tab-bg" className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-[1.5rem] -z-10" />
                            )}
                            {v.icon} {v.label}
                          </button>
                        ))}
                      </div>

                      {/* Content Area */}
                      <div className="lg:col-span-3 glass-card p-10 rounded-[3rem] min-h-[600px] border-white/10 inner-glow relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={notesView}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {notesView === 'summary' && (
                              <div className="prose prose-invert max-w-none prose-h3:text-primary prose-h3:font-black prose-h3:uppercase prose-h3:tracking-widest" dangerouslySetInnerHTML={{ __html: notesData.summaryHTML }} />
                            )}
                            {notesView === 'cards' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {notesData.flashcards.map((card, i) => (
                                  <div key={i} className="h-64 perspective-1000 cursor-pointer group" onClick={() => setFlippedCard(flippedCard === i ? null : i)}>
                                    <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flippedCard === i ? 'rotate-y-180' : ''}`}>
                                      <div className="absolute inset-0 glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center text-center backface-hidden border-white/10 group-hover:border-primary/50 transition-colors">
                                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">Query</p>
                                        <p className="font-black text-xl text-white tracking-tight leading-tight">{card.front}</p>
                                      </div>
                                      <div className="absolute inset-0 bg-primary rounded-[2rem] p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.4)]">
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Response</p>
                                        <p className="font-black text-xl text-white tracking-tight leading-tight">{card.back}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {notesView === 'map' && (
                               <div className="space-y-6">
                                 <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3"><Brain className="text-primary" /> Neural Concept Matrix</h3>
                                 <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5 inner-glow">
                                   <pre className="text-xs font-mono text-primary/80 leading-relaxed whitespace-pre-wrap">
                                     {JSON.stringify(notesData.mindMap, null, 2)}
                                   </pre>
                                 </div>
                               </div>
                            )}
                            {notesView === 'quiz' && (
                              <div className="space-y-8">
                                {notesData.quiz.map((q, i) => (
                                  <div key={i} className="glass-card p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                                    <div className="flex items-center gap-4 mb-6">
                                       <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-primary">{i+1}</span>
                                       <p className="font-black text-white text-lg tracking-tight leading-tight">{q.question}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 ml-14">
                                      {q.options.map((opt, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl border font-bold text-sm transition-all ${
                                          idx === q.correct 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                                            : 'bg-white/5 border-white/10 text-slate-500'
                                        }`}>
                                          {opt}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-6 ml-14 flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                       <Lightbulb size={16} className="text-primary" />
                                       <p className="text-xs text-primary font-bold italic leading-relaxed">{q.explanation}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMode === MODES.TOPIC && (
                <div className="space-y-8">
                  <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-wrap gap-8 items-end inner-glow holographic-hover">
                    <div className="flex-1 min-w-[300px] space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Topic Identifier</label>
                      <input type="text" placeholder="Quantum Physics / Bio-Cell Structure" 
                        value={revTopic} onChange={(e) => setRevTopic(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-white font-black tracking-tight text-lg" />
                    </div>
                    <FuturisticButton onClick={handleTopicRevision} disabled={loading || !revTopic} className="px-12 py-4">
                      {loading ? 'Synthesizing...' : 'Generate Core Sheet'}
                    </FuturisticButton>
                  </motion.div>

                  {revisionSheet && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-12 rounded-[3.5rem] border-white/10 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary/20 rounded-2xl">
                              <Zap className="text-primary" size={28} />
                           </div>
                           <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{revTopic}</h2>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                          <Download size={14} /> Export Node
                        </button>
                      </div>
                      <div className="prose prose-invert max-w-none prose-h3:text-primary prose-h3:font-black prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-sm prose-h3:mt-10" dangerouslySetInnerHTML={{ __html: revisionSheet }} />
                    </motion.div>
                  )}
                </div>
              )}

              {activeMode === MODES.SPACED && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3"><RefreshCw size={24} className="text-primary animate-spin-slow" /> Synchronization Queue</h3>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{spacedSchedule.length} Nodes Pending</span>
                      </div>
                      
                      {spacedSchedule.length === 0 ? (
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="glass-card p-20 rounded-[3rem] text-center space-y-6 border-white/5"
                        >
                          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 size={40} />
                          </div>
                          <div className="space-y-2">
                             <p className="text-white font-black uppercase tracking-[0.3em]">Synch Complete</p>
                             <p className="text-sm text-slate-500 font-medium">No neural nodes are currently due for re-synchronization.</p>
                          </div>
                          <button onClick={() => setActiveMode(MODES.TOPIC)} className="text-primary text-xs font-black uppercase tracking-widest hover:text-white transition-all">Expand Neural Map →</button>
                        </motion.div>
                      ) : (
                        <div className="space-y-5">
                          {spacedSchedule.map((item, i) => (
                             <motion.div 
                               key={i} 
                               whileHover={{ x: 10 }}
                               className="glass-card p-8 rounded-[2.5rem] flex items-center justify-between border-white/5 holographic-hover"
                             >
                               <div className="space-y-2">
                                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-80">{item.subject} Node</p>
                                 <h4 className="text-xl font-black text-white tracking-tight">{item.topic}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>Sync Loop: {item.repetitions}</span>
                                    <span>•</span>
                                    <span>Next Window: {item.nextRevisionDate}</span>
                                 </div>
                               </div>
                               <div className="flex gap-3">
                                 <button className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500/10 transition-all"><Trash2 size={20} /></button>
                                 <FuturisticButton className="px-10">Start Sync</FuturisticButton>
                               </div>
                             </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                       <h3 className="text-2xl font-black text-white tracking-tighter uppercase px-2">Global Retention</h3>
                       <div className="space-y-6">
                        <div className="glass-card p-8 rounded-[2.5rem] border-white/5 inner-glow relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                             <Zap size={60} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Stability Streak</p>
                          <p className="text-4xl font-black text-orange-500 tracking-tighter">12 Cycles 🔥</p>
                        </div>
                        <div className="glass-card p-8 rounded-[2.5rem] border-white/5 inner-glow relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                             <Brain size={60} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Mastered Nodes</p>
                          <p className="text-4xl font-black text-emerald-500 tracking-tighter">48 Nodes</p>
                        </div>
                      </div>
                      <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                        <p className="text-xs text-primary leading-relaxed font-bold relative z-10">
                          💡 <strong className="uppercase tracking-widest text-[10px] ml-1">Quantum Tip:</strong> Spaced repetition stabilizes neural connections from short-term volatile memory into long-term persistent storage. Revise when the sync window opens for 99% retention.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SmartRevision;
