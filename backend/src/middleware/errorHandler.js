/**
 * Global error handler middleware, διαχειρίζεται σφάλματα και επιστρέφει κατάλληλες απαντήσεις.
 */
module.exports = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε αργότερα.' });
};
