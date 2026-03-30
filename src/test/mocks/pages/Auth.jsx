import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [error, setError] = React.useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="email"
          placeholder="Email address"
          value={formData.email} 
          onChange={handleChange} 
        />
        <input 
          type="password" 
          name="password"
          placeholder="Password"
          value={formData.password} 
          onChange={handleChange} 
        />
        <button type="submit">Sign in</button>
        {error && <div>{error}</div>}
      </form>
    </div>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await register(formData.name, formData.email, formData.password);
        navigate('/login');
      } catch (error) {
        setErrors({ general: error.message });
      }
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name"
          placeholder="Full Name"
          value={formData.name} 
          onChange={handleChange} 
        />
        {errors.name && <div>{errors.name}</div>}
        
        <input 
          type="email" 
          name="email"
          placeholder="Email address"
          value={formData.email} 
          onChange={handleChange} 
        />
        {errors.email && <div>{errors.email}</div>}
        
        <input 
          type="password" 
          name="password"
          placeholder="Password"
          value={formData.password} 
          onChange={handleChange} 
        />
        {errors.password && <div>{errors.password}</div>}
        
        <input 
          type="password" 
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword} 
          onChange={handleChange} 
        />
        {errors.confirmPassword && <div>{errors.confirmPassword}</div>}
        
        <button type="submit">Register</button>
        {errors.general && <div>{errors.general}</div>}
      </form>
    </div>
  );
};

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      {success ? (
        <div>
          <p>Password reset instructions sent to your email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email address"
            value={email} 
            onChange={handleChange} 
          />
          {error && <div>{error}</div>}
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
}; 