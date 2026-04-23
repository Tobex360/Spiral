const express = require('express')
const upload = require("../middleware/upload")
const AuthController = require('../controllers/authController')
const authenticateToken = require("../middleware/awtjwt")
const router = express.Router();

router.post('/register',AuthController.registerUser);

router.post('/login',AuthController.loginUser);

router.post("/upload-profile-pic",
    authenticateToken,
    upload.single("image"),
    AuthController.uploadProfilePic);

router.put("/update-profile",
    authenticateToken,
    AuthController.updateUserProfile);

module.exports = router;