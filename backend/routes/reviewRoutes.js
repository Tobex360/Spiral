const express = require('express');
const Router = express.Router();
const {
    createReview,
    getReviewsByGame
} = require('../controllers/reviewController');

Router.post("/", createReview);

Router.get("/:gameId", getReviewsByGame)

module.exports = Router