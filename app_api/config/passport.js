const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Users = require('../models/user');
const User = mongoose.model('users');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
        },
        async (username, password, done) => {
            const q = await User
            .findOne({ email: username })
            .exec();

            // Uncomment the following line to show results of query
            // on the console
            // console.log(q);

            // if DB returns no record, user does not exist
            if (!q) {
                return done(null, false, {
                    message: 'Incorrect username.',
                });
            }

            // Validate password
            if (!q.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.',
                });
            }

            // If everything is OK, return user object
            return done(null, q);
        }
    )
);