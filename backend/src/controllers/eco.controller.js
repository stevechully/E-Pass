import { supabase } from '../config/supabase.js';

// STEP 1: Define eco-fee rates (constant)
const ECO_FEES = {
  BOTTLE: 10,
  BAG: 5,
  CONTAINER: 15
};

/**
 * POST /api/eco/declare
 */
export const createEcoDeclaration = async (req, res, next) => {
  try {
    const { epass_booking_id, items } = req.body;
    const userId = req.user.id;

    if (!epass_booking_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'epass_booking_id and items are required'
      });
    }

    // Validate e-pass ownership
    const { data: epass, error: epassError } = await supabase
      .from('epass_bookings')
      .select('id')
      .eq('id', epass_booking_id)
      .eq('user_id', userId)
      .single();

    if (epassError || !epass) {
      return res.status(403).json({
        success: false,
        message: 'Invalid e-pass booking'
      });
    }

    // STEP 2: Fix your eco-declare logic - Calculate totals before DB insert
    let totalFee = 0;
    const itemRows = items.map(item => {
      const feePerItem = ECO_FEES[item.plastic_type];

      if (!feePerItem) {
        throw new Error(`Invalid plastic type: ${item.plastic_type}`);
      }

      const subtotal = feePerItem * item.quantity;
      totalFee += subtotal;

      return {
        plastic_type: item.plastic_type,
        quantity: item.quantity,
        fee_per_item: feePerItem,
        subtotal
      };
    });

    // STEP 3: Insert declaration FIRST
    const { data: declaration, error: declError } = await supabase
      .from('eco_declarations')
      .insert({
        epass_booking_id,
        user_id: userId,
        total_fee: totalFee, // Now explicitly passing the calculated fee
        status: 'DECLARED'
      })
      .select()
      .single();

    if (declError) {
      if (declError.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Eco declaration already exists for this e-pass'
        });
      }
      throw declError;
    }

    // STEP 4: Insert items WITH subtotals
    const itemsWithFK = itemRows.map(item => ({
      ...item,
      eco_declaration_id: declaration.id
    }));

    const { error: itemsError } = await supabase
      .from('eco_declaration_items')
      .insert(itemsWithFK);

    if (itemsError) throw itemsError;

    // Return the final declaration data
    res.status(201).json({
      success: true,
      declaration: {
        ...declaration,
        items: itemRows
      }
    });
  } catch (err) {
    // If it's a validation error from the map function
    if (err.message.includes('Invalid plastic type')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * GET /api/eco/my/:epassId
 */
export const getMyEcoDeclaration = async (req, res, next) => {
  try {
    const { epassId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('eco_declarations')
      .select(`
        id,
        status,
        total_fee,
        eco_declaration_items (
          plastic_type,
          quantity,
          fee_per_item,
          subtotal
        )
      `)
      .eq('epass_booking_id', epassId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Eco declaration not found'
      });
    }

    res.json({
      success: true,
      declaration: data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/eco/cancel/:id
 */
export const cancelEcoDeclaration = async (req, res, next) => {
  try {
    const declarationId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('eco_declarations')
      .update({ status: 'CANCELLED' })
      .eq('id', declarationId)
      .eq('user_id', userId)
      .eq('status', 'DECLARED')
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({
        success: false,
        message: 'Unable to cancel eco declaration'
      });
    }

    res.json({
      success: true,
      message: 'Eco declaration cancelled'
    });
  } catch (err) {
    next(err);
  }
};