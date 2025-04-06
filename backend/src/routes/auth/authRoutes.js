const express = require('express');
const { login, logout, verify } = require('../../controllers/auth/loginController');
const authentication = require('../../middleware/authentication');

const router = express.Router();

// Login and Logout routes
router.post('/login', login); // Είσοδος
router.post('/logout', logout); // Έξοδος

//Αυθεντικοποιούμε προστατευόμενα routes στο frontend
router.get('/verify', authentication, verify);


module.exports = router;
