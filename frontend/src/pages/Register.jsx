import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Register = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const { name, email, password } = inputs;

  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { name, email, password };
      const response = await axios.post('http://localhost:5000/api/auth/register', body);
      
      localStorage.setItem('token', response.data.token);
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-container auth-box">
        <h2>Create Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={onSubmitForm}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="form-control"
              value={name}
              onChange={onChange}
              required
            />
          </div>
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
              placeholder="Create a password"
              className="form-control"
              value={password}
              onChange={onChange}
              minLength="6"
              required
            />
          </div>
          <button className="btn-primary">Register</button>
        </form>
        <div className="auth-links">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
