import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import add from '../../assets/Product_Cart.svg'
import list from '../../assets/Product_list_icon.svg'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'/addproduct'} style={{textDecoration:"none"}}>
        <div className="item">
            <img src={add} alt="" />
            <p>Add Product</p>
        </div>
      </Link>
      <Link to={'/listproduct'} style={{textDecoration:"none"}}>
        <div className="item">
            <img src={list} alt="" />
            <p>Product List</p>
        </div>
      </Link>  
    </div>
  )
}

export default Sidebar
