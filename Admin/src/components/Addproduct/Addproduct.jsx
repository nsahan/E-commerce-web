import React, { useState } from 'react';
import './Addproduct.css';
import uploadIcon from '../../assets/upload_area.svg';

const Addproduct = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [details, setDetails] = useState({
    name: "",
    image: "",
    category: "",
    new_price: "",
    old_price: ""
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setDetails(prevDetails => ({
        ...prevDetails,
        image: file,
      }));
    }
  };

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const addProduct = async () => {
    try {
      // Step 1: Upload image
      const formData = new FormData();
      formData.append('product', details.image);

      const uploadResponse = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        alert('Image upload failed: ' + uploadData.message);
        return;
      }

      // Step 2: Save product with image URL
      const productData = {
        name: details.name,
        image: uploadData.image_url,
        category: details.category,
        new_price: details.new_price,
        old_price: details.old_price,
      };

      const productResponse = await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const productDataResponse = await productResponse.json();
      if (productDataResponse.success) {
        alert('Product added successfully!');
        setDetails({
          name: "",
          image: "",
          category: "",
          new_price: "",
          old_price: ""
        });
        setImagePreview(null);
      } else {
        alert('Error adding product: ' + productDataResponse.message);
      }
    } catch (error) {
      console.error('Error in addProduct:', error);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className='add'>
      <div className="item">
        <p>Product Title</p>
        <input value={details.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
      </div>
      <div className="price">
        <div className="item">
          <p>Price</p>
          <input value={details.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type here' />
        </div>
        <div className="item">
          <p>Offer Price</p>
          <input value={details.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type here' />
        </div>
      </div>
      <div className="item">
        <p>Product Category</p>
        <select value={details.category} onChange={changeHandler} name="category" className='selector'>
        <option value="women">Select a Category</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>
      </div>
      <div className="item upload-section">
        <label htmlFor="file-input" className='upload-area'>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className='preview-image' />
          ) : (
            <>
              <img src={uploadIcon} alt="Upload Icon" className='upload-icon' />
              <p>Click or drag an image to upload</p>
            </>
          )}
        </label>
        <input
          type="file"
          name="image"
          id="file-input"
          hidden
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>
      <button onClick={addProduct} className='addp'>Add</button>
    </div>
  );
};

export default Addproduct;
