import { supabase } from '../config/supabase.js';

const MODULE_TABLES = {
  EPASS: 'epass_bookings',
  FOOD: 'food_bookings',
  ACCOMMODATION: 'accommodation_bookings'
};

// Define your admin list here (or move to a config file)
const ADMIN_EMAILS = ["admin@test.com", "steve@hellfire.com"];

/**
 * GET /api/dashboard/overview
 * Merged with stats for bookings, eco-fees, upcoming visits, and admin check
 */
export const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // ⭐ Check if current user is an admin
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    // 1. Fetch Epass bookings specifically for "Stats" and "Upcoming Visit"
    const { data: epassBookings } = await supabase
      .from('epass_bookings')
      .select('visit_date, status, amount')
      .eq('user_id', userId);

    // 2. Fetch Eco-fee status
    const { data: eco } = await supabase
      .from('eco_declarations')
      .select('id')
      .eq('user_id', userId);

    // 3. Fetch Payments & Refunds for financial stats
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', userId)
      .eq('payment_status', 'SUCCESS');

    const { data: refunds } = await supabase
      .from('refunds')
      .select('amount')
      .eq('user_id', userId)
      .eq('refund_status', 'SUCCESS');

    // Logic for Stats
    const totalBookingsCount = epassBookings?.length || 0;
    const cancelledCount = epassBookings?.filter(b => b.status === 'CANCELLED').length || 0;
    
    // Logic for Upcoming Visit (gets the first upcoming date that is not cancelled)
    const upcomingVisit = epassBookings
      ?.filter(b => b.status !== 'CANCELLED' && new Date(b.visit_date) >= new Date())
      .sort((a, b) => new Date(a.visit_date) - new Date(b.visit_date))[0]?.visit_date || null;

    const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalRefunded = refunds?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

    res.json({
      success: true,
      is_admin: isAdmin, // ⭐ NEW: Tells frontend if user has admin rights
      data: {
        // Financials
        total_paid: totalPaid,
        total_refunded: totalRefunded,
        
        // Detailed Booking Stats
        total_bookings: totalBookingsCount,
        cancelled_bookings: cancelledCount,
        active_bookings: totalBookingsCount - cancelledCount,
        
        // New Features
        upcomingVisit: upcomingVisit,
        ecoFeePaid: (eco && eco.length > 0) ? true : false
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/bookings
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const results = [];

    for (const [module, table] of Object.entries(MODULE_TABLES)) {
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        data.forEach(row => {
          results.push({
            id: row.id,
            module,
            status: row.status,
            created_at: row.created_at,
            meta: row
          });
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/payments
 */
export const getPaymentsAndRefunds = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data } = await supabase
      .from('payments')
      .select(`
        id,
        module,
        booking_id,
        amount,
        payment_status,
        refunds (
          id,
          amount,
          refund_status,
          processed_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/booking/:module/:id
 */
export const getBookingDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { module, id } = req.params;

    if (!MODULE_TABLES[module]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module'
      });
    }

    const table = MODULE_TABLES[module];

    const { data: booking, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('module', module)
      .eq('booking_id', id)
      .single();

    const { data: refund } = payment
      ? await supabase
          .from('refunds')
          .select('*')
          .eq('booking_id', id)
          .single()
      : { data: null };

    const { data: cancellation } = await supabase
      .from('cancellations')
      .select(`
        created_at,
        cancellation_reasons (
          reason_code,
          description
        )
      `)
      .eq('booking_id', id)
      .single();

    res.json({
      success: true,
      data: {
        booking,
        payment: payment || null,
        refund: refund || null,
        cancellation: cancellation || null
      }
    });
  } catch (err) {
    next(err);
  }
};