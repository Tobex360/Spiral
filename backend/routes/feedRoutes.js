const express = require("express");
const Router = express.Router();
const { getForYouFeed } = require("../controllers/feedController");
const authenticateToken = require('../middleware/awtjwt');

Router.get("/", authenticateToken, getForYouFeed);

module.exports = Router;