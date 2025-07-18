// flowbit/api/middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to verify JWT token and attach user to request
 */
exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains id, email, customerId, role
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Middleware to check if user's role is in allowed roles
 * @param  {...string} allowedRoles
 */
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied. Role not allowed.' });
    }

    next();
  };
};
