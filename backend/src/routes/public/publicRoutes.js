const express = require('express');
const router = express.Router();
const announcementsController = require('../../controllers/public/announcementsController');

// Δημιουργία route για την προσκόμιση ανακοινώσεων
router.get('/fetchAnnouncements', announcementsController.fetchAnnouncements);

module.exports = router;
