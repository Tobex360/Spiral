import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'

import Home from './pages/Home/Home'
import Profile from './pages/User/Profile'
import GameDetails from './pages/Home/GameDetails'
import OtherUser from './pages/User/OtherUser'
import Wishlist from './pages/User/Wishlist'
import Favorites from './pages/User/Favorites'
import Connections from './pages/User/Connections'


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />


        <Route path='/home' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/favorites' element={<Favorites />} />

        <Route path='/gamedetails/:gameId' element={<GameDetails />} />
        <Route path='/otheruser/:usersId' element={<OtherUser />} />
        <Route path='/connection/:userId' element={<Connections />} />

      </Routes>
      <Footer />
      <BackToTop />
    </Router>
  )
}

export default App