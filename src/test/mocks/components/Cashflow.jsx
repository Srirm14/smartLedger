import React from 'react';

export const CashflowList = () => (
  <div>
    <h1>Cashflow List</h1>
    <div>
      <input type="text" placeholder="Search" />
      <label>
        Type
        <select aria-label="Type">
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>
      <label>
        Date Range
        <div>
          <label>Start Date<input type="date" aria-label="Start Date" /></label>
          <label>End Date<input type="date" aria-label="End Date" /></label>
        </div>
      </label>
      <button aria-label="Apply Filters">Apply Filters</button>
      <button aria-label="Add Entry">Add Entry</button>
    </div>
    
    <div>
      <h2>Total Income: $10,000.00</h2>
      <h2>Total Expenses: $5,000.00</h2>
      <h2>Net Cashflow: $5,000.00</h2>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Description</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Income</td>
          <td>$5,000.00</td>
          <td>Sales Revenue</td>
          <td>2024-03-01</td>
        </tr>
        <tr>
          <td>Expense</td>
          <td>$2,000.00</td>
          <td>Office Supplies</td>
          <td>2024-03-02</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const CashflowDetails = () => (
  <div>
    <h1>Cashflow Details</h1>
    <div>
      <h2>Transaction ID: 1</h2>
      <p>Type: income</p>
      <p>Amount: $5000.00</p>
      <p>Description: Sales Revenue</p>
      <p>Date: 2024-03-01</p>
      <p>Category: Sales</p>
      <p>Payment Method: Bank Transfer</p>
      <p>Status: Completed</p>
      
      <button aria-label="Edit">Edit</button>
      <button aria-label="Delete">Delete</button>
      <button aria-label="Confirm">Confirm</button>
    </div>
  </div>
);

export const CashflowForm = () => (
  <div>
    <h1>Cashflow Form</h1>
    <form>
      <label>
        Type
        <select name="type" aria-label="Type">
          <option value="">Select Type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>
      <div>Type is required</div>
      
      <label>
        Amount
        <input type="number" name="amount" aria-label="Amount" />
      </label>
      <div>Amount is required</div>
      <div>Amount must be positive</div>
      
      <label>
        Description
        <input type="text" name="description" aria-label="Description" />
      </label>
      <div>Description is required</div>
      
      <label>
        Date
        <input type="date" name="date" aria-label="Date" />
      </label>
      <div>Date is required</div>
      
      <label>
        Category
        <select name="category" aria-label="Category">
          <option value="">Select Category</option>
          <option value="Sales">Sales</option>
          <option value="Services">Services</option>
          <option value="Operations">Operations</option>
        </select>
      </label>
      <div>Category is required</div>
      
      <label>
        Payment Method
        <select name="paymentMethod" aria-label="Payment Method">
          <option value="">Select Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Credit Card">Credit Card</option>
        </select>
      </label>
      
      <button type="submit" aria-label="Save">Save</button>
    </form>
  </div>
);