const Follow = require("../models/follow");

exports.followUser = async(req, res)=>{
    try{
        const { userId } = req.body;
        const follower = req.user.userId;

        if(follower === userId){
            return res.status(400).json({ message: "You Cant Follow Yourself "});
        }
        const exists = await Follow.findOne({ follower, following: userId });
        if(exists){
            return res.status(400).json({ message: "You already follow this user "});
        }
        const follow = await Follow.create({
            follower,
            following: userId
        });
        res.status(201).json(follow)
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Follow failed" });
    }
};

exports.unfollowUser = async(req,res)=>{
    try{
        const { userId } = req.params;
        const follower = req.user.userId;

        const exists = await Follow.findOne({ follower, following: userId })

        if(!exists){
            return res.status(400).json({ message: "You dont follow this user"})
        }

        await Follow.findOneAndDelete({
            follower,
            following: userId
        });
        res.json({ message: "Unfollowed successfully" });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "unfollow failed" });
    }
};

exports.getFollowing = async(req, res)=>{
    try{
        const userId = req.params.userId || req.user.userId;

        const following = await Follow.find({ follower: userId })
        .populate("following", "username");


        res.json(following);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error Getting Following" });
    }
};

exports.getFollowers = async(req,res)=>{
    try{
        const userId = req.params.userId;

        const followers = await Follow.find({ following: userId })
        .populate("follower","username")

        res.json(followers)
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error Getting Followers" });
    }
}

exports.getFollowStats = async(req,res)=>{
    try{
        const userId = req.params.userId;

        const followersCount = await Follow.countDocuments({
            following: userId
        })
        const followingCount = await Follow.countDocuments({
            follower: userId
        })
        res.json({
            followers: followersCount,
            following: followingCount
        })
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error fetching follow stats" });
    }
}