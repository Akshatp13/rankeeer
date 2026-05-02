import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { 
  BrainCircuit, AlertCircle, RotateCcw, CheckCircle2, XCircle, Clock, 
  Upload, FileText, Eye, EyeOff, X, BookOpen, StickyNote, BarChart3, 
  ChevronRight, Brain, Zap, Loader2, Play, Sparkles, Target, TrendingUp, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FuturisticButton from '../components/FuturisticButton';
import { EXAMS } from './ExamCatalog';
import { addTestResult, computeWeakTopics } from '../redux/testResultsSlice';

// ─── File extraction helpers ─────────────────────────────────────────────────
const extractPdfText = async (file) => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(' ') + '\n';
  }
  return text;
};
const toBase64 = (file) => new Promise(resolve => {
  const r = new FileReader();
  r.onload = () => resolve(r.result.split(',')[1]);
  r.readAsDataURL(file);
});

// ─── Exam-to-subjects map ────────────────────────────────────────────────────
const EXAM_SUBJECTS = {
  jee:  ['Physics', 'Chemistry', 'Mathematics'],
  neet: ['Physics', 'Chemistry', 'Biology'],
  upsc: ['History', 'Geography', 'Polity', 'Economy', 'Science & Tech', 'Current Affairs', 'Ethics'],
  cat:  ['Verbal Ability & RC', 'Data Interpretation & LR', 'Quantitative Aptitude'],
  gate: ['Engineering Mathematics', 'Core Engineering Subject'],
  ssc:  ['General Intelligence', 'English', 'Quantitative Aptitude', 'General Awareness'],
  ibps: ['Reasoning', 'English', 'Quantitative Aptitude', 'General Awareness', 'Computer'],
  nda:  ['Mathematics', 'General Ability Test'],
  clat: ['English', 'Current Affairs', 'Legal Reasoning', 'Logical Reasoning', 'Quantitative Techniques'],
  cuet: ['English', 'Domain Subjects', 'General Test'],
  rrb:  ['Mathematics', 'General Intelligence', 'General Awareness', 'General Science'],
  ca:   ['Principles of Accounting', 'Business Law', 'Business Mathematics', 'Business Economics'],
};
const DEFAULT_SUBJECTS = ['Reasoning', 'English', 'Quantitative Aptitude', 'General Awareness'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const QUESTION_COUNTS = [10, 20, 30];
const SCREEN = { CONFIG: 'config', LOADING: 'loading', TEST: 'test', RESULTS: 'results' };
const MODES = { SYLLABUS: 'syllabus', NOTES: 'notes' };
const QTYPES = ['MCQ', 'True-False', 'Mixed'];

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

const TestGenerator = () => {
  const { user, token } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedExam = user?.selectedExam || null;
  const examObj = EXAMS.find(e => e.id === selectedExam);
  const subjects = EXAM_SUBJECTS[selectedExam] || DEFAULT_SUBJECTS;

  const [mode, setMode] = useState(MODES.SYLLABUS);
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [practiceMode, setPracticeMode] = useState(true);
  const [notesFile, setNotesFile] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [notesImage, setNotesImage] = useState(null);
  const [notesMime, setNotesMime] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notesDiff, setNotesDiff] = useState('Mixed');
  const [notesQCount, setNotesQCount] = useState(10);
  const [notesQType, setNotesQType] = useState('MCQ');
  const [notesFocus, setNotesFocus] = useState('');
  const [loadStep, setLoadStep] = useState('');
  const [screen, setScreen] = useState(SCREEN.CONFIG);
  const [testData, setTestData] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => { setSubject(subjects[0]); }, [selectedExam]);

  const handleFilePick = async (file) => {
    if (!file) return;
    setNotesFile(file); setNotesText(''); setNotesImage(null); setExtracting(true); setError('');
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt') { setNotesText(await file.text()); }
      else if (ext === 'pdf') { setNotesText(await extractPdfText(file)); }
      else { setNotesImage(await toBase64(file)); setNotesMime(file.type); }
    } catch (e) { setError('Matrix error: ' + e.message); }
    finally { setExtracting(false); }
  };

  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFilePick(f); };

  const handleGenerateFromNotes = async () => {
    setError(''); setLoadStep('📄 Decrypting Data Packets...');
    setScreen(SCREEN.LOADING);
    try {
      setLoadStep('🧠 Synthesizing Neural Matrix...');
      const { data } = await axios.post('/api/ai/generate-test-from-notes', {
        notesText: notesText || undefined,
        notesImage: notesImage || undefined,
        mimeType: notesMime || undefined,
        numQuestions: notesQCount,
        difficulty: notesDiff,
        questionType: notesQType,
        focusArea: notesFocus,
        selectedExam: examObj?.name || selectedExam || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setLoadStep('✅ Synchronized!');
      const test = data.test;
      test._extractedText = data.extractedText;
      setTestData(test);
      setCurrentQ(0);
      setUserAnswers({});
      setTimeLeft((test.duration || notesQCount * 1.5) * 60);
      setScreen(SCREEN.TEST);
    } catch (err) {
      setError(err.response?.data?.error || 'Neural link failed. Attempt re-sync.');
      setScreen(SCREEN.CONFIG);
    }
  };

  const computeTopicBreakdown = (questions, answers) => {
    const map = {};
    questions.forEach((q, i) => {
      if (!map[q.topic]) {
        map[q.topic] = {
          name: q.topic,
          subject: (testData && testData.subject) || subject || 'General',
          attempted: 0, correct: 0, wrong: 0, skipped: 0
        };
      }
      const ua = answers[i];
      map[q.topic].attempted++;
      if (ua === undefined || ua === null) map[q.topic].skipped++;
      else if (ua === q.correct) map[q.topic].correct++;
      else map[q.topic].wrong++;
    });
    return Object.values(map);
  };

  useEffect(() => {
    if (screen === SCREEN.RESULTS && testData && !testData._dispatched) {
      const r = calcResults();
      const timeTaken = (testData.duration || numQuestions * 1.5) * 60 - timeLeft;
      dispatch(addTestResult({
        source: "ai-test",
        exam: user.selectedExam,
        subject: testData.subject || subject,
        score: r.score,
        accuracy: r.accuracy,
        timeTaken: timeTaken,
        questions: testData.questions.map((q, i) => ({
          id: q.id || i,
          topic: q.topic,
          subject: testData.subject || subject,
          userAnswer: userAnswers[i] ?? null,
          correct: q.correct,
          isCorrect: userAnswers[i] === q.correct,
        })),
        topicBreakdown: computeTopicBreakdown(testData.questions, userAnswers),
      }));
      dispatch(computeWeakTopics());
      setTestData(prev => ({ ...prev, _dispatched: true }));
    }
  }, [screen]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleGenerate = async () => {
    setError(''); setLoadStep('🚀 Initializing Neural Forge...');
    setScreen(SCREEN.LOADING);
    try {
      const { data } = await axios.post('/api/ai/generate-test', {
        selectedExam: examObj?.name || 'General',
        subject, difficulty, numQuestions,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setTestData(data);
      setCurrentQ(0);
      setUserAnswers({});
      setTimeLeft((data.duration || numQuestions * 1.5) * 60);
      setScreen(SCREEN.TEST);
    } catch (err) {
      setError(err.response?.data?.error || 'Forge error. Attempting secondary link...');
      setScreen(SCREEN.CONFIG);
    }
  };

  const handleAnswer = (qIdx, optIdx) => {
    const newAnswers = { ...userAnswers, [qIdx]: optIdx };
    setUserAnswers(newAnswers);
    if (practiceMode && currentQ < testData.questions.length - 1) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 800);
    }
  };

  const calcResults = () => {
    if (!testData) return { correct: 0, wrong: 0, skipped: 0, score: 0, accuracy: 0 };
    let correct = 0, wrong = 0;
    testData.questions.forEach((q, i) => {
      if (userAnswers[i] === undefined) return;
      if (userAnswers[i] === q.correct) correct++;
      else wrong++;
    });
    const skipped = testData.questions.length - correct - wrong;
    return { correct, wrong, skipped, score: correct * 4 - wrong, accuracy: Math.round((correct / testData.questions.length) * 100) };
  };

  const reset = () => { setScreen(SCREEN.CONFIG); setTestData(null); setUserAnswers({}); };

  // ── CONFIG screen ──────────────────────────────────────────────────────────
  if (screen === SCREEN.CONFIG) return (
    <div className="min-h-screen">
      <Topbar /><Sidebar />
      <main className="pl-72 pt-28 p-8 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10">
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]">
               <BrainCircuit className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Neural Forge</h1>
              {examObj && <p className="text-primary font-black tracking-widest text-[10px] uppercase ml-1 opacity-80 mt-1">Configuring Test for {examObj.name}</p>}
            </div>
          </motion.div>

          {!selectedExam && (
            <motion.div variants={itemVariants} className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-4 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="text-amber-500" />
              </div>
              <p className="text-white font-bold tracking-tight">
                Neural Link Missing: Select an exam in <Link to="/settings" className="text-amber-500 underline font-black">System Configurations</Link>.
              </p>
            </motion.div>
          )}

          {error && <motion.div variants={itemVariants} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-black uppercase tracking-widest">{error}</motion.div>}

          {/* Mode Selector */}
          <motion.div variants={itemVariants} className="flex p-1.5 bg-white/5 border border-white/10 rounded-3xl w-fit mx-auto backdrop-blur-2xl">
            {[
              { id: MODES.SYLLABUS, label: 'Syllabus Node', icon: <BookOpen size={18} /> },
              { id: MODES.NOTES, label: 'Data Packets', icon: <StickyNote size={18} /> },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 relative overflow-hidden group ${
                  mode === m.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {mode === m.id && (
                  <motion.div layoutId="mode-bg" className="absolute inset-0 bg-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]" />
                )}
                <span className="relative z-10">{m.icon}</span>
                <span className="relative z-10">{m.label}</span>
              </button>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] border-white/10 inner-glow holographic-hover">
            {mode === MODES.SYLLABUS ? (
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Neural Branch (Subject)</label>
                  <div className="flex flex-wrap gap-3">
                    {subjects.map(s => (
                      <button key={s} onClick={() => setSubject(s)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${subject === s ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/30'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Complexity Level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {DIFFICULTIES.map(d => (
                        <button key={d} onClick={() => setDifficulty(d)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${difficulty === d ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.2)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/30'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Iteration Count</label>
                    <div className="grid grid-cols-3 gap-2">
                      {QUESTION_COUNTS.map(n => (
                        <button key={n} onClick={() => setNumQuestions(n)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${numQuestions === n ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.2)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/30'}`}>
                          {n} Qs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-6 inner-glow">
                  <div>
                    <p className="font-black text-xs text-white uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-primary" /> Instant Feedback</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Reveal neural solutions immediately after selection</p>
                  </div>
                  <button onClick={() => setPracticeMode(!practiceMode)}
                    className={`w-14 h-7 rounded-full transition-all relative ${practiceMode ? 'bg-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]' : 'bg-white/10'}`}>
                    <motion.div animate={{ x: practiceMode ? 28 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                  </button>
                </div>

                <FuturisticButton onClick={handleGenerate} className="w-full py-5 text-xl">
                   Initialize Forge Matrix
                </FuturisticButton>
              </div>
            ) : (
              <div className="space-y-10">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all group ${notesFile ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 bg-black/20'}`}
                >
                  <input type="file" id="notes-upload" className="hidden" accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={(e) => handleFilePick(e.target.files[0])} />
                  <label htmlFor="notes-upload" className="cursor-pointer">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-20 h-20 bg-primary/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:bg-primary/30 transition-colors"
                    >
                      <Upload className="text-primary" size={40} />
                    </motion.div>
                    {notesFile ? (
                      <div className="space-y-2">
                        <p className="font-black text-xl text-white tracking-tight">{notesFile.name}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{(notesFile.size / 1024).toFixed(1)} KB · Packet Synchronized</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-black text-xl text-white tracking-tighter uppercase">Sync Data Packet</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">PDF, Image, or Text Nodes (Max 20MB)</p>
                      </div>
                    )}
                  </label>
                  {notesFile && (
                    <button onClick={() => { setNotesFile(null); setNotesText(''); setNotesImage(null); }} className="mt-6 text-[10px] font-black text-rose-500 hover:text-rose-400 flex items-center gap-2 mx-auto uppercase tracking-widest transition-colors">
                      <X size={14} /> Clear Node
                    </button>
                  )}
                </div>

                {(notesText || notesImage) && !extracting && (
                  <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden inner-glow">
                    <button onClick={() => setShowPreview(!showPreview)} className="w-full flex items-center justify-between p-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-slate-400 hover:text-primary">
                      <span className="flex items-center gap-3"><FileText size={18} className="text-primary" /> {notesText ? 'Neural Extraction Success' : 'Visual Scan Pending'}</span>
                      {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {showPreview && notesText && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="p-6 border-t border-white/5 bg-black/40 max-h-48 overflow-y-auto text-[10px] text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">
                        {notesText}
                      </motion.div>
                    )}
                  </div>
                )}

                {extracting && (
                  <div className="flex items-center justify-center gap-4 p-5 bg-primary/10 rounded-2xl border border-primary/20 animate-pulse">
                    <Loader2 className="animate-spin text-primary" size={20} />
                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Running Neural Scan...</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Complexity</label>
                    <select value={notesDiff} onChange={(e) => setNotesDiff(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary">
                      {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Node Count</label>
                    <select value={notesQCount} onChange={(e) => setNotesQCount(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary">
                      {QUESTION_COUNTS.map(n => <option key={n} value={n} className="bg-slate-900">{n} Questions</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Neural Architecture (Type)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {QTYPES.map(t => (
                      <button key={t} onClick={() => setNotesQType(t)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${notesQType === t ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.2)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/30'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Focus Logic Node</label>
                  <input type="text" value={notesFocus} onChange={(e) => setNotesFocus(e.target.value)} placeholder="e.g. Focus on Quantum Electrodynamics" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm font-black tracking-tight text-white outline-none focus:border-primary placeholder:text-slate-700" />
                </div>

                <FuturisticButton onClick={handleGenerateFromNotes} disabled={!notesFile || extracting} className="w-full py-5 text-xl">
                   Forge from Data Packet
                </FuturisticButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );

  // ── LOADING screen ─────────────────────────────────────────────────────────
  if (screen === SCREEN.LOADING) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.15),transparent_70%)]" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="w-40 h-40 border-[3px] border-primary/20 border-t-primary rounded-full relative flex items-center justify-center"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-primary/10 rounded-full blur-xl"
        />
        <BrainCircuit size={48} className="text-primary absolute" />
      </motion.div>
      <div className="text-center mt-12 relative z-10">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{loadStep || 'Forging Test...'}</h2>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] max-w-xs leading-relaxed mx-auto">AI is synthesizing questions from the neural database. Matrix alignment in progress.</p>
      </div>
      <div className="mt-12 flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div 
            key={i}
            animate={{ scaleY: [1, 2.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
            className="w-1 h-4 bg-primary rounded-full"
          />
        ))}
      </div>
    </div>
  );

  // ── TEST screen ────────────────────────────────────────────────────────────
  if (screen === SCREEN.TEST && testData) {
    const q = testData.questions[currentQ];
    const progress = ((currentQ + 1) / testData.questions.length) * 100;
    const userAns = userAnswers[currentQ];
    const answered = userAns !== undefined;

    return (
      <div className="min-h-screen">
        <Topbar /><Sidebar />
        <main className="pl-72 pt-28 p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Header bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-primary/20 rounded-lg"><Sparkles size={16} className="text-primary" /></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{testData.subject} Node · Iteration {testData.title}</p>
                </div>
                <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)] transition-all"
                  />
                </div>
              </div>
              <div className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xl tracking-tighter ${timeLeft < 120 ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)] animate-pulse' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                <Clock size={20} />{formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
              {/* Question */}
              <div className="flex-1 space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-10 rounded-[3rem] border-white/10 inner-glow relative"
                  >
                    <div className="flex justify-between items-start mb-10">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Query {currentQ + 1} // {testData.questions.length}</span>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">{q.topic}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tighter leading-tight mb-12">{q.question}</h3>
                    <div className="space-y-4">
                      {q.options.map((opt, i) => {
                        let cls = 'bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/5';
                        if (answered) {
                          if (i === q.correct) cls = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
                          else if (i === userAns && i !== q.correct) cls = 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.1)]';
                          else cls = 'bg-black/20 border-white/5 text-slate-600 opacity-40';
                        }
                        return (
                          <button key={i} onClick={() => !answered && handleAnswer(currentQ, i)} disabled={answered && !practiceMode}
                            className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center gap-5 group/opt ${cls}`}>
                            <span className="font-black text-sm w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover/opt:bg-primary/20 group-hover/opt:text-primary transition-colors">{String.fromCharCode(65 + i)}</span>
                            <span className="flex-1 font-bold text-sm tracking-tight">{opt}</span>
                            {answered && i === q.correct && <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />}
                            {answered && i === userAns && i !== q.correct && <XCircle size={20} className="text-rose-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {answered && practiceMode && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-[2rem] flex gap-4">
                        <div className="p-3 bg-primary/20 rounded-xl h-fit"><Zap size={20} className="text-primary" /></div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium"><strong>Neural Decryption:</strong> {q.explanation}</p>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between items-center px-4">
                  <button disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}
                    className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-all">
                    Previous Link
                  </button>
                  {currentQ < testData.questions.length - 1
                    ? <FuturisticButton onClick={() => setCurrentQ(p => p + 1)} className="px-10 py-4">Next Node</FuturisticButton>
                    : <FuturisticButton onClick={() => { clearInterval(timerRef.current); setScreen(SCREEN.RESULTS); }} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500">Finalize Matrix</FuturisticButton>
                  }
                </div>
              </div>

              {/* Palette */}
              <div className="w-full lg:w-72 shrink-0 space-y-6">
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 inner-glow holographic-hover">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><BarChart3 size={14} /> Neural Grid</h4>
                  <div className="grid grid-cols-5 gap-3 mb-8">
                    {testData.questions.map((_, i) => (
                      <button key={i} onClick={() => setCurrentQ(i)}
                        className={`h-10 text-[10px] font-black rounded-xl transition-all relative overflow-hidden flex items-center justify-center ${
                          i === currentQ ? 'ring-2 ring-primary ring-offset-4 ring-offset-black scale-110' : ''
                        } ${userAnswers[i] !== undefined ? 'bg-primary text-white shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]' : 'bg-white/5 border border-white/5 text-slate-600 hover:border-white/20'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                       <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_5px_rgba(var(--color-primary-rgb),0.5)]" /> Answered Node
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                       <div className="w-3 h-3 bg-white/5 border border-white/10 rounded-full" /> Pending Node
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-[2rem]">
                   <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><AlertCircle size={14} /> Matrix Warning</p>
                   <p className="text-[9px] text-slate-500 font-medium leading-relaxed">Exiting the neural link before finalization will result in data corruption. All progress will be lost.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── RESULTS screen ─────────────────────────────────────────────────────────
  if (screen === SCREEN.RESULTS && testData) {
    const r = calcResults();
    return (
      <div className="min-h-screen">
        <Topbar /><Sidebar />
        <main className="pl-72 pt-28 p-8 max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10 text-center">
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
               <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-500/20">
                  <CheckCircle2 size={48} className="text-emerald-500" />
               </div>
               <div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Matrix Finalized</h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Simulation protocol successfully terminated</p>
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ResultStat label="Neural Accuracy" value={`${r.accuracy}%`} accent="blue" icon={<Target size={18} />} />
              <ResultStat label="Logic Score" value={r.score} accent="emerald" icon={<Activity size={18} />} />
              <ResultStat label="Correct Nodes" value={r.correct} accent="emerald" icon={<CheckCircle2 size={18} />} />
              <ResultStat label="Corruption" value={r.wrong} accent="rose" icon={<XCircle size={18} />} />
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-12 rounded-[3.5rem] border-white/10 inner-glow holographic-hover text-left relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                     <Brain size={24} className="text-primary" />
                     Post-Simulation Analysis
                  </h3>
                  <div className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                     Lvl {r.accuracy > 80 ? 'Alpha' : r.accuracy > 50 ? 'Beta' : 'Gamma'} Sync
                  </div>
               </div>
               <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                  Your neural performance in <strong>{testData.subject}</strong> shows stability. However, data corruption was detected in secondary logic gates. Recommended: Recalibrate using the Smart Revision module.
               </p>
               
               <div className="flex flex-col sm:flex-row gap-6">
                 <FuturisticButton onClick={reset} className="flex-1 py-5 text-lg">
                    Re-Initialize Forge
                 </FuturisticButton>
                 {testData._extractedText && (
                   <button onClick={() => { setNotesText(testData._extractedText); setMode(MODES.NOTES); setShowPreview(true); setScreen(SCREEN.CONFIG); }}
                     className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-[2rem] py-5 font-black text-[10px] uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-3">
                     <FileText size={18} className="text-primary" /> View Data Packet
                   </button>
                 )}
               </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }
  return null;
};

const ResultStat = ({ label, value, accent, icon }) => (
  <div className="glass-card p-8 rounded-[2.5rem] border-white/10 inner-glow relative group cursor-default">
    <div className={`absolute -right-10 -top-10 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity bg-${accent === 'blue' ? 'blue' : accent}-500`} />
    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 text-${accent === 'blue' ? 'primary' : accent}-500`}>
      {icon}
    </div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

export default TestGenerator;
