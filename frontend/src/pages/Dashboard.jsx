import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'food'
  });
  
  const categories = ['food', 'transport', 'utilities', 'entertainment', 'shopping', 'other'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        
        const userRes = await axios.get('http://localhost:5000/api/auth/user', config);
        setUser(userRes.data);
        
        const expenseRes = await axios.get('http://localhost:5000/api/expenses', config);
        setExpenses(expenseRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const newExpense = {
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category
      };
      
      const res = await axios.post('http://localhost:5000/api/expenses', newExpense, config);
      setExpenses([res.data, ...expenses]);
      setFormData({ title: '', amount: '', category: 'food' });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, config);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Analytics Data Preparation
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(148, 163, 184, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: expenses.slice(0, 7).map(e => new Date(e.date).toLocaleDateString()),
    datasets: [{
      label: 'Recent Expenses',
      data: expenses.slice(0, 7).map(e => e.amount),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 6
    }]
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="dashboard-container">
      <div className="glass-container">
        <h3>Welcome, {user?.name}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Total Spent: <span style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 'bold' }}>${totalSpent.toFixed(2)}</span></p>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={onChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input type="number" name="amount" value={formData.amount} onChange={onChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={onChange} className="form-control">
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Expense
          </button>
        </form>

        <div className="expenses-list">
          <h3 style={{ marginTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Recent Transactions</h3>
          {expenses.map(expense => (
            <div key={expense._id} className="expense-item">
              <div className="expense-info">
                <h4>
                  {expense.title}
                  {expense.isAnomaly && (
                    <span className="anomaly-badge" title="Unusual transaction pattern detected">
                      <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Anomaly
                    </span>
                  )}
                </h4>
                <p>{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                <button 
                  onClick={() => deleteExpense(expense._id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>No transactions found.</p>}
        </div>
      </div>

      <div className="glass-container" style={{ padding: '0' }}>
        <div style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Analytics Overview</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Expenses by Category</h4>
              <div className="chart-wrapper">
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f8fafc' } } } }} />
              </div>
            </div>
            <div className="chart-card">
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Recent Trend</h4>
              <div className="chart-wrapper">
                <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#94a3b8' }, grid: { display: false } } } }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
