const mongoose = require('mongoose')
const {Schema} = mongoose

const reviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    gameId: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    reviewText: {
        type: String,
        required: true,
    },
},
{
    timestamps: true
});


const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;