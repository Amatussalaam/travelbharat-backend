const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    name:String,
    email:String,

    rating:Number,

    feedback:String,

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports = mongoose.model("Feedback", feedbackSchema);