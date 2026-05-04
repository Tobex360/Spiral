const express = require("express")
const Router = express.Router()
const { addWishlist,deleteWishlist,getWishlists } = require("../controllers/wishlistController")

const authenticateToken = require('../middleware/awtjwt');



Router.post("/", authenticateToken, addWishlist);
Router.get("/", authenticateToken, getWishlists);
Router.delete("/:gameId", authenticateToken, deleteWishlist);

module.exports = Router;
