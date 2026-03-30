import React from 'react';

const ProductDetails = () => (
  <div>
    <h1>Product Details</h1>
    <div>
      <h2>Test Product</h2>
      <p>Category: Test Category</p>
      <p>UOM: Test UOM</p>
      <p>Status: Active</p>
      
      <select>
        <option value="active">Active</option>
        <option value="discontinued">Discontinued</option>
      </select>
      
      <button>Save Changes</button>
    </div>
  </div>
);

export default ProductDetails;