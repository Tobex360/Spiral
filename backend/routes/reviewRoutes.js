const express = require('express');
const Router = express.Router();
const {
    createReview,
    getReviewsByGame,
    getReviewsByUser,
    updateReview,
    deleteReview,
    likeReview,
    dislikeReview
} = require('../controllers/reviewController');
const authenticateToken = require('../middleware/awtjwt');

Router.post("/", authenticateToken, createReview);

Router.get("/game/:gameId", getReviewsByGame);

Router.get("/user/:userId", getReviewsByUser);

Router.put("/:reviewId", authenticateToken, updateReview);

Router.delete("/:reviewId", authenticateToken, deleteReview);

Router.put("/:reviewId/like", authenticateToken, likeReview);

Router.put("/:reviewId/dislike", authenticateToken, dislikeReview);

module.exports = Router

module.exports = Router