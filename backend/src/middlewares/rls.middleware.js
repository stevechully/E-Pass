import { supabase } from '../config/supabase.js';
import { ROLES, ROLE_HIERARCHY } from '../constants/roles.js';

/**
 * Middleware to check if user has ADMIN role
 * Queries the profiles table to verify role (RLS-safe)
 * Must be used after requireAuth middleware
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(403).json({
        success: false,
        message: 'Unable to verify user role'
      });
    }

    if (data.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to check if user has required role
 * Must be used after requireAuth middleware
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.user_metadata?.role || ROLES.GUEST;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has minimum role level
 */
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.user_metadata?.role || ROLES.GUEST;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < minLevel) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
