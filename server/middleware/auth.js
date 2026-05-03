const jwt = require('jsonwebtoken');

// This middleware runs BEFORE protected routes
// It checks if the request has a valid JWT token
const protect = (req, res, next) => {

  // Get token from request header
  // Frontend will send: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  // Check if header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verify the token using our secret key
    // If token is invalid or expired, this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request object
    // Now any route after this middleware can access req.user
    req.user = decoded;

    // Move on to the next function (the actual route handler)
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;