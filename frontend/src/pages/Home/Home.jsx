import React, { useEffect, useState } from 'react'
import logo from '../../assets/logo.svg'
import { Input, Spin, Pagination, Empty, ConfigProvider, theme, Select } from 'antd'
import { SearchOutlined, StarFilled } from '@ant-design/icons'
import axios from 'axios'
import { API_URL } from '../../config/api'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [averageRatings, setAverageRatings] = useState({});
  const [sortBy, setSortBy] = useState('popularity');

  const navigate = useNavigate()

  const fetchGames = async () => {
    try {
      setLoading(true);

      let ordering = '';

      if (sortBy === 'popularity') ordering = '-added';
      if (sortBy === 'alphabetical') ordering = 'name';
      if (sortBy === 'metacritic') ordering = '-metacritic';
      const res = await axios.get(
        `/api/games?search=${search}&page=${page}&ordering=${ordering}${genre ? `&genre=${genre}` : ''}`
      )
      console.log("GENRE:", genre);
      setGames(res.data.results)
      setTotal(res.data.count)
      
      // Fetch average ratings for each game
      const ratingsMap = {}
      for (const game of res.data.results) {
        try {
          const ratingRes = await axios.get(`/api/reviews/game/${game.id}/average-rating`)
          ratingsMap[game.id] = ratingRes.data.averageRating
        } catch (err) {
          ratingsMap[game.id] = 0
        }
      }
      setAverageRatings(ratingsMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [search, page, sortBy, genre])

  let sortedGames = [...games];

  if (sortBy === 'score') {
    sortedGames.sort((a, b) => {
      return (averageRatings[b.id] || 0) - (averageRatings[a.id] || 0);
    });
  }

  return (
    // Set Ant Design to Dark Mode for the pagination/input components
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <main className='min-h-screen pb-20'>
        
        {/* 🔥 Header Section */}
        <div className='relative overflow-hidden bg-black py-16 mb-12'>
          <div className='absolute inset-0 bg-red-500/5 blur-[120px] rounded-full -top-24 -left-24'></div>
          
          <div className='relative z-10 flex flex-col items-center text-center px-6'>
            <img src={logo} alt="Spiral Logo" className='h-20 w-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]'/>
            <h2 className='text-4xl md:text-7xl font-audiowide tracking-tighter mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent uppercase'>
              Spiral <span className='text-red-600'>Library</span>
            </h2>
            <p className='text-gray-400 font-tomorrow tracking-widest uppercase text-sm'>
              Discover your next digital obsession
            </p>

            {/* 🔍 Styled Search */}
            <div className='mt-10 w-full max-w-md'>
              <Input 
                prefix={<SearchOutlined className="text-red-500" />}
                placeholder="Search across 550,000+ games..." 
                variant="filled"
                className="h-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white transition-all shadow-2xl"
                allowClear
                value={search}
                onChange={(e) => {
                  setPage(1)
                  setSearch(e.target.value)
                }}
              />
            </div>
          </div>
        </div>
          {/* SORT */}
          <div className='max-w-7xl mx-auto px-6 lg:px-8'>
            <div className="flex justify-end mb-6 gap-4">
              {/* SORT */}
              <Select
                value={sortBy}
                  onChange={(value) => {
                    setSortBy(value);
                    setPage(1);
                  }}
                className="w-48"
                options={[
                  { value: 'popularity', label: '🔥 TRENDING' },
                  { value: 'alphabetical', label: '🔤 INDEX' },
                  { value: 'score', label: '⭐ SPIRAL SCORE' },
                  { value: 'metacritic', label: '🆕 METACRITIC' },
                ]}
              />
              {/* GENRE FILTER */}
              <Select
                placeholder={<span className="text-gray-400">🎮 ALL GENRES</span>}
                value={genre || undefined}
                onChange={(value) => {
                  setGenre(value);
                  setPage(1);
                }}
                allowClear
                className="w-56 custom-genre-select"
                dropdownClassName="bg-[#111] border border-white/10"
                options={[
                  { value: 'action', label: 'ACTION' },
                  { value: 'adventure', label: 'ADVENTURE' },
                  { value: 'role-playing-games-rpg', label: 'RPG' },
                  { value: 'shooter', label: 'SHOOTER' },
                  { value: 'strategy', label: 'STRATEGY' },
                  { value: 'indie', label: 'INDIE' },
                  { value: 'casual', label: 'CASUAL' },
                  { value: 'simulation', label: 'SIMULATION' },
                  { value: 'puzzle', label: 'PUZZLE' },
                  { value: 'arcade', label: 'ARCADE' },
                  { value: 'platformer', label: 'PLATFORMER' },
                  { value: 'racing', label: 'RACING' },
                  { value: 'sports', label: 'SPORTS' },
                  { value: 'fighting', label: 'FIGHTING' },
                  { value: 'family', label: 'FAMILY' },
                  { value: 'board-games', label: 'BOARD' },
                  { value: 'educational', label: 'EDUCATION' },
                  { value: 'card', label: 'CARD' },
                  { value: 'massively-multiplayer', label: 'MMO' },
                ]}
              />
            </div>
          
          {/* Games Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 font-tomorrow tracking-[0.2em] uppercase text-xs animate-pulse">Accessing Neural Link...</p>
            </div>
          ) : (
            <>
              {sortedGames.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                  {sortedGames.map((game) => (
                    <div 
                      key={game.id} 
                      className='group relative bg-secondary/40 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 shadow-xl'
                      onClick={()=>{navigate(`/gamedetails/${game.id}`)}}
                    >
                      {/* Image Container */}
                      <div className='relative h-48 overflow-hidden'>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10"></div>
                        <img 
                          src={game.background_image || 'https://via.placeholder.com/400x200?text=No+Image'} 
                          alt={game.name}
                          className='h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700'
                        />
                        <div className='absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10'>
                          
                          {sortBy === 'metacritic' ? (
                            <>
                              <span className="text-green-400 text-xs font-bold">MC</span>
                              <span className="text-xs font-bold text-green-400">
                                {game.metacritic ?? 'N/A'}
                              </span>
                            </>
                          ) : (
                            <>
                              <StarFilled className="text-yellow-500 text-xs" />
                              <span className='text-xs font-bold text-yellow-500'>
                                {averageRatings[game.id]?.toFixed(1) || 'N/A'}
                              </span>
                            </>
                          )}

                        </div>
                      </div>

                      {/* Info Container */}
                      <div className='p-4'>
                        <h3 className='text-white font-bold text-sm line-clamp-1 group-hover:text-red-500 transition-colors'>
                          {game.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Released: {game.released?.split('-')[0]}</span>
                           <button className="text-[10px] bg-white/5 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-colors uppercase font-bold" onClick={()=>{navigate(`/gamedetails/${game.id}`)}}>
                             Details
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description={<span className="text-gray-500">No games found in the spiral</span>} />
              )}
            </>
          )}

          {/* Pagination */}
          {total > 0 && !loading && (
            <div className='flex justify-center mt-16 p-4 bg-white/5 rounded-xl border border-white/5'>
              <Pagination
                current={page}
                total={total}
                pageSize={20}
                onChange={(p) => {
                   setPage(p);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </main>
    </ConfigProvider>
  )
}

export default Home