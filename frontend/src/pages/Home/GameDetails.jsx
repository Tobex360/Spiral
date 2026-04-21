import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Spin } from "antd";

function GameDetails() {
  const { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  // 🎮 Fetch Game
  const fetchGame = async () => {
    try {
      const res = await axios.get(`/api/games/${gameId}`);
      setGame(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load game details");
    }
  };

  // 💬 Fetch Reviews
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/reviews/${gameId}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      // Maybe don't set error for reviews, as game is main
    }
  };

  // ➕ Submit Review
  const submitReview = async () => {
    try {
      await axios.post("/api/reviews", {
        gameId: Number(gameId),
        rating,
        reviewText: text,
      });

      setText("");
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGame(), fetchReviews()]);
      setLoading(false);
    };

    loadData();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center mt-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center mt-20">
        <p className="text-gray-500">Game not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 md:px-12 py-10">
      <div className="max-w-6xl mx-auto">

        {/* 🎮 GAME HEADER */}
        <div className="grid md:grid-cols-2 gap-10 mb-12">
          
          {/* Image */}
          <img
            src={game.background_image}
            alt={game.name}
            className="rounded-xl w-full h-[300px] object-cover"
          />

          {/* Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {game.name}
            </h1>

            <p className="text-yellow-400 mb-2">
              ⭐ {game.rating}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {game.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-[#222] px-2 py-1 rounded text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-gray-300 text-sm">
              {game.description_raw?.slice(0, 300)}...
            </p>
          </div>
        </div>

        {/* ✍️ REVIEW FORM */}
        <div className="bg-[#111] p-4 rounded-xl mb-10">
          <h2 className="text-lg mb-3">Write a Review</h2>

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="bg-black border border-gray-700 p-2 rounded mb-3"
          >
            {[1,2,3,4,5].map((num) => (
              <option key={num} value={num}>
                {num} ⭐
              </option>
            ))}
          </select>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 bg-black border border-gray-700 rounded mb-3"
          />

          <button
            onClick={submitReview}
            className="bg-primary px-4 py-2 rounded hover:opacity-80"
          >
            Submit Review
          </button>
        </div>

        {/* 💬 REVIEWS */}
        <div>
          <h2 className="text-xl mb-6">Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-[#111] p-4 rounded-xl"
                >
                  <p className="text-sm text-gray-400 mb-1">
                    {review.userId?.username || "User"}
                  </p>

                  <p className="text-yellow-400 mb-2">
                    ⭐ {review.rating}
                  </p>

                  <p className="text-gray-200">
                    {review.reviewText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default GameDetails;