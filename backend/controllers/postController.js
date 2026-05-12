const Post = require("../models/post");
const cloudinary = require("../config/cloudinary");
require('dotenv').config();


exports.createPost = async(req,res)=>{
    try{
        const { gameId, description } = req.body;

        const parsedGameId = gameId && gameId !== "null"
            ? Number(gameId)
            : undefined;

        let imageUrl = null;

        if(req.file){
            const img = await cloudinary.uploader.upload(req.file.path);
            imageUrl = img.secure_url;
        }

        const postData = {
            user: req.user.userId,
            description,
            image: imageUrl,
        };

        if(parsedGameId){
            postData.gameId = parsedGameId;
        }

        const post = await Post.create(postData);

        res.status(201).json(post);

    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Failed to create post" });
    }
};


exports.getPostByUser = async(req,res) =>{
    try{
        const user = req.params.userId;

        const posts = await Post.find({ user })
        .populate("user", "username displayname profilePic")
        .sort({ createdAt: -1 });

        res.json(posts);
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Failed to get posts" });
    }
}
exports.getPostByGame = async(req,res) =>{
    try{
        const gameId = req.params.gameId;

        const posts = await Post.find({ gameId })
        .populate("user", "username displayname profilePic")
        .sort({ createdAt: -1 });

        res.json(posts);
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Failed to get posts" });
    }
}
exports.deletePost = async(req,res) =>{
    try{
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Post.findByIdAndDelete(postId);
        res.json({ message: "Post has been deleted"})
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Failed to delete posts" });
    }
}

exports.likePost = async(req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const likeIndex = post.likes.indexOf(userId);
        const dislikeIndex = post.dislikes.indexOf(userId);

        // If already liked, remove like
        if (likeIndex !== -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            // Like the post
            post.likes.push(userId);
            // Remove from dislikes if present
            if (dislikeIndex !== -1) {
                post.dislikes.splice(dislikeIndex, 1);
            }
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to like post" });
    }
};

exports.dislikePost = async(req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const likeIndex = post.likes.indexOf(userId);
        const dislikeIndex = post.dislikes.indexOf(userId);

        // If already disliked, remove dislike
        if (dislikeIndex !== -1) {
            post.dislikes.splice(dislikeIndex, 1);
        } else {
            // Dislike the post
            post.dislikes.push(userId);
            // Remove from likes if present
            if (likeIndex !== -1) {
                post.likes.splice(likeIndex, 1);
            }
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to dislike post" });
    }
};