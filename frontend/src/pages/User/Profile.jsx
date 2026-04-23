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
  CalendarOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';

const { TextArea } = Input;

function Profile() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditDisplayname(parsedUser.displayname || '');
      setEditBio(parsedUser.bio || '');
      fetchReviews(parsedUser.userid);
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
      title: <span className="text-white font-audiowide">DELETE REVIEW</span>,
      content: <span className="text-gray-400">This action cannot be undone. Are you sure?</span>,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      className: 'dark-modal',
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

  return (
    <main className='min-h-screen bg-[#050505] pb-20 text-white font-tomorrow selection:bg-red-500/30'>
      <div className='max-w-6xl mx-auto px-6 pt-16'>

        {/* Profile Header Card */}
        <div className='bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2rem] p-8 mb-12 flex flex-col md:flex-row items-center gap-10 backdrop-blur-md shadow-2xl relative overflow-hidden'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[80px] rounded-full"></div>

            {/* Avatar Section */}
            <div className='relative group cursor-pointer' onClick={() => setIsProfilePicModalOpen(true)}>
                <div className='absolute -inset-1.5 bg-gradient-to-tr from-red-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-500'></div>
                <img
                    src={user?.profilePic || UserAvatar}
                    alt="Avatar"
                    className='relative w-36 h-36 rounded-full border-[6px] border-[#0a0a0a] object-cover bg-[#111]'
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <CloudUploadOutlined className="text-2xl text-white" />
                </div>
            </div>

            <div className='flex-1 text-center md:text-left z-10'>
                <h1 className='text-4xl md:text-5xl font-audiowide mb-1 text-white uppercase tracking-tight'>
                    {user?.displayname || 'Player One'}
                </h1>
                <p className='text-red-500 font-bold tracking-widest text-sm mb-4'>@{user?.username || 'user'}</p>

                {user?.bio && (
                    <p className='text-gray-400 max-w-xl mb-6 text-base leading-relaxed'>
                        <span className="text-red-500/50 font-serif text-2xl leading-0 italic mr-1">"</span>
                        {user.bio}
                        <span className="text-red-500/50 font-serif text-2xl leading-0 italic ml-1">"</span>
                    </p>
                )}

                <div className='flex flex-wrap justify-center md:justify-start gap-8 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-8'>
                    <div className="flex items-center gap-2"><MessageOutlined className="text-red-500" /> {reviews.length} Reviews</div>
                    <div className="flex items-center gap-2"><UserOutlined className="text-blue-500" /> Joined {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</div>
                </div>

                <Button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className='bg-white text-black border-none font-bold uppercase tracking-widest px-10 h-12 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg shadow-white/5'
                >
                    Edit Profile
                </Button>
            </div>
        </div>

        {/* 🎮 Activity Section */}
        <section>
          <div className='flex items-center gap-4 mb-10'>
            <h2 className='text-2xl font-audiowide uppercase tracking-widest'>Review <span className='text-red-500'>History</span></h2>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>

          {loading ? (
            <div className="py-20 text-center"><Spin size="large" /></div>
          ) : reviews.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='text-gray-500'>The library is empty. Go review some games!</span>} />
          ) : (
            <div className='grid gap-6'>
              {reviews.map((review) => (
                <div key={review._id} className='bg-[#111] border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row gap-8 hover:bg-[#161616] hover:border-white/10 transition-all group'>
                  <Link to={`/gamedetails/${review.gameId}`} className='w-full sm:w-48 h-32 rounded-2xl overflow-hidden bg-black flex-shrink-0 relative shadow-2xl'>
                    <img src={review.game?.background_image} alt="" className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                  </Link>

                  <div className='flex-1 flex flex-col'>
                    <div className='flex justify-between items-start mb-2'>
                        <h3 className='text-xl font-audiowide text-white group-hover:text-red-500 transition-colors uppercase'><Link to={`/gamedetails/${review.gameId}`}>{review.game?.name}</Link></h3>
                        <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Button type="text" icon={<EditOutlined />} className='text-gray-400 hover:text-blue-400' onClick={() => openEditModal(review)} />
                            <Button type="text" icon={<DeleteOutlined />} className='text-gray-400 hover:text-red-500' onClick={() => handleDelete(review._id)} />
                        </div>
                    </div>
                    <Rate disabled defaultValue={review.rating} className='text-[10px] text-red-500 mb-4' />
                    <p className='text-gray-400 text-sm leading-relaxed mb-6 italic'>"{review.reviewText}"</p>

                    <div className='flex items-center gap-6 mt-auto'>
                        <div className='flex items-center gap-2 text-xs font-bold'><LikeFilled className="text-green-500" /> {review.likes?.length || 0}</div>
                        <div className='flex items-center gap-2 text-xs font-bold'><DislikeFilled className="text-red-500" /> {review.dislikes?.length || 0}</div>
                        <div className='ml-auto flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tighter'>
                            <CalendarOutlined /> {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>


      {/* Edit Profile Modal */}
      <Modal
        title={<span className="font-audiowide text-Black uppercase">Edit Profile</span>}
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
          <Button block type="dashed" className="text-gray-400 border-gray-800 h-12 rounded-xl" onClick={() => { setIsEditProfileModalOpen(false); setIsProfilePicModalOpen(true); }}>
            Update Avatar Image
          </Button>
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
        okText="Sync Avatar"
      >
        <div className='flex flex-col items-center py-4'>
            <div className='mb-8 relative'>
                <img src={previewUrl || user?.profilePic || UserAvatar} className='w-32 h-32 rounded-full object-cover border-4 border-red-500/20' alt="" />
            </div>
            <label className='w-full cursor-pointer'>
                <input type="file" accept="image/*" onChange={handleFileSelect} className='hidden' />
                <div className='border-2 border-dashed border-white/10 hover:border-red-500/50 transition-colors rounded-2xl p-8 text-center'>
                    <CloudUploadOutlined className="text-3xl text-red-500 mb-2" />
                    <p className="text-sm text-gray-400">{selectedFile ? selectedFile.name : "Drag & Drop or Click to Browse"}</p>
                </div>
            </label>
        </div>
      </Modal>

       {/* EDIT MODAL */}

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
              className='bg-black/20 border-white/10 text-black rounded-lg hover:border-red-500 focus:border-red-500'
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default Profile;