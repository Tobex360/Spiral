const mongoose = require("mongoose");
const {Schema} = mongoose;

const followSchema = new Schema({
    follower: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    following: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps: true
});

followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;
