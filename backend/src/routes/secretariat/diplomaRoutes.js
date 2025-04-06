const express = require('express');
//const { somefunction } = require('../../controllers/secretariat/diplomaController');
const authentication = require('../../middleware/authentication');

const router = express.Router();

// Route for creating a diploma
//router.post('/', authentication, somefunction);

module.exports = router;
