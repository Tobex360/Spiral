import React, { useEffect, useState } from 'react';
import UserAvatar from '../../assets/no_avatar.webp';
import { Spin, Rate, message, Empty, Tooltip, Button, Segmented, Modal } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  LikeFilled,
  DislikeFilled,
  CalendarOutlined,
  FireFilled,
  TrophyOutlined,
  UserAddOutlined,
  UserDeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PostCard from '../../components/PostCard';

function OtherUser() {
  const { usersId } = useParams();
  const [following, setFollowing] = useState([]);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0
  });
  const [user, setUser] = useState(null);
  const [ouser, setOuser] = useState(null); 
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activityView, setActivityView] = useState('reviews'); // 'reviews' or 'posts'
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
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

  const fetchReviews = async (id) => {
    try {
      const res = await axios.get(`http://localhost:2001/api/users/${id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      message.error("Failed to load reviews");
    }
  };

  const fetchPosts = async (id) => {
    try {
      const res = await axios.get(`http://localhost:2001/api/posts/user/${id}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setPosts([]);
    }
  };

  const likeReview = async (reviewId) => {
    if (!user) {
      message.error('Please Login to Like');
      navigate('/login');
      return;
    }
    try {
      await axios.put(`http://localhost:2001/api/reviews/${reviewId}/like`, {}, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchReviews(usersId);
    } catch (err) { console.log(err); }
  };

  const dislikeReview = async (reviewId) => {
    if (!user) {
      message.error('Please Login to Dislike');
      navigate('/login');
      return;
    }
    try {
      await axios.put(`http://localhost:2001/api/reviews/${reviewId}/dislike`, {}, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchReviews(usersId);
    } catch (err) { console.log(err); }
  };

  const fetchFollowing = async (user) => {
    try {
      const res = await axios.get(`http://localhost:2001/api/follow/following/${user.userid}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFollowing(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchFollowStats = async (id) => {
    try {
      const res = await axios.get(`http://localhost:2001/api/follow/stats/${id}`);
      setFollowStats(res.data);
    } catch (err) { console.log(`Error Fetching followStats ${err}`); }
  };

  const isFollowing = (id) => {
    return following.some(f => f.following._id === id);
  };

  const toggleFollow = async (id) => {
    if (!user) {
      message.error("Login to follow users");
      navigate('/login');
      return;
    }
    if (user?.userid === usersId) return;

    try {
      const exists = isFollowing(id);
      if (exists) {
        await axios.delete(`http://localhost:2001/api/follow/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setFollowing(prev => prev.filter(f => f.following._id !== id));
      } else {
        await axios.post('http://localhost:2001/api/follow', { userId: id }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setFollowing(prev => [...prev, { following: { _id: id } }]);
      }
      await fetchFollowStats(usersId);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    }
    if (usersId) {
      fetchUser(usersId);
      fetchReviews(usersId);
      fetchPosts(usersId);
      fetchFollowStats(usersId);
    }
  }, [usersId]);

  useEffect(() => {
    if (user) {
      fetchFollowing(user);
    }
  }, [user]);

  const totalLikesReceived = reviews.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
  const averageRating = reviews.length ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <main className='min-h-screen bg-[#050505] pb-20 text-white font-tomorrow selection:bg-red-500/30 overflow-x-hidden'>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-500/5 blur-[120px] pointer-events-none -z-10"></div>

      <div className='max-w-6xl mx-auto px-6 pt-16'>

        {/* Profile Header */}
<div className='bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-start gap-12 backdrop-blur-xl shadow-2xl relative'>
    <div className='relative shrink-0'>
        <div className='absolute -inset-2 bg-gradient-to-tr from-red-600 via-purple-500 to-blue-600 rounded-full blur opacity-40 animate-pulse'></div>
        <img
            src={ouser?.profilePic || UserAvatar}
            alt="Avatar"
            className='relative w-40 h-40 rounded-full border-8 border-[#050505] object-cover bg-[#111] hover:cursor-pointer hover:opacity-80'
            onClick={()=>setPreviewOpen(true)}
        />
    </div>

    <div className='flex-1 text-left w-full'>
        <div className='flex items-start justify-between gap-4 mb-2'>
            <div>
              <h1 className='text-4xl md:text-5xl font-audiowide text-white uppercase leading-none'>
                  {ouser?.displayname || 'Soldier'}
              </h1>
              <p className='text-primary font-tomorrow text-sm mt-1'>@{ouser?.username}</p>
            </div>

            {/* TWITTER-STYLE PILL BUTTON */}
            {user?.userid !== usersId && (
              <button
                onClick={() => toggleFollow(usersId)}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-200 text-sm
                  ${isFollowing(usersId) 
                    ? "bg-transparent border border-white/20 text-white hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5" 
                    : "bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  }
                `}
              >
                {isFollowing(usersId) ? "Following" : "Follow"}
              </button>
            )}
        </div>
        
        {/* BIO SECTION */}
        <div className="mt-4 mb-4">
          {ouser?.bio ? (
              <p className='text-gray-300 max-w-2xl text-base leading-relaxed font-tomorrow'>
                  {ouser.bio}
              </p>
          ) : (
              <p className='text-gray-600 italic text-sm'>No bio provided.</p>
          )}
        </div>

        {/* STATS */}
        <div className='flex items-center gap-6 mb-8 font-tomorrow'>
            <Link to={`/connection/${usersId}`}>
              <div className="cursor-pointer hover:underline decoration-red-500 transition-all">
                  <span className="font-bold text-white">{followStats.following}</span>
                  <span className="text-gray-500 ml-1 text-sm uppercase tracking-wider">Following</span>
              </div>
            </Link>
            <Link to={`/connection/${usersId}`}>
              <div className="cursor-pointer hover:underline decoration-red-500 transition-all">
                  <span className="font-bold text-white">{followStats.followers}</span>
                  <span className="text-gray-500 ml-1 text-sm uppercase tracking-wider">Followers</span>
              </div>
            </Link>
        </div>

        {/* COMPACT STATS GRID (Original Stats) */}
        <div className='flex flex-wrap gap-4 pt-4 border-t border-white/5'>
            <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5'>
                <MessageOutlined className='text-red-500 text-xs' />
                <span className='text-xs font-audiowide'>{reviews.length} <span className="text-[9px] text-gray-500 font-tomorrow">LOGS</span></span>
            </div>
            <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5'>
                <FireFilled className='text-orange-500 text-xs' />
                <span className='text-xs font-audiowide'>{totalLikesReceived} <span className="text-[9px] text-gray-500 font-tomorrow">REP</span></span>
            </div>
            <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5'>
                <CalendarOutlined className='text-blue-500 text-xs' />
                <span className='text-xs font-audiowide'>{ouser?.createdAt ? new Date(ouser.createdAt).getFullYear() : '2024'}</span>
            </div>
        </div>
    </div>
</div>
        {/* 🎮 Activity Section */}
        <section>
          <div className='flex items-center gap-6 mb-6'>
            <h2 className='text-3xl font-audiowide uppercase tracking-widest'>{ouser?.username}'s <span className='text-red-500'>Activity</span></h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-red-500/50 via-white/5 to-transparent"></div>
          </div>

          <Segmented
            value={activityView}
            onChange={setActivityView}
            options={[
              { label: 'Reviews', value: 'reviews' },
              { label: 'Posts', value: 'posts' },
            ]}
            className="w-full mb-8"
          />

          {loading ? (
            <div className="py-20 text-center"><Spin size="large" /></div>
          ) : activityView === 'reviews' ? (
            reviews.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='text-gray-500'>No activity logs found for this user.</span>} />
            ) : (
              <div className='space-y-8'>
                {reviews.map((review) => {
                    const liked = user && review.likes?.some(id => id.toString() === user.userid?.toString());
                    const disliked = user && review.dislikes?.some(id => id.toString() === user.userid?.toString());

                    return (
                        <div key={review._id} className='group relative'>
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
            )
          ) : (
            posts.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='text-gray-500'>No posts yet from this user.</span>} />
            ) : (
              <div className='space-y-6'>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={user?.userid}
                    onDelete={() => fetchPosts(usersId)}
                    onUpdate={() => fetchPosts(usersId)}
                  />
                ))}
              </div>
            )
          )}
        </section>
      </div>
      {/* IMAGE PREVIEW MODAL - High End Overlay */}
    <Modal
      open={previewOpen}
      footer={null}
      onCancel={() => setPreviewOpen(false)}
      centered
      width="auto"
      closeIcon={null} // Remove default X
      modalRender={(modal) => (
        <div className="relative group/close">
          {/* Custom Close Button */}
          <button 
            onClick={() => setPreviewOpen(false)}
            className="absolute -top-12 right-0 text-white/50 hover:text-red-500 transition-colors flex items-center gap-2 font-tomorrow text-xs tracking-widest"
          >
            CLOSE [ESC]
          </button>
          {modal}
        </div>
      )}
      styles={{
        mask: {
          backdropFilter: 'blur(12px)',
          background: 'rgba(0, 0, 0, 0.85)',
        },
        content: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
        body: {
          padding: 0,
          background: 'transparent',
          display: 'flex',
          justifyContent: 'center',
        }
      }}
    >
      <div className="relative max-w-[95vw] lg:max-w-[80vw]">
        {/* Glow effect behind the image */}
        <div className="absolute -inset-4 bg-red-600/10 blur-[100px] rounded-full opacity-50" />
        
        <img
          src={ouser?.profilePic || UserAvatar}
          alt="Preview"
          className="relative z-10 w-full max-h-[85vh] object-contain border border-white/10 shadow-2xl"
        />
      </div>
    </Modal>
    </main>
  );
}

export default OtherUser;