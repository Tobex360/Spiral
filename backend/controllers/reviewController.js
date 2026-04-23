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

// 👍 Like Review
exports.likeReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.userId;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const hasLiked = review.likes.includes(userId);
        const hasDisliked = review.dislikes.includes(userId);

        if (hasLiked) {
            // Remove like if already liked
            review.likes = review.likes.filter(id => id.toString() !== userId);
        } else {
            // Add like and remove dislike if exists
            review.likes.push(userId);
            if (hasDisliked) {
                review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
            }
        }

        await review.save();
        const updatedReview = await review.populate("userId", "username");
        res.json(updatedReview);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error liking review" });
    }
};

// 👎 Dislike Review
exports.dislikeReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.userId;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const hasLiked = review.likes.includes(userId);
        const hasDisliked = review.dislikes.includes(userId);

        if (hasDisliked) {
            // Remove dislike if already disliked
            review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
        } else {
            // Add dislike and remove like if exists
            review.dislikes.push(userId);
            if (hasLiked) {
                review.likes = review.likes.filter(id => id.toString() !== userId);
            }
        }

        await review.save();
        const updatedReview = await review.populate("userId", "username");
        res.json(updatedReview);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error disliking review" });
    }
};

