import React, { useEffect, useState } from 'react'
import logo from '../../assets/logo.svg'
import { Input, Spin, Pagination, Empty, ConfigProvider, theme } from 'antd'
import { SearchOutlined, StarFilled } from '@ant-design/icons'
import axios from 'axios'
import { API_URL } from '../../config/api'

function Home() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchGames = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${API_URL}/api/games?search=${search}&page=${page}`
      )
      setGames(res.data.results)
      setTotal(res.data.count)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [search, page])

  return (
    // Set Ant Design to Dark Mode for the pagination/input components
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <main className='min-h-screen pb-20'>
        
        {/* 🔥 Header Section */}
        <div className='relative overflow-hidden bg-black py-16 mb-12'>
          <div className='absolute inset-0 bg-red-500/5 blur-[120px] rounded-full -top-24 -left-24'></div>
          
          <div className='relative z-10 flex flex-col items-center text-center px-6'>
            <img src={logo} alt="Spiral Logo" className='h-20 w-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]'/>
            <h2 className='text-primary text-4xl md:text-6xl font-audiowide tracking-tight mb-2'>
              SPIRAL LIBRARY
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

        <div className='max-w-7xl mx-auto px-6 lg:px-8'>
          
          {/* 🎮 Games Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <Spin size="large" />
              <p className="text-gray-500 font-tomorrow animate-pulse">Syncing Database...</p>
            </div>
          ) : (
            <>
              {games.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                  {games.map((game) => (
                    <div 
                      key={game.id} 
                      className='group relative bg-secondary/40 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 shadow-xl'
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
                          <StarFilled className="text-yellow-500 text-xs" />
                          <span className='text-xs font-bold text-yellow-500'>{game.rating}</span>
                        </div>
                      </div>

                      {/* Info Container */}
                      <div className='p-4'>
                        <h3 className='text-white font-bold text-sm line-clamp-1 group-hover:text-red-500 transition-colors'>
                          {game.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Released: {game.released?.split('-')[0]}</span>
                           <button className="text-[10px] bg-white/5 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-colors uppercase font-bold">
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