const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: String,
    from: String,
    to: String,

    adults: Number,
    children: Number,
    infants: Number,

    passengers: Number,

    classType: String,
    price: Number

}, { timestamps: true });

module.exports = mongoose.model("Bookings", bookingSchema);