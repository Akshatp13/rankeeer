import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { supabase } from '../config/supabaseClient';
import { loginSuccess } from '../redux/authSlice';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session) {
          navigate('/login');
          return;
        }

        // Call our backend API to verify the token and get/create user stats
        const { data } = await api.post('/api/auth/google', { 
          accessToken: session.access_token 
        });

        const userData = {
          id: data._id,
          name: data.name,
          email: data.email,
          isNewUser: data.isNewUser
        };

        dispatch(loginSuccess({ user: userData, token: data.token }));

        if (data.isNewUser) {
          navigate('/exam-catalog');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error during auth callback:', err);
        navigate('/login?error=OAuth failed');
      }
    };

    handleAuthCallback();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 relative mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authenticating...</h2>
      <p className="text-slate-500 dark:text-slate-400">Please wait while we finalize your sign-in.</p>
    </div>
  );
};

export default AuthCallback;
