import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../assets/logo.svg'
import { Dropdown, Space } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom'
import {  MenuOutlined, CloseOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import CreatePostModal from './CreatePostModal';


function Navbar() {
  const [open, setOpen] = useState(false)
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const navigate = useNavigate()
  const location = useLocation()

  const updateUserState =()=>{
    const user = localStorage.getItem('user');

    if(user){
      try {
        const userdata = JSON.parse(user);
        setUserType('user');
        setUsername(userdata.username || 'user');
      } catch {
        setUserType(null);
        setUsername('');
      }
    }
  };

  useEffect(()=>{
    updateUserState();

    const handleStorageChange =()=>{
      updateUserState()
    }

    window.addEventListener('storage',handleStorageChange);

    window.addEventListener('authChange', handleStorageChange);

    return ()=>{
        window.removeEventListener('storage',handleStorageChange);

        window.removeEventListener('authChange', handleStorageChange);
    }
  },[]);

  const handleLogout =()=>{
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    window.dispatchEvent (new Event('authChange'));
    setUserType(null);
    setUsername('');
    navigate('/');
  }

  const items=[
    
    {
      label: (
        <span onClick={()=>navigate('/profile')}>
          profile
        </span>
      ),
      key: '0',
    },
    {
      label: (
        <span onClick={()=>navigate('/wishlist')}>
          wishlist
        </span>
      ),
      key: '1',
    },
    {
      label: (
        <span onClick={()=>navigate('/favorites')}>
          favorites
        </span>
      ),
      key: '2',
    },
    {
      label: (
        <span onClick={handleLogout}>
          Logout
        </span>
      ),
      key: '3',
    },
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <>
      {(userType===null && <nav className="sticky top-0 z-50 bg-secondary border-b border-[#0D4715]/10 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-20 items-center">
        
        {/* Logo Area */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="transform transition-transform hover:scale-105 active:scale-95">
            <img src={Logo} alt="NVA4GET" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-8">
          <div className="flex gap-6">
            <NavLink to="/login" label="Login" />
          </div>
          
          <div className="h-6 w-[1px] bg-white/20 mx-2" /> {/* Divider */}

          <div className="flex items-center gap-4">
            <NavLink to="/register" label="Register" />
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="sm:hidden flex items-center">
          <button 
            className="text-primary text-2xl p-2 focus:outline-none"
            onClick={() => setOpen(!open)}
          >
            {open ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Navigation Menu */}
    <div className={`sm:hidden bg-secondary overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-64 border-b border-[#0D4715]/10' : 'max-h-0'}`}>
      <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
        <Link to="/login" className="w-full text-center py-3 text-primary text-lg font-audiowide hover:bg-[#0D4715]/5 rounded-lg">Login</Link>
        <Link to="/register" className="w-full text-center py-3 text-primary text-lg font-audiowide hover:bg-[#0D4715]/5 rounded-lg">Register</Link>
        
      </div>
    </div>
  </nav>)}

  {(userType==='user' && <nav className="sticky top-0 z-50 bg-secondary border-b border-[#0D4715]/10 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-20 items-center">
        
        {/* Logo Area */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="transform transition-transform hover:scale-105 active:scale-95">
            <img src={Logo} alt="NVA4GET" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-8">
          <div className="flex gap-6">
            <NavLink to="/" label="Home" />
            <NavLink to="/home" label="Games" />
          </div>
          
          <div className="h-6 w-[1px] bg-white/20 mx-2" /> {/* Divider */}

          <div className="flex items-center gap-4">

            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600/10 border border-red-600/50 text-red-500 font-audiowide text-sm uppercase tracking-wider transition-all duration-300 hover:bg-red-600 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95"
            >
              <PlusOutlined className="text-xs" />
              <span>Post</span>
            </button>

            <Dropdown menu={{ items }} trigger={['click']}>
              <div className='relative text-primary text-lg font-audiowide group py-2 hover:cursor-pointer' onClick={(e) => e.preventDefault()}>
                <Space>
                  <UserOutlined />
                  {username}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Space>
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="sm:hidden flex items-center">
          <button 
            className="text-primary text-2xl p-2 focus:outline-none"
            onClick={() => setOpen(!open)}
          >
            {open ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Navigation Menu */}
    <div className={`sm:hidden bg-secondary overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-64 border-b border-[#0D4715]/10' : 'max-h-0'}`}>
      <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
        <Link to="/" className="w-full text-center py-3 text-primary text-lg font-audiowide hover:bg-[#0D4715]/5 rounded-lg">Home</Link>
        <Link to="/home" className="w-full text-center py-3 text-primary text-lg font-audiowide hover:bg-[#0D4715]/5 rounded-lg">Games</Link>

        <button
          onClick={() => {
            setIsPostModalOpen(true);
            setOpen(false);
          }}
          className="w-full mt-2 py-3 bg-red-600 text-white font-audiowide rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95"
        >
          <PlusOutlined /> CREATE POST
        </button>
        
        <Dropdown menu={{ items }} trigger={['click']}>
          <div className='relative text-primary text-lg font-audiowide group py-2 hover:cursor-pointer' onClick={(e) => e.preventDefault()}>
            <Space>
              <UserOutlined />
              {username}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Space>
          </div>
        </Dropdown>
        
      </div>
    </div>
  </nav>)}
    <CreatePostModal
      isOpen={isPostModalOpen}
      onClose={() => setIsPostModalOpen(false)}
      onPostCreated={() => {
        // Optionally refresh data or navigate
      }}
    />
    </>
  )
}
//Helper Function
function NavLink({ to, label }) {
  return (
    <Link 
      to={to} 
      className="relative text-primary text-lg font-audiowide group py-2"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
}

export default Navbar