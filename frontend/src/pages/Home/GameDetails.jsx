import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Spin, Modal, Rate, Input, message, Button, Tag } from "antd";
import { EditOutlined,
        DeleteOutlined,
        MessageOutlined,
        ArrowDownOutlined,
        ArrowUpOutlined,
        LikeFilled, 
        HeartFilled,
        HeartOutlined,
        StarFilled,
        StarOutlined,
        DislikeFilled } from "@ant-design/icons";
import { Link } from 'react-router-dom';

const { TextArea } = Input;

function GameDetails() {
  const { gameId } = useParams();

  // State
  const [game, setGame] = useState(null);
  const [items, setItems] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  // Form State
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");

  const navigate = useNavigate();

  const fetchGame = async () => {
    try {
      const res = await axios.get(`/api/games/${gameId}`);
      setGame(res.data);
    } catch (err) {
      setError("Failed to load game details");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/reviews/game/${gameId}`);
      setReviews(res.data);

      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser) {
        const alreadyReviewed = res.data.some(
          (r) => r.userId?._id === storedUser.userid
        );
        setHasReviewed(alreadyReviewed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const res = await axios.get(`/api/reviews/game/${gameId}/average-rating`);
      setAverageRating(res.data.averageRating);
    } catch (err) {
      console.error(err);
      setAverageRating(0);
    }
  };

  const submitReview = async () => {
    if (!currentUser || !currentUser.token) {
      message.error('Please log in to submit a review');
      navigate('/login')
      return;
    }
    if (!text.trim()) return message.warning("Please write something first!");

    if (hasReviewed) {
      return message.warning("You already reviewed this game");
    }


    try {
      await axios.post("/api/reviews", {
        gameId: Number(gameId),
        rating,
        reviewText: text,
      }, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });

      setText("");
      setRating(5);
      message.success("Review posted!");
      fetchReviews();
      fetchAverageRating();
    } catch (err) {
      message.error("Failed to post review");
    }
  };

  // Open Modal for Edit
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
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      message.success("Review updated!");
      setIsEditModalOpen(false);
      fetchReviews();
      fetchAverageRating();
    } catch (err) {
      message.error("Update failed");
    }
  };

  const deleteReview = async (reviewId) => {
    Modal.confirm({
      title: 'Delete Review',
      content: 'Are you sure you want to remove this review? This cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`/api/reviews/${reviewId}`, {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          });
          message.success("Review deleted");
          fetchReviews();
          fetchAverageRating();
        } catch (err) {
          message.error("Delete failed");
        }
      }
    });
  };

  //  Like Review
  const likeReview = async (reviewId) => {
    if (!currentUser || !currentUser.token) {
      message.error('Please log in to like reviews');
      navigate('/login')
      return;
    }
    try {
      await axios.put(`/api/reviews/${reviewId}/like`, {}, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      fetchReviews();
    } catch (err) {
      message.error("Failed to like review");
    }
  };

  //  Dislike Review
  const dislikeReview = async (reviewId) => {
    if (!currentUser || !currentUser.token) {
      message.error('Please log in to dislike reviews');
      navigate('/login')
      return;
    }
    try {
      await axios.put(`/api/reviews/${reviewId}/dislike`, {}, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      fetchReviews();
    } catch (err) {
      message.error("Failed to dislike review");
    }
  };


  // wishlist  
  const isWishlisted = (gameId) =>
  items.some(i => i.gameId === Number(gameId) && i.type === 'wishlist');

  const isFavorited = (gameId) =>
  items.some(i => i.gameId === Number(gameId) && i.type === 'favorite');



    const checkWishlist = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`/api/wishlist`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleWishlist = async (gameId) => {
  if (!currentUser) { message.error("Login First"); return; }
  try {
    const numericId = Number(gameId);
    const exists = isWishlisted(numericId);
    if (exists) {
      await axios.delete(`/api/wishlist/${numericId}?type=wishlist`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      setItems(prev => prev.filter(i => !(i.gameId === numericId && i.type === 'wishlist')));
    } else {
      await axios.post(`/api/wishlist`, { gameId: numericId, type: "wishlist" }, { 
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      setItems(prev => [...prev, { gameId: numericId, type: 'wishlist' }]);
    }
  } catch (err) {
    message.error("Wishlist failed");
  }
};

  const toggleFavorite = async (gameId) => {
  if (!currentUser) { message.error("Login First"); return; }
  try {
    const numericId = Number(gameId);
    const exists = isFavorited(numericId);
    if (exists) {
      await axios.delete(`/api/wishlist/${numericId}?type=favorite`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      setItems(prev => prev.filter(i => !(i.gameId === numericId && i.type === 'favorite'))); 
    } else {
      await axios.post(`/api/wishlist`, { gameId: numericId, type: "favorite" }, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      setItems(prev => [...prev, { gameId: numericId, type: 'favorite' }]);
    }
  } catch (err) {
    message.error("Favorite failed");
  }
};
  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user')));
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGame(), fetchReviews(), fetchAverageRating()]);
      setLoading(false);
    };
    loadData();
  }, [gameId]);

  useEffect(()=>{
    if(currentUser){
      checkWishlist();
    }
  },[currentUser, gameId])

  const sortedReviews = [...reviews].sort((a, b) => {
  if (!currentUser) return 0;

  if (a.userId?._id === currentUser.userid) return -1;
  if (b.userId?._id === currentUser.userid) return 1;

  return 0;
});

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-black"><Spin size="large" /></div>;
  if (error || !game) return <div className="text-center mt-20 text-red-500">{error || "Game not found"}</div>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* HERO BANNER */}
      <div className="relative h-[400px] w-full group">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10" />
        <img src={game.background_image} alt="" className="w-full h-full object-cover opacity-40" />
        
        {/* TOP RIGHT ACTIONS CORNER */}
        <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
          <button
            onClick={()=>toggleWishlist(gameId)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border shadow-lg
              ${isWishlisted(gameId)
                ? "bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : "bg-black/40 border-white/10 text-white hover:border-red-500 hover:text-red-500"
              }
            `}
            title={isWishlisted(gameId) ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {isWishlisted(gameId) ? <StarFilled className="text-xl" /> : <StarOutlined className="text-xl" />}
          </button>
          
          {/* Placeholder for Favorites (Future) */}
          <button
            onClick={()=>toggleFavorite(gameId)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border shadow-lg
              ${isFavorited(gameId)
                ? "bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : "bg-black/40 border-white/10 text-white hover:border-red-500 hover:text-red-500"
              }
            `}
            title={isFavorited(gameId) ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorited(gameId) ? <HeartFilled className="text-xl" /> : <HeartOutlined className="text-xl" />}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full z-20 px-6 md:px-12 pb-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-6xl font-audiowide text-white mb-4 uppercase tracking-tighter">
              {game.name}
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Rate disabled value={averageRating} allowHalf className="text-red-500 text-sm" />
                <span className="text-xl font-bold font-tomorrow">{averageRating.toFixed(1)}</span>
              </div>
              
              {/* METACRITIC MINI-BADGE */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-md backdrop-blur-sm">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Metacritic</span>
                <span className={`text-sm font-bold ${game.metacritic >= 75 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {game.metacritic ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-10 relative z-30 grid lg:grid-cols-3 gap-10 pt-4">
        
        {/* LEFT: INFO & FORM */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
            <h2 className="text-red-500 font-tomorrow uppercase tracking-widest mb-4">About</h2>
            <p className="text-gray-300 leading-relaxed">
              {game.description_raw || "No description available."}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {game.genres?.map(g => <Tag color="red" key={g.id} className="bg-red-500/10 border-red-500/20 text-red-500 uppercase text-[10px] px-3 py-1 rounded-full font-bold">{g.name}</Tag>)}
            </div>
          </section>

          {/* WRITE REVIEW */}
          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <MessageOutlined className="text-red-500" />
              <h2 className="text-xl font-audiowide uppercase">Leave a Review</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase mb-2">Your Rating</p>
              <Rate value={rating} onChange={setRating} className="text-red-500" />
            </div>

            <TextArea
              value={hasReviewed ? "You have already reviewed this game" : text}
              onChange={(e) => !hasReviewed && setText(e.target.value)}
              readOnly={hasReviewed}
              autoSize={{ minRows: 3 }}
              className={`bg-black border-white/10 text-white rounded-lg 
                ${hasReviewed ? "opacity-70 cursor-not-allowed hover:bg-black focus:bg-black" : "hover:border-red-500 focus:border-red-500 hover:bg-black focus:bg-black"}
              `}
            />
            <Button
              type="primary"
              danger
              size="large"
              onClick={submitReview}
              className="mt-4 font-bold uppercase tracking-widest h-12 px-10"
            >
              {hasReviewed ? "Review Submitted" : "Post Review"}
            </Button>
          </section>
        </div>

        {/* RIGHT: REVIEWS LIST */}
        <div className="space-y-6">
          <h2 className="text-2xl font-audiowide uppercase flex items-center gap-3">
            Community <span className="text-red-500">Feed</span>
          </h2>

          {reviews.length === 0 ? (
            <div className="p-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
              <p className="text-gray-500">No reviews yet. Be the first!</p>
            </div>
          ) : (
            sortedReviews.map((r) =>{ 
              const isMine = currentUser && r.userId?._id === currentUser.userid;
              
              return (
                <div
                  key={r._id}
                  className={`relative p-5 rounded-2xl transition-all duration-300 border group overflow-hidden ${
                    isMine
                      ? "border-red-500/40 bg-black"
                      : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                  }`}
                >
                  {/* Background Accent for 'My Review' */}
                  {isMine && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[40px] -z-10" />
                  )}

                  {/* HEADER: Username, Rating, and Actions */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0"> {/* min-w-0 allows truncation */}
                      <Link to={`/otheruser/${r.userId?._id}`}>
                        <p className={`font-bold text-sm truncate tracking-tight ${
                          isMine ? "text-red-400" : "text-red-500 hover:text-red-400"
                        }`}>
                          @{r.userId?.username || "Gamer"}
                        </p>
                      </Link>
                      <Rate disabled value={r.rating} className="text-[10px] text-red-500 mt-1" />
                    </div>

                    {/* Action Group */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isMine && (
                        <>
                          <Tag color="red" className="mr-1 border-none text-[9px] font-black uppercase tracking-tighter bg-red-500/20 text-red-500">
                            You
                          </Tag>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined className="text-xs" />}
                            className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 border-none"
                            onClick={() => openEditModal(r)}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined className="text-xs" />}
                            className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 border-none"
                            onClick={() => deleteReview(r._id)}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* BODY: Review Text */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 break-words italic">
                    "{r.reviewText}"
                  </p>

                  {/* FOOTER: Interaction Stats */}
                  <div className="flex gap-6 mt-auto border-t border-white/5 pt-4">
                    <button
                      onClick={() => likeReview(r._id)}
                      className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-400 transition-colors"
                    >
                      <LikeFilled className={r.likes?.includes(currentUser?.userid) ? "text-green-500" : ""} />
                      <span>{r.likes?.length || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => dislikeReview(r._id)}
                      className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <DislikeFilled className={r.dislikes?.includes(currentUser?.userid) ? "text-red-500" : ""} />
                      <span>{r.dislikes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal
        title={<span className="font-audiowide uppercase">Edit Your Review</span>}
        open={isEditModalOpen}
        onOk={handleUpdateReview}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Update"
        okButtonProps={{ danger: true, type: 'primary' }}
        cancelButtonProps={{ className: "text-gray-400" }}
        centered
      >
        <div className="space-y-4 pt-4">
          <div>
            <p className="text-xs uppercase text-gray-500 mb-2">Adjust Rating</p>
            <Rate value={editRating} onChange={setEditRating} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 mb-2">Update Thoughts</p>
            <TextArea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoSize={{ minRows: 4 }}
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default GameDetails;