// controllers/accommodation.price.controller.js
import { supabase } from "../config/supabase.js";

export const calculateAccommodationPrice = async (req, res, next) => {
  try {
    const { accommodation_id, check_in_date, check_out_date } = req.body;

    if (!accommodation_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const days =
      (new Date(check_out_date) - new Date(check_in_date)) /
      (1000 * 60 * 60 * 24);

    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range"
      });
    }

    const { data: acc, error } = await supabase
      .from("accommodations")
      .select("price_per_day")
      .eq("id", accommodation_id)
      .single();

    if (error || !acc) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found"
      });
    }

    const totalAmount = days * acc.price_per_day;

    res.json({
      success: true,
      days,
      price_per_day: acc.price_per_day,
      total_amount: totalAmount
    });
  } catch (err) {
    next(err);
  }
};
