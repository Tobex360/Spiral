const express = require('express');
const Router = express.Router();
const {
    createReview,
    getReviewsByGame
} = require('../controllers/reviewController');
const authenticateToken = require('../middleware/awtjwt');

Router.post("/", authenticateToken, createReview);

Router.get("/:gameId", getReviewsByGame)

module.exports = Router