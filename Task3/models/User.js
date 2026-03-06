const mongoose = require('../db');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const UserModel = mongoose.model('User', userSchema);

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async register() {
        const existingUser = await UserModel.findOne({ username: this.username });
        if (existingUser) {
            return 'User already exists';
        }

        const user = new UserModel({
            username: this.username,
            password: this.password
        });
        try {
            await user.save();
            return 'User registered successfully';
        } catch (err) {
            console.error('Error registering user:', err);
            return 'Error registering user';
        }
    }

    async login() {
        try {
            const user = await UserModel.findOne({ username: this.username, password: this.password });
            if (user) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error('Error during login:', err);
            return false;
        }
    }
}

module.exports = User;