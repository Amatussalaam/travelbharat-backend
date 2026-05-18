const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    address: String,
    password: String,

    role: {
        type: String,
        default: "user" // 👈 everyone is normal user by default
    }
});

module.exports = mongoose.model("user", userSchema);