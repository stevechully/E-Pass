import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

/**
 * POST /api/food/book
 */
export const createFoodBooking = async (req, res, next) => {
  try {
    const { food_slot_id, epass_booking_id } = req.body;
    const userId = req.user.id;

    if (!food_slot_id) {
      return res.status(400).json({
        success: false,
        message: 'food_slot_id is required'
      });
    }

    // Validate food slot
    const { data: slot, error: slotError } = await supabase
      .from('food_slots')
      .select('id, slot_date')
      .eq('id', food_slot_id)
      .eq('is_active', true)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({
        success: false,
        message: 'Food slot not found or inactive'
      });
    }

    const qrCode = `FOOD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const { data: booking, error } = await supabase
      .from('food_bookings')
      .insert({
        user_id: userId,
        food_slot_id,
        epass_booking_id: epass_booking_id || null,
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
 * GET /api/food/my
 */
export const getMyFoodBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('food_bookings')
      .select(`
        id,
        status,
        qr_code,
        food_slots (
          slot_date,
          start_time,
          end_time,
          meal_type
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
 * POST /api/food/cancel/:id
 */
export const cancelFoodBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('food_bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .eq('status', 'BOOKED')
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({
        success: false,
        message: 'Unable to cancel food booking'
      });
    }

    res.json({
      success: true,
      message: 'Food booking cancelled'
    });
  } catch (err) {
    next(err);
  }
};
