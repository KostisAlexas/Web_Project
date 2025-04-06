/**
 * Role-based authorization middleware ελέγχει αν ο χρήστης έχει τον απαιτούμενο ρόλο για πρόσβαση.
 */
module.exports = (requiredRole) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Από το authentication middleware
        
        if (userRole !== requiredRole) {
            return res.status(403).json({ error: 'Δεν έχετε πρόσβαση σε αυτήν την λειτουργία.' });
        }

        next();
    };
};
