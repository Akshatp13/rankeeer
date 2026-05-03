import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AIChat from '../components/AIChat';
import Button from '../components/FuturisticButton';
import api from '../utils/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { 
  Target, TrendingUp, Award, Zap, PlayCircle, MessageSquare, 
  BookOpen, Laptop, Clock, ArrowUp, ArrowDown, Sparkles,
  ShieldCheck, Activity, Globe, Cpu, Command, Calendar,
  ChevronRight, Flame, Trophy, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { EXAMS } from './ExamCatalog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, leaderboardRes, historyRes, activityRes] = await Promise.all([
        api.get('/api/stats/me'),
        api.get('/api/stats/leaderboard'),
        api.get('/api/stats/history'),
        api.get('/api/stats/activity')
      ]);

      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
      setHistory(historyRes.data);
      setActivities(activityRes.data);
      
      // Try to load study plan from localStorage
      const cachedPlan = localStorage.getItem(`study_plan_${user?._id}`);
      if (cachedPlan) {
        setStudyPlan(JSON.parse(cachedPlan));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlan = async () => {
    setIsPlanLoading(true);
    try {
      const { data } = await api.post('/api/ai/study-plan', {
        hoursPerDay: 4,
        daysUntilExam: 30,
        weakTopics: [],
        selectedExam: user?.selectedExam
      });
      setStudyPlan(data);
      localStorage.setItem(`study_plan_${user?._id}`, JSON.stringify(data));
    } catch (err) {
      console.error('Study plan error:', err);
    } finally {
      setIsPlanLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const selectedExamObj = EXAMS.find(e => e.id === user?.selectedExam);
  const examLabel = selectedExamObj?.name || 'Standard Exam';

  // Level progress calculation
  const currentXP = stats?.xp || 0;
  const level = stats?.level || 1;
  const xpInCurrentLevel = currentXP % 500;
  const xpToNextLevel = 500 - xpInCurrentLevel;
  const progressPercent = (xpInCurrentLevel / 500) * 100;

  // Chart data formatting
  const scoreData = [...history].reverse().map((h, i) => ({
    name: `Test ${i + 1}`,
    score: h.accuracy
  }));

  const subjectData = history.reduce((acc, curr) => {
    const existing = acc.find(a => a.subject === curr.subject);
    if (existing) {
      existing.accuracy = (existing.accuracy + curr.accuracy) / 2;
    } else {
      acc.push({ subject: curr.subject, accuracy: curr.accuracy });
    }
    return acc;
  }, []);

  const getLeague = (xp) => {
    if (xp >= 5000) return { name: 'Platinum', color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
    if (xp >= 2500) return { name: 'Gold', color: 'text-amber-400', bg: 'bg-amber-400/10' };
    if (xp >= 1000) return { name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-300/10' };
    return { name: 'Bronze', color: 'text-orange-500', bg: 'bg-orange-500/10' };
  };

  const league = getLeague(currentXP);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar />
        <Sidebar />
        <main className="pl-64 pt-16 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Initializing Neural Pathways...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <Sidebar />
      
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                    {firstName[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black px-2 py-1 rounded-md border-2 border-background">
                    Lvl {level}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                     <Calendar size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">{today}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Welcome back, {firstName}!
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                      <Flame size={16} fill="currentColor" />
                      {stats?.current_streak || 0} Day Streak
                    </div>
                    <div className={`flex items-center gap-1.5 ${league.color} font-bold text-sm px-2 py-0.5 rounded-md ${league.bg}`}>
                      <Trophy size={14} />
                      {league.name} League
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="md" onClick={() => navigate('/settings')}>
                  Edit Profile
                </Button>
                <Button variant="primary" size="md" onClick={() => navigate('/test-gen')}>
                  New Test
                </Button>
              </div>
            </motion.div>

            {/* XP Progress Bar */}
            <motion.div variants={itemVariants} className="card p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-none relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Zap size={120} className="text-white" />
               </div>
               <div className="relative z-10">
                 <div className="flex justify-between items-end mb-4">
                   <div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">XP Progress</p>
                     <h2 className="text-2xl font-bold text-white flex items-baseline gap-2">
                       {currentXP} <span className="text-sm font-medium text-slate-400">Total XP</span>
                     </h2>
                   </div>
                   <div className="text-right">
                     <p className="text-primary text-xs font-bold mb-1">{xpToNextLevel} XP to Level {level + 1}</p>
                     <p className="text-white text-lg font-bold">Level {level}</p>
                   </div>
                 </div>
                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progressPercent}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full bg-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"
                   />
                 </div>
               </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={<Target className="text-blue-600"/>} 
                title="Avg. Accuracy" 
                value={`${stats?.average_score || 0}%`} 
                trend={stats?.average_score > 70 ? "up" : "down"} 
                trendValue="vs last" 
                color="blue"
              />
              <StatCard 
                icon={<Laptop className="text-purple-600"/>} 
                title="Total Tests" 
                value={stats?.total_tests || 0} 
                trend="up" 
                trendValue="+1 today" 
                color="purple"
              />
              <StatCard 
                icon={<Award className="text-emerald-600"/>} 
                title="Global Rank" 
                value={`#${stats?.rank || '---'}`} 
                trend="up" 
                trendValue="Top 5%" 
                color="emerald"
              />
              <StatCard 
                icon={<BookOpen className="text-rose-600"/>} 
                title="Revisions" 
                value={stats?.total_revisions || 0} 
                trend="up" 
                trendValue="Active" 
                color="rose"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Charts */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                <div className="card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="text-primary" size={20} />
                      Score Progression
                    </h3>
                  </div>
                  <div className="h-64 w-full">
                    {scoreData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={scoreData}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <PlayCircle size={40} className="mb-2 opacity-20" />
                        <p className="text-sm">No test data yet. Start your first test!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <div className="card p-6 flex flex-col justify-between">
                    <h3 className="font-bold mb-4">Quick Launch</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <ActionButton icon={<Zap size={16}/>} label="Test" color="blue" to="/test-gen" />
                      <ActionButton icon={<BookOpen size={16}/>} label="Revise" color="emerald" to="/revision" />
                      <ActionButton icon={<MessageSquare size={16}/>} label="Mentor" color="purple" to="/chat" />
                      <ActionButton icon={<TrendingUp size={16}/>} label="Predict" color="rose" to="/predictor" />
                    </div>
                  </div>

                  {/* Leaderboard Small */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-bold flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Leaderboard</h3>
                       <span className="text-[10px] font-black uppercase text-slate-400">Top 5</span>
                    </div>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${entry.user_id === user?._id ? 'bg-primary/10 border border-primary/20' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                            <span className="text-xs font-bold truncate max-w-[80px]">{entry.name || 'Anonymous'}</span>
                          </div>
                          <span className="text-xs font-black text-primary">{entry.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sidebar Panel: Activity + Study Plan */}
              <motion.div variants={itemVariants} className="space-y-8">
                {/* Recent Activity */}
                <div className="card p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    <Activity size={18} className="text-primary opacity-50" />
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    {activities.length > 0 ? activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors`}>
                          {activity.activity_type === 'test' ? <Target size={18} className="text-blue-500" /> : 
                           activity.activity_type === 'revision' ? <BookOpen size={18} className="text-emerald-500" /> : <MessageSquare size={18} className="text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400">{new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-[10px] font-black text-primary">+{activity.xp_earned} XP</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>

                {/* Study Plan Widget */}
                <div className="card p-8 bg-primary/5 border-primary/10">
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-bold flex items-center gap-2">
                       <CheckCircle2 size={18} className="text-primary" />
                       Study Plan
                     </h3>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={generatePlan} 
                       disabled={isPlanLoading}
                       className="h-8 w-8 p-0 rounded-full"
                     >
                       <Sparkles size={14} className={isPlanLoading ? 'animate-pulse' : ''} />
                     </Button>
                   </div>

                   {studyPlan ? (
                     <div className="space-y-4">
                       <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/20 shadow-sm">
                         <p className="text-[10px] font-black uppercase text-primary mb-1">Today's Focus</p>
                         <p className="font-bold text-sm mb-2">{studyPlan.plan[0]?.sessions[0]?.topic || 'Check Plan'}</p>
                         <div className="flex items-center gap-3">
                           <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock size={12}/> {studyPlan.plan[0]?.sessions[0]?.hours}h</span>
                           <span className="flex items-center gap-1 text-[10px] text-slate-500"><Activity size={12}/> {studyPlan.plan[0]?.sessions[0]?.type}</span>
                         </div>
                       </div>
                       <Button variant="primary" className="w-full py-2 text-xs" onClick={() => navigate('/revision')}>
                         Open Full Plan
                       </Button>
                     </div>
                   ) : (
                     <div className="text-center py-4">
                       <p className="text-xs text-slate-500 mb-4">You haven't generated a study plan yet.</p>
                       <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={generatePlan}
                        disabled={isPlanLoading}
                       >
                         {isPlanLoading ? 'Generating...' : 'Generate Plan'}
                       </Button>
                     </div>
                   )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <AIChat />
    </div>
  );
};

const StatCard = ({ icon, title, value, color, trend, trendValue }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="card p-6 card-hover group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:border-primary/30 transition-colors`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-md ${
            trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
          }`}>
            {trend === 'up' ? <ArrowUp size={12} className="mr-0.5" /> : <ArrowDown size={12} className="mr-0.5" />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
      </div>
    </motion.div>
  );
};

const ActionButton = ({ icon, label, to, color }) => {
  const navigate = useNavigate();
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500 hover:text-white',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white',
  };

  return (
    <button 
      onClick={() => navigate(to)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300 ${colors[color]}`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
};

export default Dashboard;
