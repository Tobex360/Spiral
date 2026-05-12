const express = require("express");
const Router = express.Router();
const { createComment,deleteComment,getCommentsByPost } = require("../controllers/commentController");
const authenticateToken = require("../middleware/awtjwt");

Router.post("/:postId", authenticateToken, createComment);

Router.get("/:postId", authenticateToken, getCommentsByPost);

Router.delete("/:commentId", authenticateToken, deleteComment)

module.exports = Router;