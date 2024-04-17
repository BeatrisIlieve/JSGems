const Wishlist = require("../models/Wishlist");
const { WISHLIST_ITEMS } = require("../config/config");

exports.getLikeCount = async (req, res, next) => {

    let userId;

    if(!req.user){
      // likeCount = res.locals.wishlistItems.length;
      next();
    } else {
      userId = req.user._id;
      const items = await Wishlist.find({ user: userId }).lean();
      const likeCount = items.length;
  
      res.locals.likeCount = likeCount;
    
      next();
    }
  };

