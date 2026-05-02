import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, LogOut, Bell, Search, ChevronDown, Activity, ShieldCheck, Zap, Command, Menu, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/chat': 'AI Study Mentor',
    '/weakness': 'Performance Analysis',
    '/revision': 'Smart Revision Plan',
    '/predictor': 'Rank Predictor',
    '/test-gen': 'Question Generator',
    '/simulator': 'Exam Simulator',
    '/settings': 'Account Settings',
    '/exam-catalog': 'Exams',
  };
  
  const pageTitle = pageTitles[location.pathname] || 'RankRise AI';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-surface border-b border-slate-200 dark:border-slate-800 fixed top-0 right-0 left-0 z-[60] flex items-center justify-between px-6 shadow-sm"
    >
      {/* Brand Section */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            RankRise<span className="text-primary">AI</span>
          </span>
        </div>
      </div>

      {/* Page Title */}
      <div className="hidden md:flex items-center justify-center flex-1">
        <h1 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {pageTitle}
        </h1>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center relative">
           <Search className="absolute left-3 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search anything..." 
             className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 w-48 transition-all focus:w-64 outline-none placeholder:text-slate-500"
           />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium mt-1">Premium Plan</p>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-5 h-5 text-slate-500" />
               )}
            </div>

            <button 
              onClick={handleLogout} 
              className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;
