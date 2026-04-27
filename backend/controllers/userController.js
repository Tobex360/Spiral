const User = require("../models/user");
const Review = require("../models/review")
require("dotenv").config();
const axios = require("axios")

const YOUR_API_KEY=process.env.RAWG_KEY


exports.getUser = async (req,res)=>{
    try{
        const user = await User.findById(req.params.userId)
        .select("username displayname bio profilePic createdAt");
        
         if (!user) {
            return res.status(404).json({ message: "User not found" });
            }

        res.json(user);
    }catch(err){
        console.log(err)
        res.status(500).json({ message: "Error fetching user Details" });

    }
}



exports.getUserReviews = async (req,res)=>{
    try{
        const reviews = await Review.find({userId: req.params.userId});

        const reviewsWithGames = await Promise.all(
            reviews.map(async (review)=>{
                try{
                    if (!review.gameId) {
                        return { ...review.toObject(), game: null };
                    }

                    const gameRes = await axios.get(`https://api.rawg.io/api/games/${review.gameId}?key=${YOUR_API_KEY}`);

                    return {
                        ...review.toObject(),
                        game: gameRes.data,
                    };
                } catch{
                    return {
                        ...review.toObject(),
                        game: null,
                    };
                }
            })
        );
        res.json(reviewsWithGames);
    } catch(err){
         console.error(err);
         res.status(500).json({ message: 'Error fetching reviews' });
    };
};