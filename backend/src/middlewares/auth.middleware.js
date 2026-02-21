const jwt = require('jsonwebtoken');

// 1. Verifies if the user has a valid login token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    // Remove 'Bearer ' string if included
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Attach the user data (id, role, etc.) to the request so controllers can use it
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// 2. Checks if the logged-in user has the correct role for this specific action
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Forbidden. You do not have permission to perform this action.' 
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };