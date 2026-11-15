const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/user');

// Function to create a new admin account
// Only a logged-in admin can create another account (see routes/index.js)
const register = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        // Check 1: Rejects fields that are not text (e.g., {"email": {"$ne": ""}})
        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check 2: Rejects an empty name or email
        if (name.trim() === '' || email.trim() === '') {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check 3: Rejects passwords shorter than 8 characters
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        }

        const user = new User({
            name: name.trim(),
            email: email.trim(),
            password: ''              // Start with empty password
        });
        user.setPassword(password);   // Saves a hashed version of the password
        await user.save();

        // Returns a token for the new user
        const token = user.generateJWT();
        return res.status(201).json({ token: token });

    } catch (err) {
        // Checks if the email is already registered
        // (11000 is MongoDB's error code for a duplicate value)
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }

        // Returns an error if the database request fails
        console.error(err);
        return res.status(500).json({ message: 'Unable to register user.' });
    }
};

const login = (req, res) => {
    // Validate message to ensure that email and password are present.
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({"message": "All fields required"});
    }

    // Delegate authentication to passport module
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            // Error in Authentication Process
            return res
                .status(404)
                .json(err);
        }

        if (user) { // Auth succeeded - generate JWT and return to caller
            const token = user.generateJWT();
            res
                .status(200)
                .json({token});
        } else { // Auth failed return error
            res
                .status(401)
                .json(info);
        }
    })(req, res);
};

// Export methods that drive endpoints.
module.exports = {
    register,
    login
};