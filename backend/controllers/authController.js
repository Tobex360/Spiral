const User = require('../models/user');
const cloudinary = require("../config/cloudinary");
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/awtjwt');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

async function registerUser(req,res){
    let{firstname, lastname, username, email, password,} = req.body;

    try{
        const duplicate = await User.find({username});
        if(duplicate && duplicate.length>0){
            return res.status(400).send({message:'Username already Taken'})
        }

        let user = new User({
            firstname,
            lastname,
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
        let token = jwt.sign({userId:user?._id},secretKey,{expiresIn:'3h'});
        finalData={
            userid:user?._id,
            username:user?.username,
            email:user?.email,
            displayname: user?.displayname,
            bio: user?.bio,
            profilePic: user?.profilePic,
            createdAt: user?.createdAt,
            token
        }
        res.send(finalData);
    }catch(err){console.log(`full Error: ${err}`)}
}

async function googleLogin(req,res) {
    console.log("Body recived:", req.body);
    try{
        const { token } = req.body;

        if (!token) return res.status(400).json({ error: "Missing Goole token" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;
        const username = email.split("@")[0];

        let user = await User.findOne({ email });
        if(!user){
            user = new User({
                firstname: name,
                username,
                email,
                password: payload.sub,
                authProvider: 'google'
            });
            await user.save();
        }

        const jwtToken = jwt.sign(
            { userId: user._id },
            secretKey,
            { expiresIn: "3h"}
        );

        return res.json({
            userid: user._id,
            username: user.username,
            firstname: user.firstname,
            email: user.email,
            displayname: user.displayname,
            bio: user.bio,
            profilePic: user.profilePic,
            token: jwtToken
        });
    } catch(err){
        console.error("Google login error:", err);
        res.status(400).json({ error: "Google login failed" });
    }
}


 async function uploadProfilePic(req, res){
    console.log(req.file);
    try{
        const result = await cloudinary.uploader.upload(req.file.path);
        const user = await User.findById(req.user.userId);

        user.profilePic = result.secure_url;
        await user.save();

        res.json({profilePic: user.profilePic})
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Upload failed" });
    }
};

async function updateUserProfile(req, res){
    try{
        const { displayname, bio } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (displayname) user.displayname = displayname;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.json({
            displayname: user.displayname,
            bio: user.bio,
        });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Update failed" });
    }
};


const AuthController = {
    registerUser,
    loginUser,
    uploadProfilePic,
    updateUserProfile,
    googleLogin
}

module.exports = AuthController;