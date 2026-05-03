import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Brain, LogOut, Bell, Search, ChevronDown, Activity, ShieldCheck, Zap, Command, Menu, User, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const Topbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  
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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/stats/activity');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const searchableItems = [
    { title: 'Dashboard', path: '/dashboard', category: 'Page', icon: <Activity size={14} /> },
    { title: 'AI Study Mentor', path: '/chat', category: 'Feature', icon: <Brain size={14} /> },
    { title: 'Performance Analysis', path: '/weakness', category: 'Page', icon: <ShieldCheck size={14} /> },
    { title: 'Smart Revision', path: '/revision', category: 'Page', icon: <Zap size={14} /> },
    { title: 'Rank Predictor', path: '/predictor', category: 'Tool', icon: <Activity size={14} /> },
    { title: 'Test Generator', path: '/test-gen', category: 'Tool', icon: <Command size={14} /> },
    { title: 'Exam Simulator', path: '/simulator', category: 'Tool', icon: <Command size={14} /> },
    { title: 'Account Settings', path: '/settings', category: 'Page', icon: <User size={14} /> },
    { title: 'Exam Catalog', path: '/exam-catalog', category: 'Page', icon: <Search size={14} /> },
    { title: 'JEE Advanced', path: '/exam-catalog', category: 'Exam', icon: <ShieldCheck size={14} /> },
    { title: 'NEET UG', path: '/exam-catalog', category: 'Exam', icon: <ShieldCheck size={14} /> },
    { title: 'UPSC CSE', path: '/exam-catalog', category: 'Exam', icon: <ShieldCheck size={14} /> },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const filtered = searchableItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    setShowSearch(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="hidden lg:flex items-center relative" ref={searchRef}>
           <Search className="absolute left-3 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => handleSearch(e.target.value)}
             onFocus={() => searchQuery.trim() !== '' && setShowSearch(true)}
             placeholder="Search anything..." 
             className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 w-48 transition-all focus:w-64 outline-none placeholder:text-slate-500"
           />

           <AnimatePresence>
             {showSearch && searchResults.length > 0 && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 10 }}
                 className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-[70]"
               >
                 <div className="p-2">
                   {searchResults.map((item, idx) => (
                     <button
                       key={idx}
                       onClick={() => {
                         navigate(item.path);
                         setShowSearch(false);
                         setSearchQuery('');
                       }}
                       className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors text-left group"
                     >
                       <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                         {item.icon}
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                         <p className="text-[10px] text-slate-500 uppercase tracking-tight">{item.category}</p>
                       </div>
                       <ChevronDown className="w-3 h-3 text-slate-300 ml-auto -rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
                     </button>
                   ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 transition-colors rounded-lg relative ${showNotifications ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[70]"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">Recent</span>
                  </div>

                  <div className="max-h-[350px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs text-slate-500">Loading activities...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                notif.activity_type === 'test' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                notif.activity_type === 'revision' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {notif.activity_type === 'test' ? <Activity size={16} /> : 
                                 notif.activity_type === 'revision' ? <CheckCircle2 size={16} /> : 
                                 <Zap size={16} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                  {notif.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Clock size={10} className="text-slate-400" />
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {notif.xp_earned > 0 && (
                                    <span className="text-[10px] font-bold text-amber-500 ml-auto">
                                      +{notif.xp_earned} XP
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">No notifications yet</p>
                        <p className="text-xs text-slate-500 mt-1 px-4">Your activities and achievements will appear here.</p>
                      </div>
                    )}
                  </div>

                  <button className="w-full p-3 text-xs font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800 transition-colors">
                    VIEW ALL ACTIVITY
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
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
