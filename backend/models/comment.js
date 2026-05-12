const mongoose = require("mongoose");
const{Schema} = mongoose;

const commentSchema = new Schema({
    post:{
        type: mongoose.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    user:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text:{
        type: String,
        required: true,
        maxLength: 500,
    }
},{
    timestamps: true
});

const Comments = mongoose.model("Comment",commentSchema);
module.exports = Comments