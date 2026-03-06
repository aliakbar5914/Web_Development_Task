const express = require('express');
const session = require('express-session');

const app = express();
require('./db');
app.use(express.json());
app.use(session({
    secret: 'mySecretKey123',
    resave: false,
    saveUninitialized: true
}));
const routes = require('./routes/Routes');
app.use('/', routes);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
