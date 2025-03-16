import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/Assets/Admin_Assets/admin-logo.png'

const Navbar = () => {
   return (
      <div className='navbar'>
         <img src={navlogo} className='nav-logo' alt='' />
         <p>Admin Panel</p>
      </div>
   )
}

export default Navbar
