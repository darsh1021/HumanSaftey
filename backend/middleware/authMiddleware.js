const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from format "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to req object
    req.user = await User.findById(decoded.id);

    if (!req.user) {
       return res.status(401).json({ message: 'User associated with token no longer exists' });
    }

    next();
  } catch (err) {
    console.error(`Auth Middleware Verify Error: ${err.message}`);
    
    // Handle specific JWT errors
    if(err.name === 'TokenExpiredError') {
       return res.status(401).json({ message: 'Session expired. Please login again' });
    }
    
    return res.status(401).json({ message: 'Invalid token. Not authorized' });
  }
};

module.exports = { protect };
