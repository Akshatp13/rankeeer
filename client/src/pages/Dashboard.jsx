import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AIChat from '../components/AIChat';
import Button from '../components/FuturisticButton';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Target, TrendingUp, Award, Zap, PlayCircle, MessageSquare, 
  BookOpen, Laptop, Clock, ArrowUp, ArrowDown, Sparkles,
  ShieldCheck, Activity, Globe, Cpu, Command, Calendar,
  ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { EXAMS } from './ExamCatalog';

const mockAccuracyData = [
  { name: 'Jan', accuracy: 65 },
  { name: 'Feb', accuracy: 72 },
  { name: 'Mar', accuracy: 68 },
  { name: 'Apr', accuracy: 81 },
  { name: 'May', accuracy: 85 },
];

const recentActivity = [
  { id: 1, action: 'JEE Advanced Mock Test #4', score: '81%', time: '2h ago', type: 'test' },
  { id: 2, action: 'Revised Thermodynamics', duration: '45m', time: '5h ago', type: 'revise' },
  { id: 3, action: 'AI Mentor Session: Calculus', topic: 'Calculus', time: 'Yesterday', type: 'chat' },
];

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
  const { user } = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const selectedExamObj = EXAMS.find(e => e.id === user?.selectedExam);
  const examLabel = selectedExamObj?.name || 'Standard Exam';

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
              <div>
                <div className="flex items-center gap-2 text-primary mb-2">
                   <Calendar size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider">{today}</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome back, {firstName}!
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  You have completed <span className="font-semibold text-slate-900 dark:text-white">65%</span> of your preparation for {examLabel}.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="md">
                  Download Report
                </Button>
                <Button variant="primary" size="md">
                  Continue Practice
                </Button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={<Target className="text-blue-600"/>} 
                title="Overall Accuracy" 
                value="85%" 
                trend="up" 
                trendValue="5.2%" 
                color="blue"
              />
              <StatCard 
                icon={<BookOpen className="text-purple-600"/>} 
                title="Study Sessions" 
                value="24" 
                trend="up" 
                trendValue="12%" 
                color="purple"
              />
              <StatCard 
                icon={<Award className="text-emerald-600"/>} 
                title="Current Rank" 
                value="1425" 
                trend="up" 
                trendValue="82" 
                color="emerald"
              />
              <StatCard 
                icon={<Zap className="text-rose-600"/>} 
                title="Test Intensity" 
                value="92" 
                trend="down" 
                trendValue="2.1%" 
                color="rose"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart Section */}
              <motion.div variants={itemVariants} className="lg:col-span-2 card p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-primary" size={20} />
                    Performance Over Time
                  </h3>
                  <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-xs font-semibold outline-none">
                     <option>Last 30 Days</option>
                     <option>Last 3 Months</option>
                  </select>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockAccuracyData}>
                      <defs>
                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderColor: '#e2e8f0', 
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="var(--color-primary)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorAccuracy)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Recent Activity Side Panel */}
              <motion.div variants={itemVariants} className="card p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                  <Link to="/activity" className="text-xs font-bold text-primary hover:underline">View All</Link>
                </div>
                
                <div className="flex-1 space-y-5">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 group cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:border-primary/30 transition-colors`}>
                        {activity.type === 'test' ? <Target size={18} className="text-blue-500" /> : 
                         activity.type === 'revise' ? <BookOpen size={18} className="text-emerald-500" /> : <MessageSquare size={18} className="text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{activity.action}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="secondary" className="mt-8 w-full py-2.5 text-sm">
                  Full History
                </Button>
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
      className="card p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 bg-${color}-50 dark:bg-${color}-900/10 rounded-xl flex items-center justify-center border border-${color}-100 dark:border-${color}-800/50`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
            trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/10'
          }`}>
            {trend === 'up' ? <ArrowUp size={14} className="mr-0.5" /> : <ArrowDown size={14} className="mr-0.5" />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
