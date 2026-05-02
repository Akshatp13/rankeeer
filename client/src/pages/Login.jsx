import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import axios from 'axios';
import { Brain, Lock, Mail, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/FuturisticButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      dispatch(loginSuccess({ user: { id: data._id, name: data.name, email: data.email }, token: data.token }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 selection:bg-primary/10">
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
           <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-4">
              <Brain className="w-7 h-7 text-white" />
           </div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to continue your preparation</p>
        </div>

        <div className="bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative flex items-center group">
                <Mail className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative flex items-center group">
                <Lock className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-primary hover:underline">Forgot password?</a>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              <span className="bg-surface px-4 text-xs font-medium text-slate-500 uppercase tracking-widest absolute">OR</span>
            </div>

            <button 
              type="button"
              onClick={() => {
                dispatch(loginSuccess({ 
                  user: { 
                    id: 'demo-user', 
                    name: 'Guest User', 
                    email: 'guest@rankrise.ai',
                    selectedExam: 'jee_advanced'
                  }, 
                  token: 'demo-token' 
                }));
                navigate('/dashboard');
              }}
              className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles size={16} className="text-primary" />
              Sign in with Demo Account
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 dark:text-slate-400 mt-8 text-sm">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-bold">Sign up now</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
