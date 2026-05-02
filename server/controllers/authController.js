import { supabase } from '../config/supabase.js';

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
    
    if (!data.session) {
      // Supabase email confirmation might be enabled, but we assume it's disabled or we just return success
      return res.status(400).json({ message: 'Please verify your email or contact support.' });
    }

    res.status(201).json({
      _id: data.user.id,
      name: data.user.user_metadata?.name || name,
      email: data.user.email,
      token: data.session.access_token
    });
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

    res.json({
      _id: data.user.id,
      name: data.user.user_metadata?.name,
      email: data.user.email,
      token: data.session.access_token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
