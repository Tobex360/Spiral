import React, { useEffect, useState } from 'react';
import { Spin, Empty, Button, message, ConfigProvider, theme } from 'antd';
import { HeartFilled, DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchFavorites = async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('/api/wishlist/favorites', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      // We need to fetch details for each game in the wishlist 
      // if your backend only returns IDs. If it returns full objects, 
      // you can just use setWishlist(res.data).
      const detailedGames = await Promise.all(
        res.data.map(async (item) => {
          const gameRes = await axios.get(`/api/games/${item.gameId}`);
          return { ...gameRes.data, wishlistId: item._id };
        })
      );
      setFavorites(detailedGames);
    } catch (err) {
      console.error(err);
      message.error("Failed to get games)");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (gameId) => {
    try {
      await axios.delete(`/api/wishlist/${gameId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWishlist(prev => prev.filter(game => game.id !== gameId));
      message.success("Removed from Archive");
    } catch (err) {
      message.error("Failed to remove games");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0a0a0a] text-white p-6">
        <h2 className="text-2xl font-audiowide uppercase mb-4">Unauthorized Access</h2>
        <p className="text-gray-500 font-tomorrow mb-8">Please log in to view your Favorites.</p>
        <Button danger type="primary" onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <main className="min-h-screen bg-[#0a0a0a] pb-20 pt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Header */}
          <div className="relative mb-12 flex items-center gap-4">
            <div className="w-1 h-12 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
            <div>
              <h1 className="text-4xl font-audiowide text-white uppercase tracking-tighter">
                Your <span className="text-red-600">Favorites</span>
              </h1>
              <p className="text-gray-500 font-tomorrow text-xs uppercase tracking-[0.3em]">
                You couldn't get enough of these Games
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <Spin size="large" />
              <p className="text-gray-500 font-tomorrow text-xs animate-pulse uppercase">Decrypting Favorites...</p>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {favorites.map((game) => (
                <div 
                  key={game.id} 
                  className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300"
                >
                  {/* Remove Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(game.id);
                    }}
                    className="absolute top-3 right-3 z-30 w-8 h-8 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 border border-white/10 transition-colors"
                  >
                    <DeleteOutlined />
                  </button>

                  <div className="h-40 overflow-hidden cursor-pointer" onClick={() => navigate(`/gamedetails/${game.id}`)}>
                    <img 
                      src={game.background_image} 
                      alt={game.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm line-clamp-1 mb-3 font-tomorrow uppercase tracking-tight">
                      {game.name}
                    </h3>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <HeartFilled className="text-red-600 text-xs" />
                      </div>
                      <Button 
                        size="small" 
                        type="text"
                        className="text-[10px] font-bold text-red-500 hover:bg-red-500/10 uppercase"
                        onClick={() => navigate(`/gamedetails/${game.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <Empty 
                description={<span className="text-gray-500 font-tomorrow uppercase tracking-widest">Favorites Empty</span>} 
              />
              <Button 
                icon={<RocketOutlined />} 
                className="mt-6 bg-red-600 hover:bg-red-700 text-white border-none font-bold uppercase"
                onClick={() => navigate('/home')}
              >
                Browse Games
              </Button>
            </div>
          )}
        </div>
      </main>
    </ConfigProvider>
  );
}

export default Favorites;