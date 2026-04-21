const express = require('express');
const Router = express.Router();
const {
    createReview,
    getReviewsByGame,
    getReviewsByUser
} = require('../controllers/reviewController');
const authenticateToken = require('../middleware/awtjwt');

Router.post("/", authenticateToken, createReview);

Router.get("/game/:gameId", getReviewsByGame);

Router.get("/user/:userId", getReviewsByUser)

module.exports = Router