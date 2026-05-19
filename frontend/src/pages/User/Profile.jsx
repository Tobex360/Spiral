import React, { useEffect, useState } from 'react';
import UserAvatar from '../../assets/no_avatar.webp';
import { Button, Spin, Modal, Rate, Input, message, Empty, Tooltip, Segmented } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MessageOutlined,
  LikeFilled,
  DislikeFilled,
  CalendarOutlined,
  FireFilled,
  CloudUploadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PostCard from '../../components/PostCard';

const { TextArea } = Input;

function Profile() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activityView, setActivityView] = useState('reviews'); // 'reviews' or 'posts'
  const [loading, setLoading] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });

  // Modals & Forms State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editDisplayname, setEditDisplayname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

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

  const fetchFollowStats = async (id) => {
    try {
      const res = await axios.get(`/api/follow/stats/${id}`);
      setFollowStats(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchPosts = async (userId) => {
    try {
      const res = await axios.get(`/api/posts/user/${userId}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setPosts([]);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditDisplayname(parsedUser.displayname || '');
      setEditBio(parsedUser.bio || '');
      fetchReviews(parsedUser.userid);
      fetchPosts(parsedUser.userid);
      fetchFollowStats(parsedUser.userid);
    }
  }, []);

  // --- Handlers ---
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
      title: <span className="text-primary font-audiowide">DELETE REVIEW</span>,
      content: <span className="text-gray-400">This action cannot be undone. Are you sure?</span>,
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

  const handleUpdateUserProfile = async () => {
    if (!editDisplayname.trim()) return message.warning('Display name required');
    try {
      setUpdatingProfile(true);
      const response = await axios.put('/api/user/update-profile', {
        displayname: editDisplayname,
        bio: editBio,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const updatedUser = { ...user, displayname: response.data.displayname, bio: response.data.bio };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      message.success('Profile updated!');
      setIsEditProfileModalOpen(false);
    } catch (err) {
      message.error('Update failed');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) return message.warning("Select an image");
    try {
      setUploadingPic(true);
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await axios.post("/api/user/upload-profile-pic", formData, {
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" },
      });
      const updatedUser = { ...user, profilePic: response.data.profilePic };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      message.success("Avatar updated!");
      setIsProfilePicModalOpen(false);
    } catch (err) {
      message.error("Upload failed");
    } finally {
      setUploadingPic(false);
    }
  };

  const totalLikesReceived = reviews.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);

  return (
    <main className='min-h-screen bg-[#050505] pb-20 text-white font-tomorrow selection:bg-red-500/30'>
      <div className='max-w-6xl mx-auto px-6 pt-16'>

        {/* Profile Header Card */}
        <div className='bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-start gap-12 backdrop-blur-xl shadow-2xl relative overflow-hidden'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[80px] rounded-full"></div>

            {/* Avatar Section */}
            <div className='relative group cursor-pointer shrink-0' onClick={() => setIsProfilePicModalOpen(true)}>
                <div className='absolute -inset-1.5 bg-gradient-to-tr from-red-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-500'></div>
                <img
                    src={user?.profilePic || UserAvatar}
                    alt="Avatar"
                    className='relative w-40 h-40 rounded-full border-[6px] border-[#0a0a0a] object-cover bg-[#111]'
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <CloudUploadOutlined className="text-2xl text-white" />
                </div>
            </div>

            <div className='flex-1 text-left w-full z-10'>
                <div className='flex items-start justify-between gap-4 mb-2'>
                    <div>
                      <h1 className='text-4xl md:text-5xl font-audiowide text-white uppercase leading-none'>
                          {user?.displayname || 'Player One'}
                      </h1>
                      <p className='text-primary font-tomorrow text-sm mt-1'>@{user?.username || 'user'}</p>
                    </div>

                    <button
                        onClick={() => setIsEditProfileModalOpen(true)}
                        className="px-6 py-2 rounded-full font-bold transition-all duration-200 text-sm bg-white text-black hover:bg-gray-200"
                    >
                        Edit Profile
                    </button>
                </div>
                
                {/* BIO SECTION */}
                <div className="mt-4 mb-4">
                  {user?.bio ? (
                      <p className='text-gray-300 max-w-2xl text-base leading-relaxed'>
                          {user.bio}
                      </p>
                  ) : (
                      <p className='text-gray-600 italic text-sm'>No bio provided. Edit your profile to add one.</p>
                  )}
                </div>

                {/* SOCIAL STATS */}
                <div className='flex items-center gap-6 mb-8 font-tomorrow'>
                    <Link to={`/connection/${user?.userid}`}>
                      <div className="cursor-default hover:underline">
                          <span className="font-bold text-white">{followStats.following}</span>
                          <span className="text-gray-500 ml-1 text-sm uppercase tracking-wider">Following</span>
                      </div>
                    </Link>
                    <Link to={`/connection/${user?.userid}`}>
                      <div className="cursor-default hover:underline">
                          <span className="font-bold text-white">{followStats.followers}</span>
                          <span className="text-gray-500 ml-1 text-sm uppercase tracking-wider">Followers</span>
                      </div>
                    </Link>
                </div>

                {/* COMPACT TECHNICAL STATS */}
                <div className='flex flex-wrap gap-4 pt-4 border-t border-white/5'>
                    <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5 text-gray-400'>
                        <MessageOutlined className='text-red-500 text-xs' />
                        <span className='text-xs font-audiowide'>{reviews.length} <span className="text-[9px] font-tomorrow">LOGS</span></span>
                    </div>
                    <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5 text-gray-400'>
                        <FireFilled className='text-orange-500 text-xs' />
                        <span className='text-xs font-audiowide text-white'>{totalLikesReceived} <span className="text-[9px] text-gray-500 font-tomorrow">REP</span></span>
                    </div>
                    <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5 text-gray-400'>
                        <CalendarOutlined className='text-blue-500 text-xs' />
                        <span className='text-xs font-audiowide text-white'>{user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 🎮 Activity Section */}
        <section>
          <div className='flex items-center gap-4 mb-6'>
            <h2 className='text-2xl font-audiowide uppercase tracking-widest'>Your <span className='text-red-500'>Activity</span></h2>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>

          <Segmented
            value={activityView}
            onChange={setActivityView}
            options={[
              { label: `Reviews (${reviews.length})`, value: 'reviews' },
              { label: `posts (${posts.length})`, value: 'posts' },
            ]}
            className="w-full mb-6"
          />

          {loading ? (
            <div className="py-20 text-center"><Spin size="large"  /></div>
          ) : activityView === 'reviews' ? (
            reviews.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='text-gray-500'>The library is empty. Go review some games!</span>} />
            ) : (
              <div className='grid gap-6'>
                {reviews.map((review) => (
                <div key={review._id} className='bg-[#0d0d0d] border border-white/5 p-6 rounded-[2rem] flex flex-col sm:flex-row gap-8 hover:bg-[#121212] transition-all group relative overflow-hidden'>
                  <div className='absolute -left-4 top-0 bottom-0 w-1 bg-red-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500'></div>
                  
                  <Link to={`/gamedetails/${review.gameId}`} className='w-full sm:w-48 h-32 rounded-2xl overflow-hidden bg-black flex-shrink-0 relative shadow-2xl ring-1 ring-white/10'>
                    <img src={review.game?.background_image} alt="" className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                  </Link>

                  <div className='flex-1 flex flex-col'>
                    <div className='flex justify-between items-start mb-2'>
                        <h3 className='text-xl font-audiowide text-white group-hover:text-red-500 transition-colors uppercase'><Link to={`/gamedetails/${review.gameId}`}>{review.game?.name}</Link></h3>
                        <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Tooltip title="Edit">
                                <Button type="text" icon={<EditOutlined />} className='text-gray-500 hover:text-blue-400' onClick={() => openEditModal(review)} />
                            </Tooltip>
                            <Tooltip title="Delete">
                                <Button type="text" icon={<DeleteOutlined />} className='text-gray-500 hover:text-red-500' onClick={() => handleDelete(review._id)} />
                            </Tooltip>
                        </div>
                    </div>
                    <Rate disabled value={review.rating} className='text-[10px] text-red-500 mb-4' />
                    <p className='text-gray-400 text-sm leading-relaxed mb-6 italic opacity-80'>"{review.reviewText}"</p>

                    <div className='flex items-center gap-6 mt-auto pt-4 border-t border-white/5'>
                        <div className='flex items-center gap-2 text-xs font-bold text-gray-500'><LikeFilled className="text-green-500/50" /> {review.likes?.length || 0}</div>
                        <div className='flex items-center gap-2 text-xs font-bold text-gray-500'><DislikeFilled className="text-red-500/50" /> {review.dislikes?.length || 0}</div>
                        <div className='ml-auto flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest'>
                            <CalendarOutlined className="text-red-500/30" /> {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )
          ) : (
            posts.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='text-gray-500'>No posts yet. Create one to share with the community!</span>} />
            ) : (
              <div className='grid gap-6'>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={user?.userid}
                    onDelete={() => fetchPosts(user?.userid)}
                    onUpdate={() => fetchPosts(user?.userid)}
                  />
                ))}
              </div>
            )
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title={<span className="font-audiowide text-black uppercase">Edit Profile</span>}
        open={isEditProfileModalOpen}
        onOk={handleUpdateUserProfile}
        onCancel={() => setIsEditProfileModalOpen(false)}
        centered
        confirmLoading={updatingProfile}
        okButtonProps={{ danger: true, type: 'primary', className: 'h-10 rounded-lg px-8 font-bold' }}
      >
        <div className='space-y-6'>
          <div>
            <label className='text-[10px] uppercase text-gray-500 font-black tracking-widest block mb-2'>Public Display Name</label>
            <Input value={editDisplayname} onChange={(e) => setEditDisplayname(e.target.value)} className='h-12 rounded-xl' />
          </div>
          <div>
            <label className='text-[10px] uppercase text-gray-500 font-black tracking-widest block mb-2'>Your Bio</label>
            <TextArea value={editBio} onChange={(e) => setEditBio(e.target.value)} autoSize={{ minRows: 3 }} className='rounded-xl p-4' />
          </div>
        </div>
      </Modal>

      {/* Profile Pic Modal */}
      <Modal
        title={<span className="font-audiowide text-white uppercase">Upload Avatar</span>}
        open={isProfilePicModalOpen}
        onOk={handleUploadProfilePic}
        onCancel={() => setIsProfilePicModalOpen(false)}
        centered
        confirmLoading={uploadingPic}
        okText="Change Picture"
      >
        <div className='flex flex-col items-center py-4'>
            <div className='mb-8 relative'>
                <img src={previewUrl || user?.profilePic || UserAvatar} className='w-32 h-32 rounded-full object-cover border-4 border-red-500/20' alt="" />
            </div>
            <label className='w-full cursor-pointer'>
                <input type="file" accept="image/*" onChange={handleFileSelect} className='hidden' />
                <div className='border-2 border-dashed border-white/10 hover:border-red-500/50 transition-colors rounded-2xl p-8 text-center'>
                    <CloudUploadOutlined className="text-3xl text-red-500 mb-2" />
                    <p className="text-sm text-gray-400">{selectedFile ? selectedFile.name : "Click to Browse"}</p>
                </div>
            </label>
        </div>
      </Modal>

       {/* EDIT REVIEW MODAL */}
      <Modal
        title={<span className='font-audiowide uppercase text-black'>Update Review</span>}
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
              className='bg-black/5 border-white/10 rounded-lg hover:border-red-500 focus:border-red-500'
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default Profile;