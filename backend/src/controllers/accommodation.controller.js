import { supabase } from '../config/supabase.js';
import crypto from 'crypto';


/**
 * GET /api/accommodation
 * List available accommodations
 */
export const getAccommodations = async (req, res, next) => {
  try {
    const { type } = req.query;

    let query = supabase
      .from("accommodations")
      .select(`
        id,
        name,
        accommodation_type,
        capacity,
        price_per_day,
        is_active
      `)
      .eq("is_active", true);

    if (type) {
      query = query.eq("accommodation_type", type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      accommodations: data || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/accommodation/book
 */
export const createAccommodationBooking = async (req, res, next) => {
  try {
    const { accommodation_id, check_in_date, check_out_date } = req.body;
    const userId = req.user.id;

    if (!accommodation_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'accommodation_id, check_in_date and check_out_date are required'
      });
    }

    if (new Date(check_out_date) <= new Date(check_in_date)) {
      return res.status(400).json({
        success: false,
        message: 'check_out_date must be after check_in_date'
      });
    }

    // Validate accommodation
    const { data: acc, error: accError } = await supabase
      .from('accommodations')
      .select('id')
      .eq('id', accommodation_id)
      .eq('is_active', true)
      .single();

    if (accError || !acc) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found or inactive'
      });
    }

    const qrCode = `ACC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const checkInDeadline = new Date(check_in_date);
    checkInDeadline.setHours(18, 0, 0, 0); // 6 PM check-in deadline

    const { data: booking, error } = await supabase
      .from('accommodation_bookings')
      .insert({
        user_id: userId,
        accommodation_id,
        check_in_date,
        check_out_date,
        check_in_deadline: checkInDeadline.toISOString(),
        status: 'BOOKED',
        qr_code: qrCode
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/accommodation/my
 */
export const getMyAccommodationBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('accommodation_bookings')
      .select(`
        id,
        check_in_date,
        check_out_date,
        status,
        qr_code,
        accommodations (
          name,
          accommodation_type,
          price_per_day
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      bookings: data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/accommodation/cancel/:id
 */
export const cancelAccommodationBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('accommodation_bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .eq('status', 'BOOKED')
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({
        success: false,
        message: 'Unable to cancel accommodation booking'
      });
    }

    res.json({
      success: true,
      message: 'Accommodation booking cancelled'
    });
  } catch (err) {
    next(err);
  }
};
