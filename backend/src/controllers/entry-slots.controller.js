import { supabase } from '../config/supabase.js';

export const getEntrySlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    let query = supabase
      .from('entry_slots')
      .select(`
        id,
        slot_date,
        start_time,
        end_time,
        max_capacity,
        booked_count
      `)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (date) {
      query = query.eq('slot_date', date);
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
