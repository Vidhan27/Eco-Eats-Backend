const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');
const middleware = require('../middleware');

router.post("/auth/signup", middleware.ensureNotLoggedIn, async (req, res) => {
    const { firstName, lastName, email, password1, password2, role } = req.body;
    let errors = [];

    if (!firstName || !lastName || !email || !password1 || !password2 || !role) {
        errors.push({ msg: "Please fill in all fields" });
    }
    if (password1 != password2) {
        errors.push({ msg: "Passwords do not match" });
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const user = await User.findOne({ email: email });
        if (user) {
            errors.push({ msg: "Email is already registered" });
            return res.status(400).json({ errors });
        }

        const newUser = new User({
            firstName, lastName, email, password: password1, role
        });
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newUser.password, salt);
        newUser.password = hash;
        await newUser.save();
        res.status(200).json({ message: 'You are now registered and can log in' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.post("/auth/login", middleware.ensureNotLoggedIn,
    passport.authenticate('local', { failureFlash: true }),
    (req, res) => {
        res.json({ redirect: `${req.user.role}/dashboard`, role:req.user.role });
         // Set session cookie if not already set
        if (!req.session.user) {
            req.session.user = req.user;
        }
    });
    router.get("/auth/logout", (req, res) => {
        req.logout((err) => {
            if (err) {
                // Handle any error that occurred during logout
                return res.status(500).json({ message: 'Error occurred during logout' });
            } 
    
            // Clear the cookie on server side
            res.clearCookie('connect.sid', { path: '/' }); // use the same path you set the cookie on
    
            // Logout successful
            res.json({ message: 'You are logged out' });
        });
    });
module.exports = router;
