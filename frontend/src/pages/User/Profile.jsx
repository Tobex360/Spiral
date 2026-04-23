import React, { useEffect, useState } from 'react';
import UserAvatar from '../../assets/no_avatar.webp';
import { Button, Spin, Modal, Rate, Input, message, Empty, Tooltip } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  MessageOutlined, 
  LikeFilled, 
  DislikeFilled,
  CalendarOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config/api';

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

  // Profile Picture Upload Modal State
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);

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
      fetchReviews(user.userid);
    } catch (err) {
      message.error("Update failed");
    }
  };

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) {
      message.warning("Please select an image first");
      return;
    }

    try {
      setUploadingPic(true);
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post("/api/user/upload-profile-pic", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.profilePic) {
        const updatedUser = { ...user, profilePic: response.data.profilePic };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        message.success("Profile picture updated successfully!");
        setIsProfilePicModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to upload profile picture");
    } finally {
      setUploadingPic(false);
    }
  };

  return (
    <main className='min-h-screen bg-[#0a0a0a] pb-20 text-white font-tomorrow'>
      <div className='max-w-6xl mx-auto px-6 md:px-12 pt-16'>
        
        {/* Profile Header Card */}
        <div className='bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 backdrop-blur-sm'>
          <div className='relative group'>
            <div className='absolute -inset-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition'></div>
            <img 
              src={user?.profilePic || UserAvatar} 
              alt="Avatar" 
              className='relative w-32 h-32 rounded-full border-4 border-[#0a0a0a] object-cover'
            />
          </div>

          <div className='flex-1 text-center md:text-left'>
            <h1 className='text-4xl font-audiowide mb-2 text-white uppercase tracking-tight'>
              {user?.username || 'Gamer'}
            </h1>
            <div className='flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 mb-6'>
              <span><MessageOutlined className="text-red-500 mr-2" /> {reviews.length} Reviews</span>
              <span><UserOutlined className="text-blue-500 mr-2" /> Member since 2024</span>
            </div>
            <Button 
              danger 
              type="primary" 
              className='font-bold uppercase tracking-widest px-8 rounded-full h-10 border-none'
              onClick={() => setIsProfilePicModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* My Activity Section */}
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
                  className='bg-secondary/20 border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 hover:bg-secondary/40 hover:border-red-500/30 transition-all group shadow-xl'
                >
                  {/* Game Thumbnail */}
                  <Link 
                    to={`/gamedetails/${review.gameId}`}
                    className='w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 relative'
                  >
                    {review.game?.background_image ? (
                      <img
                        src={review.game.background_image}
                        alt={review.game.name}
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full text-xs text-gray-600 uppercase'>No Image</div>
                    )}
                  </Link>

                  {/* Review Content */}
                  <div className='flex-1 flex flex-col justify-between'>
                    <div>
                      <div className='flex justify-between items-start mb-1'>
                        <h3 className='text-xl font-bold text-white group-hover:text-red-500 transition-colors font-audiowide'>
                          {review.game?.name || "Loading..."}
                        </h3>
                        
                        <div className='flex gap-1'>
                          <Tooltip title="Edit Review">
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              className='text-gray-500 hover:text-blue-400 flex items-center justify-center'
                              onClick={() => openEditModal(review)}
                            />
                          </Tooltip>
                          <Tooltip title="Delete Review">
                            <Button 
                              type="text" 
                              icon={<DeleteOutlined />} 
                              className='text-gray-500 hover:text-red-500 flex items-center justify-center'
                              onClick={() => handleDelete(review._id)}
                            />
                          </Tooltip>
                        </div>
                      </div>
                      
                      <Rate disabled defaultValue={review.rating} className='text-xs text-red-500 mb-3' />
                      
                      <p className='text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4'>
                        "{review.reviewText}"
                      </p>

                      {/* Updated Likes/Dislikes Section */}
                      <div className='flex items-center gap-4 border-t border-white/5 pt-4 mt-auto'>
                        <div className='flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20'>
                          <LikeFilled className="text-green-500 text-xs" />
                          <span className='text-xs font-bold text-green-500'>{review.likes?.length || 0}</span>
                        </div>

                        <div className='flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20'>
                          <DislikeFilled className="text-red-500 text-xs" />
                          <span className='text-xs font-bold text-red-500'>{review.dislikes?.length || 0}</span>
                        </div>
                        
                       
                        <div className='ml-auto flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold'>
                            <CalendarOutlined className="text-red-500/50" />
                            <span>
                            {review.createdAt 
                                ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })
                                : "Recently"}
                            </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* EDIT MODAL */}
      <Modal
        title={<span className='font-audiowide uppercase text-red-500'>Update Review</span>}
        open={isEditModalOpen}
        onOk={handleUpdateReview}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Update Entry"
        centered
        okButtonProps={{ danger: true, type: 'primary', className: 'font-bold uppercase h-10 px-6 rounded-lg' }}
        cancelButtonProps={{ type: 'text', className: 'text-gray-500' }}
      >
        <div className='space-y-6 pt-4'>
          <div>
            <p className='text-[10px] uppercase text-gray-400 font-bold mb-2 tracking-widest'>Rating Score</p>
            <Rate value={editRating} onChange={setEditRating} className='text-red-500' />
          </div>
          <div>
            <p className='text-[10px] uppercase text-gray-400 font-bold mb-2 tracking-widest'>Edit Content</p>
            <TextArea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoSize={{ minRows: 4 }}
              className='bg-black/20 border-white/10 text-white rounded-lg hover:border-red-500 focus:border-red-500'
            />
          </div>
        </div>
      </Modal>

      {/* PROFILE PICTURE UPLOAD MODAL */}
      <Modal
        title={<span className='font-audiowide uppercase text-red-500'>Update Profile Picture</span>}
        open={isProfilePicModalOpen}
        onOk={handleUploadProfilePic}
        onCancel={() => {
          setIsProfilePicModalOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        }}
        okText="Upload Picture"
        centered
        confirmLoading={uploadingPic}
        okButtonProps={{ danger: true, type: 'primary', className: 'font-bold uppercase h-10 px-6 rounded-lg' }}
        cancelButtonProps={{ type: 'text', className: 'text-gray-500' }}
      >
        <div className='space-y-6 pt-4'>
          {/* Preview Section */}
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur opacity-25'></div>
              <img
                src={previewUrl || user?.profilePic || UserAvatar}
                alt="Profile Preview"
                className='relative w-32 h-32 rounded-full border-4 border-[#0a0a0a] object-cover'
              />
            </div>
            <p className='text-xs text-gray-400'>
              {previewUrl ? 'New image preview' : 'Current profile picture'}
            </p>
          </div>

          {/* File Input Section */}
          <div>
            <p className='text-[10px] uppercase text-gray-400 font-bold mb-3 tracking-widest'>Select Image</p>
            <div className='border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-red-500/50 transition-colors cursor-pointer'>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className='hidden'
                id="profile-pic-input"
              />
              <label htmlFor="profile-pic-input" className='cursor-pointer flex flex-col items-center gap-2'>
                <svg
                  className='w-8 h-8 text-red-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                <span className='text-sm text-gray-300'>
                  {selectedFile ? selectedFile.name : 'Click to select image'}
                </span>
                <span className='text-xs text-gray-500'>PNG, JPG, GIF up to 10MB</span>
              </label>
            </div>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
              <p className='text-xs text-gray-400'>
                <span className='text-red-500 font-bold'>Selected:</span> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>
      </Modal>
    </main>
  );
}

export default Profile;