const Review = require("../models/review");
const { findById } = require("../models/user");


// create Review

exports.createReview = async (req,res) =>{
    try{
        const { gameId, rating, reviewText }= req.body;
        const review = new Review({
            userId: req.user.userId,
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

exports.getReviewsByUser = async(req,res)=>{
    try{
        const { userId } = req.params;

        const reviews = await Review.find({ userId })
        .sort({ createdAt: -1 });

        res.json(reviews);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error fetching user reviews" });
    }
}
// Update Review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, reviewText } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        review.rating = rating;
        review.reviewText = reviewText;
        await review.save();

        res.json(review);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating review" });
    }
};

// Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Review.findByIdAndDelete(reviewId);
        res.json({ message: "Review deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error deleting review" });
    }
};

