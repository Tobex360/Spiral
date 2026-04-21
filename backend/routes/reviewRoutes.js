const express = require('express');
const Router = express.Router();
const {
    createReview,
    getReviewsByGame,
    getReviewsByUser,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const authenticateToken = require('../middleware/awtjwt');

Router.post("/", authenticateToken, createReview);

Router.get("/game/:gameId", getReviewsByGame);

Router.get("/user/:userId", getReviewsByUser);

Router.put("/:reviewId", authenticateToken, updateReview);

Router.delete("/:reviewId", authenticateToken, deleteReview);

module.exports = Router