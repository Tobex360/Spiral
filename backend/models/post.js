const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    gameId:{
        type: Number,
    },
    description:{
        type:String,
        maxLength:1000,
        required: true,
    },
    image: {
        type: String,
        default: null
    },
    likes:[{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    dislikes:[{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }]
},{
    timestamps: true
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;