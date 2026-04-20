const express = require("express");
const router = express.Router();
const { getGames } = require("../controllers/gameControllers");

router.get("/", getGames);

module.exports = router;