import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import api from '../utils/api';
import { supabase } from '../config/supabaseClient';
import { Brain, Lock, Mail, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/FuturisticButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      
      const userData = { 
        id: data._id, 
        name: data.name, 
        email: data.email,
        selectedExam: data.selectedExam,
        isNewUser: data.isNewUser
      };

      dispatch(loginSuccess({ user: userData, token: data.token }));
      
      if (data.isNewUser) {
        navigate('/exam-catalog');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
      setGoogleLoading(false);
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
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-sm mb-3 disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {googleLoading ? 'Connecting...' : 'Sign in with Google'}
            </button>

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
