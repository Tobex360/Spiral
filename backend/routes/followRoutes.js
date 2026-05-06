const express = require("express")
const Router = express.Router()
const { followUser, getFollowers, getFollowing, unfollowUser, getFollowStats } = require("../controllers/followController");
const authenticateToken = require('../middleware/awtjwt');


Router.post("/", authenticateToken, followUser);

Router.delete("/:userId", authenticateToken, unfollowUser);

Router.get("/following", authenticateToken, getFollowing);

Router.get("/followers/:userId", authenticateToken, getFollowers);

Router.get("/stats/:userId", getFollowStats)


module.exports = Router;