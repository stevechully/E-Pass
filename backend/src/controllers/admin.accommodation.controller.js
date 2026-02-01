import { supabase } from "../config/supabase.js";

/**
 * POST /api/admin/accommodations
 */
export const createAccommodation = async (req, res, next) => {
  try {
    const {
      name,
      accommodation_type,
      capacity,
      price_per_day
    } = req.body;

    if (!name || !accommodation_type || !capacity || !price_per_day) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const { data, error } = await supabase
      .from("accommodations")
      .insert({
        name,
        accommodation_type,
        capacity,
        price_per_day,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      accommodation: data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/accommodations/:id/toggle
 */
export const toggleAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("accommodations")
      .update({
        is_active: supabase.sql`NOT is_active`
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      accommodation: data
    });
  } catch (err) {
    next(err);
  }
};
