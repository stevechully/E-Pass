import { supabase } from '../config/supabase.js';
import crypto from 'crypto'; 

const VALID_MODULES = ['EPASS', 'FOOD', 'ACCOMMODATION', 'ECO_FEE', 'VAZHIPADU'];
// ✅ List allowed by your DB constraint
const ALLOWED_METHODS = ['UPI', 'CARD', 'NET_BANKING', 'WALLET'];

/**
 * POST /api/payments/confirm
 * Processes a mock payment and returns the payment object.
 */
export const confirmMockPayment = async (req, res, next) => {
  try {
    const { module, booking_id, amount, payment_method } = req.body;
    const userId = req.user.id;

    // 1. Basic Validation
    if (!VALID_MODULES.includes(module)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment module'
      });
    }

    if (!booking_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'booking_id and amount are required'
      });
    }

    // 2. 🛡️ SECURITY CHECK: Block payment for FREE food
    if (module === 'FOOD') {
      const { data: foodBooking } = await supabase
        .from('food_bookings')
        .select(`id, food_slots ( meal_type )`)
        .eq('id', booking_id)
        .eq('user_id', userId)
        .single();

      if (!foodBooking) {
        return res.status(404).json({ success: false, message: 'Food booking not found' });
      }

      if (foodBooking.food_slots.meal_type === 'FREE') {
        return res.status(400).json({
          success: false,
          message: 'Payment not required for FREE meals'
        });
      }
    }

    // 3. Prevent duplicate payment
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('module', module)
      .eq('booking_id', booking_id)
      .eq('payment_status', 'SUCCESS')
      .maybeSingle(); 

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // ✅ FIX 1: Validate payment_method against DB Check Constraint
    const finalPaymentMethod = ALLOWED_METHODS.includes(payment_method) 
      ? payment_method 
      : 'CARD';

    // 4. Insert mock payment
    // ✅ FIX 2: Removed 'transaction_id' to match your Supabase schema
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        module,
        booking_id,
        amount,
        payment_status: 'SUCCESS',
        payment_method: finalPaymentMethod, 
        gateway: 'MOCK'
      })
      .select(`id, user_id, booking_id, amount, payment_status, payment_method, gateway, module, created_at`)
      .single();

    if (error) throw error;

    // 5. Update Booking Status to CONFIRMED & Generate QR
    let table = '';
    if (module === 'EPASS') table = 'epass_bookings';
    else if (module === 'FOOD') table = 'food_bookings';
    else if (module === 'ACCOMMODATION') table = 'accommodation_bookings';
    else if (module === 'ECO_FEE') table = 'eco_fee_payments';
    else if (module === 'VAZHIPADU') table = 'vazhipadu_bookings';

    if (table) {
      let updateData = { status: 'CONFIRMED' };

      // Generate consistent QR code for Vazhipadu
      if (module === 'VAZHIPADU') {
        const qrCode = `VAZ-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
        updateData.qr_code = qrCode;
      }

      const { error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', booking_id);

      if (updateError) throw updateError;
    }

    res.status(201).json({
      success: true,
      data: payment || {}
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/payments
 */
export const getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        booking_id,
        module,
        amount,
        payment_status,
        payment_method,
        gateway,
        created_at,
        refunds (
          amount,
          refund_status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (err) {
    next(err);
  }
};