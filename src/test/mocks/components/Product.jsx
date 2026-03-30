import React from 'react';

export const ProductList = () => (
  <div>
    <h1>Product List</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>UOM</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Test Product</td>
          <td>Test Category</td>
          <td>Test UOM</td>
          <td>Active</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const ProductDetails = () => (
  <div>
    <h1>Product Details</h1>
    <div>
      <h2>Test Product</h2>
      <p>Category: Test Category</p>
      <p>UOM: Test UOM</p>
      <p>Status: Active</p>
    </div>
  </div>
);

export const ProductForm = () => (
  <div>
    <h1>Product Form</h1>
    <form>
      <input type="text" name="name" placeholder="Name" />
      <select name="category">
        <option value="category-1">Test Category</option>
      </select>
      <input type="text" name="uom" placeholder="UOM" />
      <select name="status">
        <option value="active">Active</option>
        <option value="discontinued">Discontinued</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  </div>
);