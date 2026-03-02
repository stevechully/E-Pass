import { supabase } from '../config/supabase.js';

export const adminMiddleware = async (req, res, next) => {
  try {
    // authMiddleware must already have set req.user
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }

    // Fetch user role from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    if (profile.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required'
      });
    }

    next();

  } catch (err) {
    next(err);
  }
};