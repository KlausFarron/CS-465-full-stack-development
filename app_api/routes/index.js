const express = require("express");
const router = express.Router();

const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

// Function to check the login token before allowing changes to trips
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Rejects requests without an Authorization header
    if (authHeader == null) {
        return res.status(401).json({ message: 'Authorization required.' });
    }

    // Splits the header into its two parts (e.g., "Bearer abc123")
    const parts = authHeader.split(' ');
    const token = parts[1];

    // Rejects headers that are not in the "Bearer token" format
    if (parts[0] !== 'Bearer' || token == null) {
        return res.status(401).json({ message: 'Authorization required.' });
    }

    // Checks if the token is valid and has not expired
    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        // Rejects invalid or expired tokens
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        req.auth = verified;   // Saves the logged-in user's information
        next();                // Continues only when the token is valid
    });
}

// Where we import the controllers we will route
const tripsController = require("../controllers/trips");
const authController = require('../controllers/authentication');

// define route for registration endpoint
// Only a logged-in admin can create new accounts
// Redudant for enhancement in my opinion but I thought it would be a nice fix
router
    .route('/register')
    .post(authenticateJWT, authController.register);

// define route for login endpoint
router
    .route('/login')
    .post(authController.login);

// Define route for trips endpoint
router
    .route('/trips')
    .get(tripsController.tripsList) // Get Method Routes triplist
    .post(authenticateJWT, tripsController.tripsAddTrip); // POST Method adds a trip

// GET Method routes tripsFindByCode - requires parameter
// PUT Method routes tripsUpdateTrip - requires parameter
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip);

module.exports = router;