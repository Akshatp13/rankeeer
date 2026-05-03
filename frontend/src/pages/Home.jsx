import { Link } from 'react-router-dom';
import { 
  Brain, TrendingUp, Target, BookOpen, Clock, 
  Sparkles, ShieldCheck, Zap, Globe, ChevronRight,
  ArrowRight, Cpu, Activity, CheckCircle2, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/FuturisticButton';

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
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const Home = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
      {/* Professional Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-surface/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
               <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">RankRise<span className="text-primary">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
             <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Features</a>
             <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">How it works</a>
             <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Sign in</Link>
            <Button onClick={() => window.location.href = '/register'} className="px-5 py-2 text-sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none" />
        
        {/* Hero Section */}
        <section className="container mx-auto px-6 relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-6">
               <Sparkles size={14} className="text-primary" />
               <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI-Powered Exam Preparation</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Master your exams with <br/>
              <span className="text-primary">Intelligent Analytics.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              RankRise AI uses advanced machine learning to identify your weaknesses, generate personalized practice tests, and predict your final rank with high accuracy.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => window.location.href = '/register'} size="lg" className="shadow-lg shadow-primary/20">
                Start for Free <ArrowRight size={18} className="ml-2" />
              </Button>
              <button className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Globe size={18} /> View Success Stories
              </button>
            </motion.div>
          </motion.div>

          {/* Feature Highlight */}
          <motion.div 
            id="features"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            <FeatureCard 
              icon={<BarChart3 className="text-blue-600"/>} 
              title="Performance Analysis" 
              desc="Detailed breakdown of your strengths and weaknesses based on your test history." 
              color="blue"
            />
            <FeatureCard 
              icon={<Cpu className="text-emerald-600"/>} 
              title="Adaptive Learning" 
              desc="Daily study protocols that adapt to your progress and target your gap areas." 
              color="emerald"
            />
            <FeatureCard 
              icon={<TrendingUp className="text-indigo-600"/>} 
              title="Rank Prediction" 
              desc="Accurate forecasting of your competitive exam rank using multi-vector analysis." 
              color="indigo"
            />
            <FeatureCard 
              icon={<Brain className="text-purple-600"/>} 
              title="Question Generator" 
              desc="Instantly create practice questions from any PDF or study material." 
              color="purple"
            />
            <FeatureCard 
              icon={<Target className="text-rose-600"/>} 
              title="Mock Simulator" 
              desc="Realistic exam simulations with real-time performance tracking." 
              color="rose"
            />
            <div className="card p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 bg-primary/[0.02]">
               <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} className="text-primary" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ready to Start?</h3>
               <p className="text-sm text-slate-500 mb-4">Join 10,000+ students preparing with RankRise AI.</p>
               <Button variant="outline" size="sm" onClick={() => window.location.href = '/register'}>Create Account</Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                 <ShieldCheck size={14} className="text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">© 2024 RankRise AI. All rights reserved.</p>
           </div>
           <div className="flex gap-8">
              {['Features', 'How it Works', 'Support', 'Privacy'].map(item => (
                <a key={item} href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{item}</a>
              ))}
           </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <motion.div 
    variants={itemVariants}
    className="card p-8 card-hover"
  >
    <div className={`w-12 h-12 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center mb-6 border border-${color}-100 dark:border-${color}-800/50`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
    
    <div className="flex items-center text-primary text-sm font-bold gap-1 cursor-pointer hover:underline">
       Learn more <ChevronRight size={14} />
    </div>
  </motion.div>
);

export default Home;
