const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.send('Username and password are required');
    }
    const user = new User(username, password);
    const result = await user.register();
    res.send(result);
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.send('Username and password are required');
    }
    const user = new User(username, password);
    const result = await user.login();
    if (result) {
        req.session.user = username;
        res.send('Login successful');
    } else {
        res.send('Invalid username or password');
    }
});



module.exports = router;

