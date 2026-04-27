const express = require("express")
const Router = express.Router();
const {getUser, getUserReviews} = require("../controllers/userController");

Router.get("/:userId", getUser);
Router.get("/:userId/reviews", getUserReviews);

module.exports = Router;