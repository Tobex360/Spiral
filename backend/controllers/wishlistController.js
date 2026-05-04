const Wishlist = require("../models/wishlist")

exports.addWishlist = async(req,res)=>{
    try{
    const { gameId } =  req.body;

    const exists = await Wishlist.findOne({
        userId: req.user.userId.toString(),
        gameId
    });

    if(exists){
        return res.status(400).json({ message: "Already in wishlist" });
    }

    const item = new Wishlist({
        userId: req.user.userId.toString(),
        gameId
    });

    await item.save();
    res.status(201).json(item);
    }catch(err){
        console.log(err)
        res.status(500).json({ message: "Error creating wishlist" });
    }


}  

exports.deleteWishlist = async(req,res)=>{
    try{
        const { gameId } = req.params;
        const userId = req.user.userId.toString();

        await Wishlist.findOneAndDelete({
            userId,
            gameId: Number(gameId)
        })

        res.json({ message: "Removed from wishlist" })

    }catch(err){
        res.status(500).json({ message: "Error deleting wishlist" });
    }
}

exports.getWishlists = async(req,res)=>{
    try{
        const userId = req.user.userId.toString();
        const items = await Wishlist.find({ userId });

        res.json(items);

    }catch(err){
        console.log(err)
        res.status(500).json({ message: "Error fetching wishlist" });
    }

}