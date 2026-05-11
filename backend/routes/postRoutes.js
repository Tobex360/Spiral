const express = require("express")
const Router = express.Router()
const { createPost, deletePost, getPostByGame, getPostByUser, likePost, dislikePost } = require("../controllers/postController");
const authenticateToken = require("../middleware/awtjwt");
const upload = require("../middleware/upload");

Router.post("/", authenticateToken, upload.single('file'), createPost);

Router.get("/user/:userId", getPostByUser);

Router.get("/game/:gameId", getPostByGame);

Router.delete("/:postId", authenticateToken, deletePost);

Router.post("/:postId/like", authenticateToken, likePost);

Router.post("/:postId/dislike", authenticateToken, dislikePost);

module.exports = Router;