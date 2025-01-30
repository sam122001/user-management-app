const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  // Extract token if it starts with 'Bearer'
  const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  jwt.verify(actualToken, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or Expired Token' });
    }
    req.user = decoded; // Add decoded token data to request
    next();
  });
}

module.exports = authenticateToken;
