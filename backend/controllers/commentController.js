const Comment = require("../models/comment.js")


exports.createComment = async(req,res)=>{
    try{
        const { text } = req.body
        const user = req.user.userId;
        const { postId } = req.params;

        if (!text?.trim()){
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const comment = await Comment.create({
            post: postId,
            user,
            text
        });
        const populatedComment = await Comment.findById(comment._id)
        .populate("user","username displayname profilePic");
        
        res.status(201).json(populatedComment)
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Failed to create comment" });
    }
}

exports.getCommentsByPost = async(req,res) =>{
    try{
        const { postId } = req.params

        const comments = await Comment.find({
            post: postId
        })
        .populate("user", "username displayname profilePic")
        .sort({createdAt: -1});

        res.status(200).json(comments);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Failed to get comments" });
    }
}


exports.deleteComment = async(req,res)=>{
    try{
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId)
        if(!comment){
            return res.status(404).json({
                message: "comment not found"
            })
        };

        if (comment.user.toString() !== req.user.userId){
            return res.status(403).json({
                message: "Not Authorized"
            });
        }

        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({message: "Deleted comment"})
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Failed to delete comment" });
    }
}

