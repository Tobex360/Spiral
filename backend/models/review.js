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
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],

},
{
    timestamps: true
});

reviewSchema.index({ userId: 1, gameId: 1 }, { unique: true });


const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;