import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';

const Navbar = ({ isAuthenticated, setAuth }) => {
  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    setAuth(false);
  };

  return (
    <nav>
      <Link to="/" className="logo">
        <Wallet color="#6366f1" size={28} />
        AI<span>Expense</span>
      </Link>
      <ul>
        {isAuthenticated ? (
          <li>
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={18} /> Logout
            </button>
          </li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
