import React, { useEffect, useState } from 'react';
import { Avatar, Button, Divider } from 'antd';
import { CalendarOutlined, UserOutlined, StarFilled, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

function ReviewCard({ review, currentUserId, onDelete }) {
  const [gameName, setGameName] = useState(null);

  useEffect(() => {
    if (review.gameId && !gameName) {
      const fetchGameName = async () => {
        try {
          const res = await axios.get(`${API_URL}/games/${review.gameId}`);
          setGameName(res.data.name);
        } catch (err) {
          console.error('Failed to fetch game name:', err);
          setGameName('Unknown Sector');
        }
      };
      fetchGameName();
    }
  }, [review.gameId, gameName]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 group/card relative">
      
      {/* Decorative Top Accent Light */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <Link to={`/user/${review.userId?._id}`} className="flex-shrink-0">
            <Avatar
              size={40}
              src={review.userId?.profilePic}
              icon={<UserOutlined />}
              className="border border-white/10 shadow-md transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <div>
            <Link to={`/user/${review.userId?._id}`} className="text-white hover:text-red-400 font-audiowide text-xs uppercase tracking-wider block transition-colors">
              {review.userId?.displayname || review.userId?.username || "Anonymous Operational Unit"}
            </Link>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 font-tomorrow uppercase mt-1">
              <span className="flex items-center gap-1 text-yellow-500/90 font-bold bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                <StarFilled className="text-[10px]" /> {review.rating}/5 RATING
              </span>
              <span className="flex items-center gap-1 tracking-wider text-[10px]">
                <CalendarOutlined /> {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {review.userId?._id === currentUserId && (
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined className="text-xs" />}
            className="opacity-0 group-hover/card:opacity-100 transition-all duration-200 h-7 w-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center p-0"
            onClick={() => onDelete(review._id)}
          />
        )}
      </div>

      <div className="mb-3">
        <span className="text-[10px] uppercase font-tomorrow text-gray-600 tracking-widest block mb-0.5">GAME:</span>
        <Link to={`/gamedetails/${review.gameId}`} className="inline-block group/link">
          <p className="text-red-500 font-audiowide text-sm uppercase tracking-wide transition-colors group-hover/link:text-red-400 group-hover/link:underline decoration-red-500/30 underline-offset-4">
            {gameName || 'Querying Database...'}
          </p>
        </Link>
      </div>

      {review.reviewText && (
        <p className="text-gray-300 text-sm font-tomorrow leading-relaxed break-words bg-black/20 p-3 rounded-xl border border-white/[0.02]">
          {review.reviewText}
        </p>
      )}
    </div>
  );
}

export default ReviewCard;