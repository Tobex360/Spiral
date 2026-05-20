const Post = require("../models/post");
const Review = require("../models/review");
const Follow = require("../models/follow");
const Wishlist = require("../models/wishlist");

exports.getForYouFeed = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Followed users
    const following = await Follow.find({
      follower: userId
    });

    const followingIds = following.map(f => f.following);

    // Favorite games
    const favoriteGames = await Wishlist.find({
      type: "favorite",
      userId
    });

    const favoriteGameIds = favoriteGames.map(
      game => game.gameId
    );

    // POSTS
    const posts = await Post.find({
      $or: [
        { user: { $in: followingIds } },
        { gameId: { $in: favoriteGameIds } }
      ]
    })
    .populate("user", "username displayname profilePic")
    .sort({ createdAt: -1 });

    // REVIEWS
    const reviews = await Review.find({
      $or: [
        { userId: { $in: followingIds } },
        { gameId: { $in: favoriteGameIds } }
      ]
    })
    .populate("userId", "username displayname profilePic")
    .sort({ createdAt: -1 });

    // COMBINED FEED
    const feed = [
      ...posts.map(post => ({
        type: "post",
        data: post,
        createdAt: post.createdAt
      })),

      ...reviews.map(review => ({
        type: "review",
        data: review,
        createdAt: review.createdAt
      }))
    ];

    // REMOVE DUPLICATES
    const uniqueFeed = Array.from(
      new Map(
        feed.map(item => [
          `${item.type}-${item.data._id}`,
          item
        ])
      ).values()
    );

    // SORT
    uniqueFeed.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.json(uniqueFeed);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to load feed"
    });
  }
};