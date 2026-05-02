import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const { email, password } = inputs;

  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { email, password };
      const response = await axios.post('http://localhost:5000/api/auth/login', body);
      
      localStorage.setItem('token', response.data.token);
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-container auth-box">
        <h2>Welcome Back</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={onSubmitForm}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="form-control"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="form-control"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <button className="btn-primary">Login</button>
        </form>
        <div className="auth-links">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
