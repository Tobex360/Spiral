const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require("./routes/gameRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const followRoutes = require("./routes/followRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes")

require('dotenv').config();

const DB_URL = process.env.DB_URL2;
const PORT = process.env.PORT || 2001;

//Enable Cors
app.use(cors())


//Parse json bodies
app.use(express.json());

//health route
app.get('/api/health',(req, res)=>{
    res.status(200).json({ status: 'ok' })
})

//Routes
app.use('/api/user',authRoutes);
app.use('/api/games',gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/follow',followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments',commentRoutes);


//Start Server
app.listen(PORT,()=>{
    console.log(`Server started at ${PORT}`)
});

// Connect to mongoose
mongoose.connect(DB_URL).then((result)=>{
    console.log('succesfully connected to mongodb')
}).catch(err=>{
    console.log('MongoDB connection failed');
    console.error('Full error:', err);

})
