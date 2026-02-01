import { supabase } from '../config/supabase.js';

export const getAccommodations = async (req, res, next) => {
  try {
    const { type } = req.query;

    let query = supabase
      .from('accommodations')
      .select(`
        id,
        name,
        accommodation_type,
        capacity,
        price_per_day,
        is_active
      `)
      .eq('is_active', true);

    if (type) {
      query = query.eq('accommodation_type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      accommodations: data
    });
  } catch (err) {
    next(err);
  }
};
