import { supabase } from '../config/supabase.js';

const MODULE_TABLES = {
  EPASS: 'epass_bookings',
  FOOD: 'food_bookings',
  ACCOMMODATION: 'accommodation_bookings',
  VAZHIPADU: 'vazhipadu_bookings' 
};

const ADMIN_EMAILS = ["admin@test.com", "steve@hellfire.com"];

export const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    // 1. Fetch ALL booking types in parallel for speed
    const [epass, pooja, food, stay, eco, payments, refunds] = await Promise.all([
      supabase.from('epass_bookings').select('visit_date, status').eq('user_id', userId),
      supabase.from('vazhipadu_bookings').select('booking_date, status').eq('user_id', userId),
      supabase.from('food_bookings').select('booking_date, status').eq('user_id', userId),
      supabase.from('accommodation_bookings').select('check_in_date, status').eq('user_id', userId),
      supabase.from('eco_declarations').select('id').eq('user_id', userId),
      supabase.from('payments').select('amount, payment_status').eq('user_id', userId),
      supabase.from('refund_requests').select('amount').eq('user_id', userId).eq('status', 'APPROVED') // Changed to new unified table
    ]);

    // Combine all bookings into one master list
    const allBookings = [
      ...(epass.data || []).map(b => ({ date: b.visit_date, status: b.status })),
      ...(pooja.data || []).map(b => ({ date: b.booking_date, status: b.status })),
      ...(food.data || []).map(b => ({ date: b.booking_date, status: b.status })),
      ...(stay.data || []).map(b => ({ date: b.check_in_date, status: b.status }))
    ];

    // 2. Aggregate Stats
    const totalBookingsCount = allBookings.length;
    const cancelledCount = allBookings.filter(b => b.status === 'CANCELLED').length;
    
    // 3. Find truly closest upcoming date across ALL modules
    const upcomingVisit = allBookings
      .filter(b => b.status !== 'CANCELLED' && new Date(b.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0]?.date || null;

    // 4. Financial Calculations
    const totalPaid = (payments.data || [])
      ?.filter(p => ['SUCCESS', 'PAID', 'CONFIRMED'].includes(p.payment_status))
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
    const totalRefunded = (refunds.data || [])?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

    res.json({
      success: true,
      is_admin: isAdmin,
      data: {
        total_paid: totalPaid,
        total_refunded: totalRefunded,
        total_bookings: totalBookingsCount,
        cancelled_bookings: cancelledCount,
        active_bookings: totalBookingsCount - cancelledCount,
        upcomingVisit: upcomingVisit,
        ecoFeePaid: (eco.data && eco.data.length > 0)
      }
    });
  } catch (err) {
    next(err);
  }
};

// ... keep your other functions (getAllBookings, getBookingDetails) as they were
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

    res.json({ success: true, data: results });
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
        id, module, booking_id, amount, payment_status,
        refunds ( id, amount, refund_status, processed_at )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    res.json({ success: true, data });
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
      return res.status(400).json({ success: false, message: 'Invalid module' });
    }

    const table = MODULE_TABLES[module];

    const { data: booking, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('module', module)
      .eq('booking_id', id)
      .maybeSingle();

    const { data: refund } = payment
      ? await supabase.from('refunds').select('*').eq('booking_id', id).maybeSingle()
      : { data: null };

    const { data: cancellation } = await supabase
      .from('cancellations')
      .select(`created_at, cancellation_reasons ( reason_code, description )`)
      .eq('booking_id', id)
      .maybeSingle();

    res.json({
      success: true,
      data: { booking, payment: payment || null, refund: refund || null, cancellation: cancellation || null }
    });
  } catch (err) {
    next(err);
  }
};