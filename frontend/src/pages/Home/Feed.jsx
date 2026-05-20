import React, { useEffect, useState } from 'react';
import { Spin, Empty, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/PostCard';
import ReviewCard from '../../components/ReviewCard'; // Imported out of loop context

function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      message.error('Please login to view your feed');
      navigate('/login');
      return;
    }
    setCurrentUserId(user.userId);
    fetchFeed(user.token);
  }, [navigate]);

  const fetchFeed = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeed(response.data);
    } catch (err) {
      console.error('Failed to load feed:', err);
      message.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setFeed(feed.filter(item => !(item.type === 'post' && item.data._id === postId)));
    message.success('Post removed from feed');
  };

  const handlePostUpdate = (updatedPost) => {
    setFeed(feed.map(item => 
      item.type === 'post' && item.data._id === updatedPost._id 
        ? { ...item, data: updatedPost }
        : item
    ));
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFeed(feed.filter(item => !(item.type === 'review' && item.data._id === reviewId)));
      message.success('Review removed from feed');
    } catch (err) {
      message.error('Failed to delete review');
    }
  };

  // Modern Antd Loading Indicator
  const antIcon = <LoadingOutlined className="text-red-500 text-4xl" spin />;

  if (loading) {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-5 min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1b183a] to-[#24243e] flex justify-center items-center">
        <Spin indicator={antIcon} />
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-5 min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1b183a] to-[#24243e] pt-24 text-center">
        <Empty
          description={<span className="text-gray-400 font-tomorrow">Your transmission feed is completely dark.</span>}
          className="opacity-60"
        />
        <p className="mt-5 text-gray-500 text-xs font-tomorrow px-8 leading-relaxed">
          Follow operators and bookmark your favorite database items to intercept activity logs directly on this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 md:px-5 md:py-8 min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1b183a] to-[#24243e]">
      
      {/* Feed Header */}
      <div className="mb-8 pb-5 border-b border-white/5">
        <h1 className="font-audiowide text-white text-2xl md:text-3xl uppercase tracking-wider bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
          For You
        </h1>
        <p className="text-gray-400 text-xs md:text-sm font-tomorrow mt-2 tracking-wide">
          Data streams and log files from verified units and favorited sectors.
        </p>
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-5">
        {feed.map((item, index) => {
          const uniqueKey = `${item.type}-${item.data?._id || index}`;
          return (
            <div key={uniqueKey} className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
              {item.type === 'post' ? (
                <PostCard
                  post={item.data}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                  currentUserId={currentUserId}
                />
              ) : (
                <ReviewCard 
                  review={item.data} 
                  currentUserId={currentUserId} 
                  onDelete={handleReviewDelete} 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Feed;