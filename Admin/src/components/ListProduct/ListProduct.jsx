import React, { useEffect, useState } from "react";
import "./ListProduct.css";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  // Fetch all products from the backend
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:4000/allproducts");
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch products when the component loads
  useEffect(() => {
    fetchProducts();
  }, []);

  // Remove product handler
  const handleRemove = async (id) => {
    try {
      const response = await fetch("http://localhost:4000/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Product removed successfully!");
        fetchProducts(); // Refresh the product list
      } else {
        alert("Failed to remove the product");
      }
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  return (
    <div className="list">
      <h1>All Products List</h1>
      <div className="main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="all">
        {allproducts.length > 0 ? (
          allproducts.map((product) => (
            <div className="product-row" key={product.id}>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <p>{product.name}</p>
              <p>Rs.{product.old_price}</p>
              <p>Rs.{product.new_price}</p>
              <p>{product.category}</p>
              <button
                className="remove-button"
                onClick={() => handleRemove(product.id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

export default ListProduct;
