import React, { useEffect, useState } from 'react';
import UserAvatar from '../../assets/no_avatar.webp';
import { Button, Spin, Modal, Rate, Input, message, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';

const { TextArea } = Input;

function Profile() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");

  const fetchReviews = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/reviews/user/${userId}`);

      const reviewsWithGames = await Promise.all(
        res.data.map(async (review) => {
          try {
            const gameRes = await axios.get(`/api/games/${review.gameId}`);
            return { ...review, game: gameRes.data };
          } catch {
            return { ...review, game: null };
          }
        })
      );
      setReviews(reviewsWithGames);
    } catch (err) {
      message.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchReviews(parsedUser.userid);
    }
  }, []);

  // ✏️ Handle Edit
  const openEditModal = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditText(review.reviewText);
    setIsEditModalOpen(true);
  };

  const handleUpdateReview = async () => {
    try {
      await axios.put(`/api/reviews/${editingReview._id}`, {
        rating: editRating,
        reviewText: editText,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      message.success("Review updated");
      setIsEditModalOpen(false);
      fetchReviews(user.userid); // Refresh
    } catch (err) {
      message.error("Update failed");
    }
  };

  // 🗑️ Handle Delete
  const handleDelete = (reviewId) => {
    Modal.confirm({
      title: 'Delete Review',
      content: 'Are you sure you want to delete this review?',
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await axios.delete(`/api/reviews/${reviewId}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          message.success("Review removed");
          fetchReviews(user.userid);
        } catch (err) {
          message.error("Delete failed");
        }
      },
    });
  };

  return (
    <main className='min-h-screen bg-[#0a0a0a] pb-20 text-white'>
      <div className='max-w-6xl mx-auto px-6 md:px-12 pt-16'>
        
        {/* 🔥 Profile Header Card */}
        <div className='bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 backdrop-blur-sm'>
          <div className='relative group'>
            <div className='absolute -inset-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition'></div>
            <img 
              src={UserAvatar} 
              alt="Avatar" 
              className='relative w-32 h-32 rounded-full border-4 border-[#0a0a0a] object-cover'
            />
          </div>

          <div className='flex-1 text-center md:text-left'>
            <h1 className='text-4xl font-audiowide mb-2 text-white uppercase tracking-tight'>
              {user?.username || 'Gamer'}
            </h1>
            <div className='flex flex-wrap justify-center md:justify-start gap-6 text-sm font-tomorrow text-gray-400 mb-6'>
              <span><MessageOutlined className="text-red-500 mr-2" /> {reviews.length} Reviews</span>
              <span><UserOutlined className="text-blue-500 mr-2" /> Member since 2024</span>
            </div>
            <Button 
              danger 
              type="primary" 
              className='font-bold uppercase tracking-widest px-8 rounded-full h-10'
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* 🎮 Review Section */}
        <section>
          <div className='flex items-center justify-between mb-8'>
            <h2 className='text-2xl font-audiowide uppercase tracking-widest'>
              My <span className='text-red-500'>Activity</span>
            </h2>
          </div>

          {loading ? (
            <div className="py-20 text-center"><Spin size="large" /></div>
          ) : reviews.length === 0 ? (
            <Empty description={<span className='text-gray-500'>You haven't written any reviews yet.</span>} />
          ) : (
            <div className='grid gap-6'>
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className='bg-secondary/40 border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row gap-6 hover:border-red-500/30 transition-all group'
                >
                  {/* Game Thumbnail */}
                  <Link 
                    to={`/gamedetails/${review.gameId}`}
                    className='w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0'
                  >
                    {review.game?.background_image ? (
                      <img
                        src={review.game.background_image}
                        alt={review.game.name}
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full text-xs text-gray-600'>No Image</div>
                    )}
                  </Link>

                  {/* Review Content */}
                  <div className='flex-1 flex flex-col justify-between'>
                    <div>
                      <div className='flex justify-between items-start'>
                        <h3 className='text-lg font-bold text-white group-hover:text-red-500 transition-colors'>
                          {review.game?.name || "Loading Game..."}
                        </h3>
                        
                        {/* Action Buttons */}
                        <div className='flex gap-2'>
                          <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            className='text-gray-500 hover:text-blue-400'
                            onClick={() => openEditModal(review)}
                          />
                          <Button 
                            type="text" 
                            icon={<DeleteOutlined />} 
                            className='text-gray-500 hover:text-red-500'
                            onClick={() => handleDelete(review._id)}
                          />
                        </div>
                      </div>
                      <Rate disabled defaultValue={review.rating} className='text-xs text-red-500 mb-2' />
                      <p className='text-gray-400 text-sm leading-relaxed line-clamp-2'>
                        {review.reviewText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ✏️ EDIT MODAL */}
      <Modal
        title={<span className='font-audiowide uppercase tracking-tighter'>Edit Review</span>}
        open={isEditModalOpen}
        onOk={handleUpdateReview}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save Changes"
        centered
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <div className='space-y-4 pt-4'>
          <div>
            <p className='text-xs uppercase text-gray-500 mb-2'>Update Rating</p>
            <Rate value={editRating} onChange={setEditRating} className='text-red-500' />
          </div>
          <div>
            <p className='text-xs uppercase text-gray-500 mb-2'>Update Thoughts</p>
            <TextArea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoSize={{ minRows: 4 }}
              className='bg-black/10 border-white/10'
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default Profile;