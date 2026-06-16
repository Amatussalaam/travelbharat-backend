const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: String,

    // User selected values
    from: String,
    to: String,

    // Converted states used for distance calculation
    fromState: String,
    toState: String,

    adults: Number,
    children: Number,
    infants: Number,

    passengers: Number,

    classType: String,
    price: Number

}, { timestamps: true });

module.exports = mongoose.model("Bookings", bookingSchema);