const User = require('../models/user');
const jwt = require('../middleware/awtjwt');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

async function registerUser(req,res){
    let{username, email, password,} = req.body;

    try{
        const duplicate = await User.find({username});
        if(duplicate && duplicate.length>0){
            return res.status(400).send({message:'Username already Taken'})
        }

        let user = new User({
            username,
            email,
            password,
        })
        const result = await user.save();
        console.log(result);
        res.status(201).send({message: 'User Registered Successfully'});
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

async function loginUser(req,res){
    try{
        const {username, password} = req.body;

        const user = await User.findOne({username});
        if(!user){
            return res.status(400).send({message: 'This user does not exist'})
        }
        // Block Google accounts from password login
        // if (user.authProvider === 'google') {
        //   return res.status(401).send({ message: 'Please use Google to sign in' });
        // }
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(400).send({message: 'Incorrect Password'})
        }
        let token = await jwt.toString({userId:user?._id},secretKey,{expiresIn:'3h'});
        finalData={
            userid:user?._id,
            username:user?.username,
            email:user?.email,
            token
        }
        res.send(finalData);
    }catch(err){console.log(`full Error: ${err}`)}
}


const AuthController = {
    registerUser,
    loginUser,
}

module.exports = AuthController;