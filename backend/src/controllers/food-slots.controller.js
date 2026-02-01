import { supabase } from '../config/supabase.js';

export const getFoodSlots = async (req, res, next) => {
  try {
    const { date, meal_type } = req.query;

    let query = supabase
      .from('food_slots')
      .select(`
        id,
        slot_date,
        start_time,
        end_time,
        meal_type,
        max_capacity,
        booked_count
      `)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (date) {
      query = query.eq('slot_date', date);
    }

    if (meal_type) {
      query = query.eq('meal_type', meal_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      slots: data
    });
  } catch (err) {
    next(err);
  }
};
