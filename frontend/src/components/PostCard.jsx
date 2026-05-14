import React, { useState, useEffect } from 'react';
import { Button, Tooltip, message, Avatar, Modal, Input } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  LikeFilled, 
  DislikeFilled, 
  CalendarOutlined,
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
const { TextArea } = Input;

function PostCard({ post, onUpdate, onDelete, currentUserId }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [dislikes, setDislikes] = useState(post.dislikes?.length || 0);
  const [userLiked, setUserLiked] = useState(post.likes?.includes(currentUserId) || false);
  const [userDisliked, setUserDisliked] = useState(post.dislikes?.includes(currentUserId) || false);
  const [gameName, setGameName] = useState(post.gameName || null);
  const [previewOpen, setPreviewOpen] = useState(false);

  //comment states 
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);

  const navigate = useNavigate()

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
    Modal.confirm({
      title: <span className="text-primary font-audiowide">Delete Post</span>,
      content: <span className="text-gray-400">This action cannot be undone. Are you sure?</span>,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`${API_URL}/posts/${post._id}`, config);
          message.success('Post Deleted');
          if (onDelete) onDelete(post._id);
        } catch (err) {
          message.error('Delete Failed');
        }
      },
    })
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

  //comments
  const fetchComments = async ()=>{
    try{
      setLoadingComments(true)
      const user = JSON.parse(localStorage.getItem('user'));


      const res = await axios.get(`${API_URL}/comments/${post._id}`,{
        headers:{
          Authorization: `Bearer ${user.token}`
        }
      });
      setComments(res.data);
    }catch(err){
      console.log(err)
      message.error("FAiled to fetch comments")
    }finally{
      setLoadingComments(false)
    }
  };

  const handleCreateComment = async() => {
    try{
      const user = JSON.parse(localStorage.getItem('user'));

      if(!user){
        return message.error("LOGIN REQUIRED");
      }
      if(!commentText.trim()){
        return message.error("comment empty")
      }

      const res = await axios.post(`${API_URL}/comments/${post._id}`,
        { text: commentText },
        { headers: {
          Authorization: `Bearer ${user.token}`
        }}
      );

      setComments(prev=> [res.data, ...prev]);
      setCommentCount(prev => prev + 1);
      setCommentText('');

    }catch(err){
      console.log(err);
      message.error("Failed to Comment")
    }
  };

  const handleDeleteComment = async(commentId)=>{
    try{
      const user = JSON.parse(localStorage.getItem('user'));
      
      await axios.delete(`${API_URL}/comments/${commentId}`,{
        headers:{
          Authorization: `Bearer ${user.token}`
        }
      });

      setComments(prev=> 
        // prev.filter(comment => comment._id == commentId)
        prev.filter(comment => comment._id !== commentId)
      );
      setCommentCount(prev => prev - 1);
      fetchComments();

      message.success("Comment deleted")
    }catch(err){
      console.log(err);
      message.error("Delete Failed")
    }
  };

  useEffect(()=>{
    if(showComments){
      fetchComments();
    }
  },[showComments])

  
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
              to={currentUserId === post.user?._id ? `/profile` : `/otheruser/${post.user?._id}`}
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
  <>
    <div 
      className="w-full h-72 rounded-2xl overflow-hidden border border-white/5 relative bg-black cursor-pointer group/media"
      onClick={() => setPreviewOpen(true)}
    >
      {/* Subtle Scanline Effect for that gaming vibe */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <img 
        src={post.image} 
        alt="Transmission Media" 
        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/media:scale-110 opacity-80 group-hover/media:opacity-100" 
      />
      
      {/* Hover Overlay - Cinematic Center Label */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col items-center justify-center">
        <div className="border border-white/20 px-6 py-2 rounded-full transform translate-y-4 group-hover/media:translate-y-0 transition-transform duration-500">
           <span className="text-white text-[10px] font-audiowide tracking-[0.3em] uppercase">
             Expand Media
           </span>
        </div>
      </div>
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
          src={post.image}
          alt="Preview"
          className="relative z-10 w-full max-h-[85vh] object-contain border border-white/10 shadow-2xl"
        />
      </div>
    </Modal>
  </>
)}


      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="border-t border-white/5 pt-6 mt-2 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* COMMENT INPUT BOX */}
          <div className="flex gap-3 items-start bg-white/[0.03] p-3 rounded-2xl border border-white/5">
            <Avatar 
              src={JSON.parse(localStorage.getItem('user'))?.profilePic} 
              size="small" 
              icon={<UserOutlined />} 
              className="mt-1 flex-shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2">
              <TextArea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add Comment..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="bg-transparent border-none text-white text-sm placeholder:text-gray-600 focus:ring-0 hover:bg-transparent focus:bg-transparent resize-none p-0 custom-scrollbar"
              />
              <div className="flex justify-end">
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={handleCreateComment}
                  className="font-audiowide uppercase text-[10px] tracking-widest h-8 px-4 rounded-lg"
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>

          {/* COMMENTS LIST */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingComments ? (
              <div className="text-center py-4 text-gray-600 font-tomorrow text-xs animate-pulse">RETRIEVING Comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-600 font-tomorrow text-xs italic">NO COMMENTS</div>
            ) : (
              comments.map(comment => (
                <div
                  key={comment._id}
                  className="group/comment flex gap-3 animate-in fade-in duration-500"
                >
                  <Avatar
                    src={comment.user?.profilePic}
                    size="small"
                    icon={<UserOutlined />}
                    onClick={()=> navigate(currentUserId === comment.user?._id ? `/profile` : `/otheruser/${comment.user?._id}`)}
                    className="flex-shrink-0 border border-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-white/[0.03] rounded-2xl rounded-tl-none p-3 border border-white/5 relative">
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="flex items-baseline gap-2">
                          <Link to={currentUserId === comment.user?._id ? `/profile` : `/otheruser/${comment.user?._id}`}>
                          <span className="text-xs font-audiowide text-red-500 uppercase">
                            {comment.user?.displayname || comment.user?.username}
                          </span>
                          </Link>
                          <span className="text-[9px] text-gray-600 font-tomorrow uppercase">
                            @{comment.user?.username}
                          </span>
                        </div>
                        
                        {currentUserId === comment.user?._id && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined className="text-[10px]" />}
                            className="opacity-0 group-hover/comment:opacity-100 transition-opacity h-auto p-0"
                            onClick={() => handleDeleteComment(comment._id)}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed font-tomorrow break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-400 transition-all"
          >
            <div className="p-1.5 rounded-lg bg-white/5">
              <MessageOutlined />
            </div>

            <span className="font-tomorrow">
              {commentCount}
            </span>
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