import { supabase } from '../config/supabase.js';

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user stats
    let { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Stats don't exist yet, create them
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert([{ user_id: userId }])
        .select()
        .single();
      
      if (createError) throw createError;
      stats = newStats;
    } else if (error) {
      throw error;
    }

    // Get rank from leaderboard view
    const { data: rankData } = await supabase
      .from('leaderboard')
      .select('rank')
      .eq('user_id', userId)
      .single();

    res.json({ ...stats, rank: rankData?.rank || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateXP = async (userId, xpToAdd, activityType, description) => {
  try {
    // 1. Get current stats
    let { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert([{ user_id: userId }])
        .select()
        .single();
      if (createError) throw createError;
      stats = newStats;
    }

    // 2. Update XP and Level
    const newXP = (stats.xp || 0) + xpToAdd;
    const newLevel = Math.floor(newXP / 500) + 1;
    
    // 3. Update Streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = stats.last_active_date;
    let newStreak = stats.current_streak || 0;
    
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const bestStreak = Math.max(newStreak, stats.best_streak || 0);

    const { error: updateError } = await supabase
      .from('user_stats')
      .update({
        xp: newXP,
        level: newLevel,
        current_streak: newStreak,
        best_streak: bestStreak,
        last_active_date: today
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // 4. Log Activity
    await supabase
      .from('activity_log')
      .insert([{
        user_id: userId,
        activity_type: activityType,
        description: description,
        xp_earned: xpToAdd
      }]);

    return { success: true, levelUp: newLevel > stats.level };
  } catch (error) {
    console.error('Error updating XP:', error);
    return { success: false, error: error.message };
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard_details') // We'll create a view for this
      .select('*')
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
