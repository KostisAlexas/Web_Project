const jwt = require('jsonwebtoken');
const { getRoleAndUserById } = require('../../models/authModel');

// Λογική για σύνδεση
const login = async (req, res, next) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ error: 'Απαιτούνται ID και κωδικός πρόσβασης.' });
    }

    const { role, userId, user } = await getRoleAndUserById(id);

    if (!user || password !== user.password) {
      return res.status(401).json({ error: 'Μη έγκυρος κωδικός πρόσβασης.' });
    }

    console.log('User found:', user); // Debugging

    // Δημιουργία JWT με userId και role
    const token = jwt.sign(
      { id: userId, role }, // Χρησιμοποιούμε το userId
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Generated JWT payload:', { id: userId, role }); // Debugging

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'strict',
        maxAge: 3600000, // 1 ώρα
      })
      .json({ dashboard: `/${role}/dashboard` });
  } catch (error) {
    next(error);
  }
};


// Λογική για αποσύνδεση
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // True για HTTPS.
    sameSite: 'strict',
    path: '/', // καλύπτει το root.
    domain: undefined, //
    expires: new Date(0), // Θέτει άμεση λήξη
    maxAge: 0 // Επιπλέον επιβεβαίωση λήξης
  }).status(200).json({ message: 'Επιτυχής αποσύνδεση.' });
};



// Λογική για verify protected routes
const verify = (req, res) => {
  const { user } = req;
  if (user) {
    return res.json({ role: user.role }); 
  }
  return res.status(401).json({ error: 'Unauthorized' });
};

module.exports = { login, logout, verify };