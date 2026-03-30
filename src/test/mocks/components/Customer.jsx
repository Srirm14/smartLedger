import React from 'react';

export const CustomerList = () => (
  <div>
    <h1>Customer List</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>john@example.com</td>
          <td>1234567890</td>
          <td>Active</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const CustomerDetails = () => (
  <div>
    <h1>Customer Details</h1>
    <div>
      <h2>John Doe</h2>
      <p>Email: john@example.com</p>
      <p>Phone: 1234567890</p>
      <p>Address: 123 Main St</p>
      <p>Status: Active</p>
    </div>
  </div>
);

export const CustomerForm = () => (
  <div>
    <h1>Customer Form</h1>
    <form>
      <input type="text" name="name" placeholder="Name" />
      <input type="email" name="email" placeholder="Email" />
      <input type="tel" name="phone" placeholder="Phone" />
      <input type="text" name="address" placeholder="Address" />
      <select name="status">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  </div>
);