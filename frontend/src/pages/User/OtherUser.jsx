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
import { Link, useParams } from 'react-router-dom';

const { TextArea } = Input;

function OtherUser() {

  const { usersId } = useParams();
  const [user, setUser] = useState(null);
  const [ouser, setOuser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
 
  const fetchUser = async (usersId) =>{
    try{
        setLoading(true);
        const res = await axios.get(`/api/users/${usersId}`);
        setOuser(res.data);
    }catch(err){
         message.error("Failed to load User");
    }finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (usersId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${usersId}/reviews`);
      
      setReviews(res.data);
    } catch (err) {
      message.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    try {
        const stored = localStorage.getItem('user');
        if (stored) {
        setUser(JSON.parse(stored));
        }
    } catch {
        setUser(null);
    }
    }, []);

  useEffect(() => {
    if (usersId) {
        fetchUser(usersId);
      fetchReviews(usersId);
    }
  }, [usersId]);

  // --- Handlers ---


  return (
    <main className='min-h-screen bg-[#050505] pb-20 text-white font-tomorrow selection:bg-red-500/30'>
      <div className='max-w-6xl mx-auto px-6 pt-16'>

        {/* Profile Header Card */}
        <div className='bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2rem] p-8 mb-12 flex flex-col md:flex-row items-center gap-10 backdrop-blur-md shadow-2xl relative overflow-hidden'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[80px] rounded-full"></div>

            {/* Avatar Section */}
            <div className='relative group cursor-pointer'>
                <div className='absolute -inset-1.5 bg-gradient-to-tr from-red-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-500'></div>
                <img
                    src={ouser?.profilePic ? ouser.profilePic : UserAvatar}
                    alt="Avatar"
                    className='relative w-36 h-36 rounded-full border-[6px] border-[#0a0a0a] object-cover bg-[#111]'
                />
            </div>

            <div className='flex-1 text-center md:text-left z-10'>
                <h1 className='text-4xl md:text-5xl font-audiowide mb-1 text-white uppercase tracking-tight'>
                    {ouser?.displayname || 'Player One'}
                </h1>
                <p className='text-red-500 font-bold tracking-widest text-sm mb-4'>@{ouser?.username || 'user'}</p>

                {ouser?.bio && (
                    <p className='text-gray-400 max-w-xl mb-6 text-base leading-relaxed'>
                        <span className="text-red-500/50 font-serif text-2xl leading-0 italic mr-1">"</span>
                        {ouser?.bio}
                        <span className="text-red-500/50 font-serif text-2xl leading-0 italic ml-1">"</span>
                    </p>
                )}

                <div className='flex flex-wrap justify-center md:justify-start gap-8 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-8'>
                    <div className="flex items-center gap-2"><MessageOutlined className="text-red-500" /> {reviews.length} Reviews</div>
                    <div className="flex items-center gap-2"><UserOutlined className="text-blue-500" /> Joined {ouser?.createdAt ? new Date(ouser.createdAt).getFullYear() : '2024'}</div>
                </div>

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
                    </div>
                    <Rate disabled value={review.rating} className='text-[10px] text-red-500 mb-4' />
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

    </main>
  );
}

export default OtherUser;