import React from 'react';

export const InventoryList = () => (
  <div>
    <h1>Inventory List</h1>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Location</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Test Product</td>
          <td>100</td>
          <td>Warehouse A</td>
          <td>2024-05-09</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const InventoryDetails = () => (
  <div>
    <h1>Inventory Details</h1>
    <div>
      <h2>Test Product</h2>
      <p>Quantity: 100</p>
      <p>Location: Warehouse A</p>
      <p>Last Updated: 2024-05-09</p>
    </div>
  </div>
);

export const InventoryForm = () => (
  <div>
    <h1>Inventory Form</h1>
    <form>
      <select name="product">
        <option value="1">Test Product</option>
      </select>
      <input type="number" name="quantity" placeholder="Quantity" />
      <select name="location">
        <option value="warehouse-a">Warehouse A</option>
        <option value="warehouse-b">Warehouse B</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  </div>
);