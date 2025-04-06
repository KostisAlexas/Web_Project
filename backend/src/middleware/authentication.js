const jwt = require('jsonwebtoken');

const authentication = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    console.log('[Authentication] Token is missing');
    return res.status(401).json({ error: 'Απαιτείται εξουσιοδότηση.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      console.log('[Authentication] Decoded token is null or undefined');
      throw new Error('Invalid token payload');
    }
    console.log('[Authentication] Decoded user:', decoded);
    req.user = decoded; // Καταχωρούμε το χρήστη
    next();
  } catch (error) {
    console.log('[Authentication] JWT error:', error.message);
    return res.status(401).json({ error: 'Μη έγκυρο ή ληγμένο token.' });
  }
};

module.exports = authentication;
