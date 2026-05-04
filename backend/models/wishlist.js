const mongoose = require("mongoose");
const {Schema} = mongoose;


const wishlistSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    gameId: {
        type: Number,
        required: true,
    },
    
},{
    timestamps:true
});

wishlistSchema.index({ userId: 1, gameId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;