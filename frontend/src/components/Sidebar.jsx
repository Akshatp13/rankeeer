import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  BookOpen, 
  LineChart, 
  Settings, 
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  Award
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <MessageSquare size={20} />, label: 'Study Mentor', path: '/chat' },
    { icon: <ShieldCheck size={20} />, label: 'Analysis', path: '/weakness' },
    { icon: <BookOpen size={20} />, label: 'Smart Revision', path: '/revision' },
    { icon: <LineChart size={20} />, label: 'Rank Predictor', path: '/predictor' },
    { icon: <Zap size={20} />, label: 'Question Bank', path: '/test-gen' },
    { icon: <Target size={20} />, label: 'Exam Simulator', path: '/simulator' },
  ];

  return (
    <div className="w-64 bg-surface border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 z-40 flex flex-col pt-20 p-4">
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <span className={`${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>

                {isActive && (
                   <motion.div 
                     layoutId="sidebar-active-indicator"
                     className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                   />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Pro Badge */}
      <div className="mt-auto mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
         <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs mb-1">
           <Award size={14} className="text-primary" />
           Premium Plan
         </div>
         <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-3 leading-relaxed">You have full access to all AI tools and predictors.</p>
         <button className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">View Plan</button>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link to="/settings" className={`
          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group
          ${location.pathname === '/settings' ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
        `}>
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
          <span className="text-sm">Settings</span>
        </Link>
        <div className="px-4 py-3 opacity-60">
           <p className="text-[10px] font-medium text-slate-400">Version 2.4.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
