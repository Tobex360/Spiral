import React, { useEffect, useState } from 'react'
import User from '../../assets/no_avatar.webp'
import { Button, Spin } from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom';

function Profile() {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');

    if (user) {
      const userdata = JSON.parse(user);
      setUsername(userdata.username || 'User');
      setUserId(userdata.userid);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/api/reviews/user/${userId}`);

        // 🔥 Fetch game data for each review
        const reviewsWithGames = await Promise.all(
          res.data.map(async (review) => {
            try {
              const gameRes = await axios.get(`/api/games/${review.gameId}`);
              
              return {
                ...review,
                game: gameRes.data
              };
            } catch {
              return {
                ...review,
                game: null
              };
            }
          })
        );

        setReviews(reviewsWithGames);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  return (
    <main className='min-h-screen pb-16 text-white'>
      
      <div className='max-w-6xl mx-auto px-6 md:px-12 pt-20 font-audiowide'>
        
        {/* Profile Header */}
        <div className='flex items-center gap-4 mb-12'>
          <img 
            src={User} 
            alt="User Avatar" 
            className='w-20 h-20 rounded-full object-cover'
          />

          <div className='flex flex-col gap-2'>
            <div className='text-2xl'>{username}</div>

            <Button className='bg-primary border-primary font-tomorrow hover:bg-transparent hover:text-primary'>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className='text-xl mb-6'>Your Reviews</h2>

          {loading ? (
            <div className="flex justify-center">
              <Spin />
            </div>
          ) : reviews.length === 0 ? (
            <p className='text-gray-400'>No reviews yet</p>
          ) : (
            <div className='space-y-4'>
              
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className='bg-[#111] p-4 rounded-xl flex gap-4'
                >
                  {/* 🎮 Game Image */}
                  <div className='w-24 h-20 bg-gray-800 rounded overflow-hidden'>
                    {review.game?.background_image ? (
                        <Link to={`/gamedetails/${review.gameId}`}>
                      <img
                        src={review.game.background_image}
                        alt={review.game.name}
                        className='w-full h-full object-cover'
                      /></Link>
                    ) : (
                      <div className='flex items-center justify-center h-full text-xs text-gray-500'>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* 📄 Content */}
                  <div className='flex flex-col'>
                    
                    {/* Game Name */}
                    <h3 className='text-sm font-semibold mb-1'>
                      {review.game?.name || "Unknown Game"}
                    </h3>

                    {/* Rating */}
                    <p className='text-yellow-400 text-sm'>
                      ⭐ {review.rating}
                    </p>

                    {/* Review */}
                    <p className='text-gray-300 text-sm'>
                      {review.reviewText}
                    </p>

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default Profile;