import { supabase } from '../config/supabase.js';

/**
 * 🔓 PUBLIC: Get calendar entries for a specific year
 * Provides an informational view of all scheduled events.
 */
export const getCalendarByYear = async (req, res, next) => {
  try {
    const { year } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pooja_calendar')
      .select(`
        id,
        pooja_date,
        event_name,
        is_bookable,
        total_slots,
        available_slots,
        vazhipadu_services!pooja_calendar_service_fk (
          id,
          puja_name,
          price
        )
      `)
      .eq('year', year)
      .gte('pooja_date', today) // ✅ Only show upcoming or today's events
      .order('pooja_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      year: Number(year),
      data: data || []
    });

  } catch (err) {
    next(err);
  }
};

/**
 * 🔓 PUBLIC: Get all calendar dates for a specific special pooja
 * Returns enriched dates including real-time slot availability.
 */
export const getSpecialPoojaDates = async (req, res, next) => {
  try {
    const { service_id, year } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch scheduled dates from the calendar (Future dates only)
    const { data: calendarDates, error: cError } = await supabase
      .from('pooja_calendar')
      .select(`id, pooja_date, total_slots`)
      .eq('service_id', service_id)
      .eq('year', year)
      .eq('is_bookable', true)
      .gte('pooja_date', today) // ✅ Filter out past dates for booking
      .order('pooja_date', { ascending: true });

    if (cError) throw cError;

    // 2. Enrich each date with real-time remaining slots
    const enrichedDates = await Promise.all(
      calendarDates.map(async (entry) => {
        const { count } = await supabase
          .from('vazhipadu_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('puja_id', service_id)
          .eq('booking_date', entry.pooja_date)
          .in('status', ['PENDING', 'CONFIRMED']);

        const remaining = (entry.total_slots || 0) - (count || 0);

        return {
          ...entry,
          available_slots: remaining < 0 ? 0 : remaining
        };
      })
    );

    res.json({
      success: true,
      data: enrichedDates
    });

  } catch (err) {
    next(err);
  }
};

/**
 * 🔐 ADMIN: Create a new calendar entry
 */
export const createCalendarEntry = async (req, res, next) => {
  try {
    const { service_id, pooja_date, is_bookable, total_slots, event_name, description } = req.body;

    if (!service_id || !pooja_date) {
      return res.status(400).json({
        message: 'service_id and pooja_date are required'
      });
    }

    const year = new Date(pooja_date).getFullYear();

    const { data, error } = await supabase
      .from('pooja_calendar')
      .insert({
        service_id,
        pooja_date,
        event_name,
        description,
        year,
        is_bookable: is_bookable ?? true,
        total_slots: total_slots || 0,
        available_slots: total_slots || 0 
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

/**
 * 🔐 ADMIN: Update an existing entry
 */
export const updateCalendarEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_bookable, total_slots, available_slots, event_name, description } = req.body;

    const { data, error } = await supabase
      .from('pooja_calendar')
      .update({
        is_bookable,
        total_slots,
        available_slots,
        event_name,
        description
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

/**
 * 🔐 ADMIN: Delete an entry
 */
export const deleteCalendarEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pooja_calendar')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Calendar entry deleted'
    });

  } catch (err) {
    next(err);
  }
};