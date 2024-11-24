const express = require('express');
const { User } = require('../models');

const router = express.Router();

router.post('/register', async (req, res) => {
    const auth0Id = req.auth.sub;

    try {
        let user = await User.findOne({ where: { auth0Id } });
        if (user) {
            return res.status(200).json({ message: "User already registered.", user });
        }

        user = await User.create({
            auth0Id
        });
        res.status(201).json({ message: "User registered successfully.", user });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "An error occurred while registering the user." });
    }
});

module.exports = router;
