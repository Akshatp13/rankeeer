import { supabase } from '../config/supabase.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // If session is null, Supabase email confirmation is enabled.
    // Return a success response so the user knows to check their email.
    if (!data.session) {
      return res.status(201).json({
        needsConfirmation: true,
        message: 'Account created! Please check your email to confirm your account, then log in.'
      });
    }

    res.status(201).json({
      _id: data.user.id,
      name: data.user.user_metadata?.name || name,
      email: data.user.email,
      token: data.session.access_token
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(data.user.email, data.user.user_metadata?.name || name);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // Check if user has selected an exam (is not a new user)
    const { data: stats } = await supabase
      .from('user_stats')
      .select('selected_exam')
      .eq('user_id', data.user.id)
      .single();

    res.json({
      _id: data.user.id,
      name: data.user.user_metadata?.name,
      email: data.user.email,
      token: data.session.access_token,
      selectedExam: stats?.selected_exam || null,
      isNewUser: !stats?.selected_exam
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken, accessToken } = req.body;

    let authResponse;
    if (idToken) {
      authResponse = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
    } else if (accessToken) {
      // This is less common for Supabase direct backend auth but supported in some flows
      authResponse = await supabase.auth.getUser(accessToken);
    }

    if (authResponse?.error) {
      return res.status(401).json({ message: authResponse.error.message });
    }

    const { data: { user, session } } = authResponse;
    
    // Check if user exists in user_stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    const isNewUser = (statsError && statsError.code === 'PGRST116');

    res.json({
      _id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      email: user.email,
      token: session?.access_token || accessToken,
      isNewUser
    });

    // Send welcome email for new Google users
    if (isNewUser) {
      sendWelcomeEmail(user.email, user.user_metadata?.full_name || user.user_metadata?.name);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExamPreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedExam } = req.body;

    if (!selectedExam) {
      return res.status(400).json({ message: 'selectedExam is required' });
    }

    // Update in user_stats table
    const { error: statsError } = await supabase
      .from('user_stats')
      .upsert({ 
        user_id: userId, 
        selected_exam: selectedExam 
      }, { onConflict: 'user_id' });

    if (statsError) throw statsError;

    res.json({ success: true, selectedExam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
