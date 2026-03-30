import React from 'react';

// Simple mock component for Login page
export const Login = () => (
  <div>
    <h1>Login</h1>
    <form>
      <input type="email" placeholder="Email address" />
      <input type="password" placeholder="Password" />
      <button type="submit">Sign in</button>
      <div>All fields are required</div>
    </form>
  </div>
);

// Simple mock component for Register page
export const Register = () => (
  <div>
    <h1>Register</h1>
    <form>
      <input type="text" placeholder="Full Name" />
      <div>Name is required</div>
      
      <input type="email" placeholder="Email address" />
      <div>Email is required</div>
      
      <input type="password" placeholder="Password" />
      <div>Password is required</div>
      
      <input type="password" placeholder="Confirm Password" />
      <div>Passwords do not match</div>
      
      <button type="submit">Register</button>
    </form>
  </div>
);

// Simple mock component for Forgot Password page
export const ForgotPassword = () => (
  <div>
    <h1>Forgot Password</h1>
    <form>
      <input type="email" placeholder="Email address" />
      <div>Email is required</div>
      <button type="submit">Reset Password</button>
    </form>
  </div>
);