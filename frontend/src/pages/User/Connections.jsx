import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import UserAvatar from '../../assets/no_avatar.webp';

function Connections() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('followers'); // 'followers' or 'following'
  const [data, setData] = useState({ followers: [], following: [] });
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser= async(userId) =>{
    try{
        const res = await axios.get(`/api/users/${userId}`);
        setTargetUser(res.data)
    }catch(err){
        message.error("Failed to load User");
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats/lists and user info
      const [followers, following] = await Promise.all([
        axios.get(`/api/follow/followers/${userId}`),
        axios.get(`/api/follow/following/${userId}`)
      ]);
      
      // Note: Ensure your backend returns the actual user objects in these lists
      setData({
        followers: followers.data || [], 
        following: following.data || []
      });

    } catch (err) {
      message.error("Failed to load connection data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
      fetchUser(userId);
    }
  }, [userId]);

  const currentList = activeTab === 'followers' ? data.followers : data.following;

  return (
    <main className='min-h-screen bg-[#050505] text-white font-tomorrow'>
      <div className='max-w-2xl mx-auto border-x border-white/10 min-h-screen'>
        
        {/* Header with Back Button */}
        <div className='sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md p-4 flex items-center gap-6 border-b border-white/10'>
          <Link to={()=>navigate(-1)} className="text-white hover:text-red-500 transition-colors">
            <ArrowLeftOutlined className="text-xl" />
          </Link>
          <div>
            <h1 className='text-xl font-audiowide uppercase tracking-tight'>
                {targetUser?.displayname || 'User'}
            </h1>
            <p className='text-xs text-gray-500'>@{targetUser?.username}</p>
          </div>
        </div>

        {/* Twitter-style Tab Switcher */}
        <div className='flex border-b border-white/10'>
          {['followers', 'following'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className='flex-1 py-4 text-sm font-bold uppercase tracking-widest relative hover:bg-white/5 transition-colors'
            >
              <span className={activeTab === tab ? "text-white" : "text-gray-500"}>
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className='p-2'>
          {loading ? (
            <div className="py-20 text-center"><Spin size="large" /></div>
          ) : currentList.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<span className='text-gray-500'>No {activeTab} found.</span>} 
              className="mt-20"
            />
          ) : (
            currentList.map((item) => {
                // Determine which user object to show based on tab
                // If following someone, you want the 'following' object. 
                // If someone follows you, you want the 'follower' object.
                const person = activeTab === 'followers' ? item.follower : item.following;

                if(!person) return null;
                
                return (
                  <Link 
                    key={person._id} 
                    to={`/otheruser/${person._id}`}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group"
                  >
                    <img 
                      src={person.profilePic || UserAvatar} 
                      className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:border-red-500/50 transition-colors" 
                      alt="" 
                    />
                    <div className="flex-1">
                      <h4 className="font-audiowide text-sm group-hover:text-red-500 transition-colors">
                        {person.displayname}
                      </h4>
                      <p className="text-xs text-gray-500 font-tomorrow">@{person.username}</p>
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold uppercase border border-white/10 px-2 py-1 rounded">
                        View Profile
                    </div>
                  </Link>
                );
            })
          )}
        </div>
      </div>
    </main>
  );
}

export default Connections;