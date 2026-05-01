import React, { useEffect, useState } from 'react';
import UserAvatar from '../../assets/no_avatar.webp';
import { Spin, Rate, message, Empty, Tooltip } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  LikeFilled,
  DislikeFilled,
  CalendarOutlined,
  FireFilled,
  TrophyOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';

function OtherUser() {
  const { usersId } = useParams();
  const [user, setUser] = useState(null);
  const [ouser, setOuser] = useState(null); 
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch target user profile
  const fetchUser = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:2001/api/users/${id}`);
      setOuser(res.data);
    } catch (err) {
      message.error("Failed to load User");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for this specific user
  const fetchReviews = async (id) => {
    try {
      const res = await axios.get(`http://localhost:2001/api/users/${id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      message.error("Failed to load reviews");
    }
  };

  const likeReview = async (reviewId) => {
    if (!user)  {
      message.error('Please Login to Like');
      navigate('/login')

    };
    try {
      await axios.put(`http://localhost:2001/api/reviews/${reviewId}/like`, {}, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchReviews(usersId);
    } catch (err) { 
      console.log(err)
     }
  };

  const dislikeReview = async (reviewId) => {
     if (!user)  {
      message.error('Please Login to Like');
      navigate('/login')

    };
    try {
      await axios.put(`http://localhost:2001/api/reviews/${reviewId}/dislike`, {}, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchReviews(usersId);
    } catch (err) { 
      console.log(err);
     }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    if (usersId) {
      fetchUser(usersId);
      fetchReviews(usersId);
    }
  }, [usersId]);

  // Calculate some stats
  const totalLikesReceived = reviews.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
  const averageRating = reviews.length ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <main className='min-h-screen bg-[#050505] pb-20 text-white font-tomorrow selection:bg-red-500/30 overflow-x-hidden'>
      {/* Decorative background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-500/5 blur-[120px] pointer-events-none -z-10"></div>

      <div className='max-w-6xl mx-auto px-6 pt-16'>

        {/* Profile Header */}
        <div className='bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center gap-12 backdrop-blur-xl shadow-2xl relative'>
            <div className='relative shrink-0'>
                <div className='absolute -inset-2 bg-gradient-to-tr from-red-600 via-purple-500 to-blue-600 rounded-full blur opacity-40 animate-pulse'></div>
                <img
                    src={ouser?.profilePic || UserAvatar}
                    alt="Avatar"
                    className='relative w-40 h-40 rounded-full border-8 border-[#050505] object-cover bg-[#111]'
                />
                <div className='absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#050505]' title="Online"></div>
            </div>

            <div className='flex-1 text-center md:text-left'>
                <div className='flex flex-col md:flex-row md:items-center gap-4 mb-4'>
                    <h1 className='text-4xl md:text-6xl font-audiowide text-white uppercase'>
                        {ouser?.displayname || 'Soldier'}
                    </h1>
                    
                </div>
                
                <p className='text-red-500 font-bold tracking-[0.3em] text-sm mb-6'>@{ouser?.username}</p>

                {ouser?.bio ? (
                    <p className='text-gray-400 max-w-2xl mb-8 text-lg italic leading-relaxed opacity-80'>
                       "{ouser.bio}"
                    </p>
                ) : (
                    <p className='text-gray-600 mb-8 italic'>This operative hasn't written a bio yet.</p>
                )}

                {/* 📊 Stats Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='bg-white/5 p-4 rounded-2xl border border-white/5 text-center'>
                        <MessageOutlined className='text-red-500 mb-2' />
                        <div className='text-xl font-audiowide'>{reviews.length}</div>
                        <div className='text-[10px] text-gray-500 uppercase font-bold tracking-widest'>Reviews</div>
                    </div>
                    <div className='bg-white/5 p-4 rounded-2xl border border-white/5 text-center'>
                        <FireFilled className='text-orange-500 mb-2' />
                        <div className='text-xl font-audiowide'>{totalLikesReceived}</div>
                        <div className='text-[10px] text-gray-500 uppercase font-bold tracking-widest'>Reputation</div>
                    </div>
                    <div className='bg-white/5 p-4 rounded-2xl border border-white/5 text-center'>
                        <TrophyOutlined className='text-yellow-500 mb-2' />
                        <div className='text-xl font-audiowide'>{averageRating}</div>
                        <div className='text-[10px] text-gray-500 uppercase font-bold tracking-widest'>Avg Score</div>
                    </div>
                    <div className='bg-white/5 p-4 rounded-2xl border border-white/5 text-center'>
                        <CalendarOutlined className='text-blue-500 mb-2' />
                        <div className='text-xl font-audiowide'>{ouser?.createdAt ? new Date(ouser.createdAt).getFullYear() : '2024'}</div>
                        <div className='text-[10px] text-gray-500 uppercase font-bold tracking-widest'>Joined</div>
                    </div>
                </div>
            </div>
        </div>

        {/* 🎮 Activity Section */}
        <section>
          <div className='flex items-center gap-6 mb-12'>
            <h2 className='text-3xl font-audiowide uppercase tracking-widest'>{ouser?.username}'s <span className='text-red-500'>Reviews</span></h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-red-500/50 via-white/5 to-transparent"></div>
          </div>

          {loading ? (
            <div className="py-20 text-center"><Spin size="large" /></div>
          ) : reviews.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='text-gray-500'>No activity logs found for this user.</span>} />
          ) : (
            <div className='space-y-8'>
                {reviews.map((review) => {
                    const liked = user && review.likes?.some(id => id.toString() === user.userid?.toString());
                    const disliked = user && review.dislikes?.some(id => id.toString() === user.userid?.toString());

                    return (
                        <div key={review._id} className='group relative'>
                            {/* Glowing line on hover */}
                            <div className='absolute -left-4 top-0 bottom-0 w-1 bg-red-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500'></div>
                            
                            <div className='bg-[#0d0d0d] border border-white/5 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row gap-10 hover:bg-[#121212] transition-all duration-300'>
                                <Link to={`/gamedetails/${review.gameId}`} className='shrink-0'>
                                    <div className='w-full md:w-56 h-36 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10'>
                                        <img src={review.game?.background_image} alt="" className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                                    </div>
                                </Link>

                                <div className='flex-1 flex flex-col'>
                                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4'>
                                        <Link to={`/gamedetails/${review.gameId}`}>
                                            <h3 className='text-2xl font-audiowide text-white group-hover:text-red-500 transition-colors uppercase'>{review.game?.name}</h3>
                                        </Link>
                                        <div className='flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5'>
                                            <Rate disabled value={review.rating} className='text-[12px] text-red-500' />
                                            <span className='text-xs font-bold text-gray-500 ml-2'>{review.rating}/5</span>
                                        </div>
                                    </div>

                                    <p className='text-gray-400 text-base leading-relaxed mb-8 italic opacity-80'>"{review.reviewText}"</p>

                                    <div className='flex items-center justify-between mt-auto pt-6 border-t border-white/5'>
                                        <div className='flex gap-4'>
                                            <Tooltip title={liked ? "Unlike" : "Like"}>
                                                <button 
                                                    onClick={() => likeReview(review._id)} 
                                                    className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all border ${liked ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-white/5 border-white/10 text-gray-500 hover:border-green-500/50 hover:text-green-500'}`}
                                                >
                                                    <LikeFilled />
                                                    <span className='text-sm font-black'>{review.likes?.length || 0}</span>
                                                </button>
                                            </Tooltip>

                                            <Tooltip title={disliked ? "Undislike" : "Dislike"}>
                                                <button 
                                                    onClick={() => dislikeReview(review._id)} 
                                                    className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all border ${disliked ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-gray-500 hover:border-red-500/50 hover:text-red-500'}`}
                                                >
                                                    <DislikeFilled />
                                                    <span className='text-sm font-black'>{review.dislikes?.length || 0}</span>
                                                </button>
                                            </Tooltip>
                                        </div>

                                        <div className='flex items-center gap-2 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]'>
                                            <CalendarOutlined className='text-red-500/50' />
                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default OtherUser;