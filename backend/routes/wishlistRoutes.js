const express = require("express")
const Router = express.Router()
const { addItem, deleteWishlist,getItems,getfavorite,getWishlists } = require("../controllers/wishlistController")

const authenticateToken = require('../middleware/awtjwt');



Router.post("/", authenticateToken, addItem);
Router.get("/", authenticateToken, getItems);
Router.delete("/:gameId", authenticateToken, deleteWishlist);
Router.get("/favorites", authenticateToken, getfavorite);
Router.get("/wishlists", authenticateToken, getWishlists);

module.exports = Router;
