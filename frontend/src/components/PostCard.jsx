import React, { useState, useEffect } from 'react';
import { Button, Tooltip, message, Avatar } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  LikeFilled, 
  DislikeFilled, 
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

function PostCard({ post, onUpdate, onDelete, currentUserId }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [dislikes, setDislikes] = useState(post.dislikes?.length || 0);
  const [userLiked, setUserLiked] = useState(post.likes?.includes(currentUserId) || false);
  const [userDisliked, setUserDisliked] = useState(post.dislikes?.includes(currentUserId) || false);
  const [gameName, setGameName] = useState(post.gameName || null);

  useEffect(() => {
    if (post.gameId && !gameName) {
      const fetchGameName = async () => {
        try {
          const res = await axios.get(`/api/games/${post.gameId}`);
          setGameName(res.data.name);
        } catch (err) {
          console.error('Failed to fetch game name:', err);
          setGameName('Game');
        }
      };
      fetchGameName();
    }
  }, [post.gameId, gameName]);

  const handleDelete = async () => {
    // Replaced window.confirm with a smoother UI experience if possible, 
    // but kept logic same for functionality.
    if (window.confirm('PERMANENTLY DELETE THIS DATA ENTRY?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_URL}/posts/${post._id}`, config);
        message.success('POST PURGED');
        if (onDelete) onDelete(post._id);
      } catch (err) {
        message.error('DELETE FAILED');
      }
    }
  };

  const handleLike = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return message.error('LOGIN REQUIRED');

      if (userLiked) {
        setLikes(likes - 1);
      } else {
        setLikes(likes + 1);
        if (userDisliked) {
          setDislikes(dislikes - 1);
          setUserDisliked(false);
        }
      }
      setUserLiked(!userLiked);
      await axios.post(`${API_URL}/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (err) {
      message.error('ACTION FAILED');
    }
  };

  const handleDislike = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return message.error('LOGIN REQUIRED');

      if (userDisliked) {
        setDislikes(dislikes - 1);
      } else {
        setDislikes(dislikes + 1);
        if (userLiked) {
          setLikes(likes - 1);
          setUserLiked(false);
        }
      }
      setUserDisliked(!userDisliked);
      await axios.post(`${API_URL}/posts/${post._id}/dislike`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (err) {
      message.error('ACTION FAILED');
    }
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-[1.5rem] flex flex-col gap-4 hover:bg-[#111111] transition-all group relative overflow-hidden shadow-xl">
      {/* Visual Identity Strip */}
      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>

      {/* Header: User Info & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar 
            src={post.user?.profilePic} 
            icon={<UserOutlined />} 
            className="border border-white/10 group-hover:border-red-500 transition-colors"
          />
          <div className="flex flex-col">
            <Link
              to={`/otheruser/${post.user?._id}`}
              className="text-sm font-audiowide uppercase text-white hover:text-red-500 transition-colors leading-none"
            >
              {post.user?.displayname || post.user?.username}
            </Link>
            <span className="text-[10px] text-gray-500 font-tomorrow uppercase tracking-tighter">
              @{post.user?.username}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Game Tag - Now using gameName if available */}
           {post.gameId && (
            <Link
              to={`/gamedetails/${post.gameId}`}
              className="flex items-center gap-2 text-[10px] bg-white/5 border border-white/10 text-gray-400 px-3 py-1 rounded-md hover:border-red-500/50 hover:text-white transition-all font-tomorrow uppercase tracking-widest"
            >
              🎮
              {gameName || "LOADING..."}
            </Link>
          )}

          {currentUserId === post.user?._id && (
            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <Tooltip title="Delete">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  className="text-gray-500 hover:text-red-500"
                  onClick={handleDelete}
                />
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Post Description */}
      <p className="text-gray-300 text-sm leading-relaxed font-tomorrow px-1">
        {post.description}
      </p>

      {/* Media Attachment */}
      {post.image && (
        <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/5 relative bg-black">
          <img 
            src={post.image} 
            alt="Transmission Media" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
          />
        </div>
      )}

      {/* Footer: Metrics & Timestamp */}
      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-xs font-bold transition-all ${userLiked ? 'text-green-500' : 'text-gray-500 hover:text-green-400'}`}
          >
            <div className={`p-1.5 rounded-lg ${userLiked ? 'bg-green-500/10' : 'bg-white/5'}`}>
              <LikeFilled />
            </div>
            <span className="font-tomorrow">{likes}</span>
          </button>

          <button
            onClick={handleDislike}
            className={`flex items-center gap-2 text-xs font-bold transition-all ${userDisliked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
          >
            <div className={`p-1.5 rounded-lg ${userDisliked ? 'bg-red-500/10' : 'bg-white/5'}`}>
              <DislikeFilled />
            </div>
            <span className="font-tomorrow">{dislikes}</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] font-tomorrow">
          <CalendarOutlined className="text-red-500/30" />
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'NO_DATE'}
        </div>
      </div>
    </div>
  );
}

export default PostCard;