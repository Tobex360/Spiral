import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../assets/logo.svg'
import { useLocation, useNavigate } from 'react-router-dom'
import {  MenuOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';


function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-secondary border-b border-[#0D4715]/10 shadow-sm">
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
        <Link to="/" className="w-full text-center py-3 text-primary text-lg font-bold font-audiowide hover:bg-[#0D4715]/5 rounded-lg">Login</Link>
        <Link to="/" className="w-full text-center py-3 text-primary text-lg font-bold font-audiowide hover:bg-[#0D4715]/5 rounded-lg">Register</Link>
        
      </div>
    </div>
  </nav>
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