const Review = require("../models/review");
const { findById } = require("../models/user");


// create Review

exports.createReview = async (req,res) =>{
    try{
        const { gameId, rating, reviewText }= req.body;
        const review = new Review({
            userId: "69e6231f59b9559bcf35e0c3",
            gameId,
            rating,
            reviewText,
        });

        await review.save();
        res.status(201).json(review);
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Error creating review" });
    }
};


// Get Reviews for a Game
exports.getReviewsByGame = async (req, res) =>{
    try{
        const { gameId } = req.params;

        const reviews = await Review.find({ gameId })
            .populate("userId", "username")
            .sort({ createdAt: -1 });

        res.json(reviews);
    }catch(err){
        console.log(err)
        res.status(500).json({ message: "Error fetching review" });
    }
}
