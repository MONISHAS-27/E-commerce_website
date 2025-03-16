import React, { useState } from 'react'
import './AddProduct.css'
import axios from "axios";
import upload_area from '../../assets/Assets/Admin_Assets/upload_area.svg'
const AddProduct = () => {
   const [image, setImage] = useState(false)
   const [productDetails, setProductDetails] = useState({
      name: '',
      image: '',
      category: '',
      new_price: '',
      old_price: '',
   })
   const imageHandler = (e) => {
      const file = e.target.files[0]
      if (file) {
         setImage(file) // ✅ Store image properly
      }
   }

   const changeHandler = (e) => {
      setProductDetails({ ...productDetails, [e.target.name]: e.target.value })
   }
   const AddProduct = async () => {
      console.log(productDetails, image)
      let responseData
      let product = productDetails

      let formData = new FormData()
      formData.append('product', image)
      

      try {
         const { data } = await axios.post("http://localhost:4000/upload", formData, {
            headers: {
               "Content-Type": "multipart/form-data",  // ✅ Required for file uploads
               Accept: "application/json",
            },
         });
      
         responseData = data; // ✅ Store response correctly
      } catch (error) {
         console.error("Error uploading file:", error);
      }
      
         if (responseData.success) {
            product.image = responseData.image_url;
            console.log(product);
         
            try {
               const { data } = await axios.post("http://localhost:4000/addproduct", product, {
                  headers: {
                     Accept: "application/json",
                     "Content-Type": "application/json",
                  },
               });
         
               data.success ? alert("Product Added") : alert("Failed");
            } catch (error) {
               console.error("Error adding product:", error);
               alert("Failed to add product");
            }
         }
         
   }
   return (
      <div className='addproduct'>
         <div className='addproduct-itemfield'>
            <p>Product title</p>
            <input
               value={productDetails.name}
               onChange={changeHandler}
               type='text'
               name='name'
               placeholder='Type here'
            />
         </div>
         <div className='addproduct-price'>
            <div className='addproduct-itemfield'>
               <p>Price</p>
               <input
                  value={productDetails.old_price}
                  onChange={changeHandler}
                  type='text'
                  name='old_price'
                  placeholder='Type here'
               />
            </div>

            <div className='addproduct-itemfield'>
               <p>Offer Price</p>
               <input
                  value={productDetails.new_price}
                  onChange={changeHandler}
                  type='text'
                  name='new_price'
                  placeholder='Type here'
               />
            </div>
         </div>

         <div className='addproduct-itemfield'>
            <p>Category</p>
            <select
               value={productDetails.category}
               onChange={changeHandler}
               name='category'
               className='add-product-selector'>
               <option value='women'>Women</option>
               <option value='men'>Men</option>
               <option value='kid'>Kid</option>
            </select>
         </div>

         <div className='addproduct-itemfield'>
            <p>Product title</p>
            <label htmlFor='file-input'>
               <img
                  className='addproduct-thumbnail-img'
                  src={image ? URL.createObjectURL(image) : upload_area}
                  alt=''
               />
            </label>
            <input
               onChange={(e) => {
                  imageHandler(e)
               }}
               type='file'
               name='image'
               id='file-input'
               hidden
            />
         </div>
         <button
            onClick={() => {
               AddProduct()
            }}
            className='addproduct-btn'>
            ADD
         </button>
      </div>
   )
}

export default AddProduct
