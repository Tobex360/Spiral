const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config();

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 2001;

//Enable Cors

//Parse json bodies
app.use(express.json());

//health route
app.get('/api/health',(req, res)=>{
    res.status(200).json({ status: 'ok' })
})

//Routes


//Start Server
app.listen(PORT,()=>{
    console.log(`Server started at ${PORT}`)
});

// Connect to mongoose
mongoose.connect(DB_URL).then((result)=>{
    console.log('succesfully connected to mongodb')
}).catch(err=>{
    console.err('MongoDB connection failed');
    console.error('Full error:', err);

})
