const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15minutes
    max: 100, // 100 req per ip
    message: "Too many requests. Please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = apiLimiter;