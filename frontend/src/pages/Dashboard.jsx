import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Plus, Trash2, AlertTriangle, TrendingUp, AlertCircle, DollarSign, Download, Target } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'food'
  });
  const [timeFilter, setTimeFilter] = useState('all');
  const [budget, setBudget] = useState(localStorage.getItem('monthlyBudget') || 1000);
  
  const categories = ['food', 'transport', 'utilities', 'entertainment', 'shopping', 'other'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        
        const userRes = await axios.get('http://localhost:5001/api/auth/user', config);
        setUser(userRes.data);
        
        const expenseRes = await axios.get('http://localhost:5001/api/expenses', config);
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
      
      const res = await axios.post('http://localhost:5001/api/expenses', newExpense, config);
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
      
      await axios.delete(`http://localhost:5001/api/expenses/${id}`, config);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering Logic
  const filteredExpenses = expenses.filter(expense => {
    if (timeFilter === 'all') return true;
    const expenseDate = new Date(expense.date);
    const today = new Date();
    const diffTime = Math.abs(today - expenseDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeFilter === 'week') return diffDays <= 7;
    if (timeFilter === 'month') return diffDays <= 30;
    return true;
  });

  // Analytics Data Preparation
  const categoryTotals = filteredExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const getCategoryColor = (category) => {
    const colors = {
      food: 'rgba(245, 158, 11, 0.8)',
      transport: 'rgba(16, 185, 129, 0.8)',
      utilities: 'rgba(56, 189, 248, 0.8)',
      entertainment: 'rgba(99, 102, 241, 0.8)',
      shopping: 'rgba(168, 85, 247, 0.8)',
      other: 'rgba(148, 163, 184, 0.8)'
    };
    return colors[category] || colors.other;
  };

  const doughnutData = {
    labels: Object.keys(categoryTotals).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: Object.keys(categoryTotals).map(getCategoryColor),
      borderWidth: 0
    }]
  };

  const barData = {
    labels: filteredExpenses.slice(0, 7).map(e => new Date(e.date).toLocaleDateString()),
    datasets: [{
      label: 'Amount ($)',
      data: filteredExpenses.slice(0, 7).map(e => e.amount),
      backgroundColor: filteredExpenses.slice(0, 7).map(e => getCategoryColor(e.category)),
      borderRadius: 6
    }]
  };

  const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const highestTx = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)) : 0;
  const avgSpend = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;
  const anomalyCount = filteredExpenses.filter(e => e.isAnomaly).length;

  const budgetProgress = Math.min((totalSpent / budget) * 100, 100);
  let progressColor = 'var(--accent)';
  if (budgetProgress > 75) progressColor = 'var(--warning)';
  if (budgetProgress > 90) progressColor = 'var(--danger)';

  const handleBudgetChange = (e) => {
    const val = e.target.value;
    setBudget(val);
    localStorage.setItem('monthlyBudget', val);
  };

  const exportToCSV = () => {
    const headers = ['Date,Title,Category,Amount,Anomaly'];
    const rows = filteredExpenses.map(e => 
      `${new Date(e.date).toLocaleDateString()},"${e.title}",${e.category},${e.amount},${e.isAnomaly}`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expense_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            <h3>Recent Transactions</h3>
            <button onClick={exportToCSV} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
          {filteredExpenses.map(expense => (
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

      <div className="glass-container" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Analytics Overview</h2>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.4rem 1rem' }}>
              <option value="all">All Time</option>
              <option value="month">Last 30 Days</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>

          {/* Budget Progress Bar */}
          <div style={{ background: 'rgba(15,23,42,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={16} /> Budget Usage
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Set Budget: $</span>
                <input type="number" value={budget} onChange={handleBudgetChange} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '60px', padding: '2px 5px', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${budgetProgress}%`, background: progressColor, height: '100%', transition: 'width 0.5s ease, background 0.5s ease' }}></div>
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              ${totalSpent.toFixed(2)} / ${budget} ({budgetProgress.toFixed(1)}%)
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(15,23,42,0.4)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={14}/> Highest Transaction</p>
              <h3 style={{ marginTop: '0.5rem', color: '#f8fafc' }}>${highestTx.toFixed(2)}</h3>
            </div>
            <div style={{ background: 'rgba(15,23,42,0.4)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={14}/> Average Spend</p>
              <h3 style={{ marginTop: '0.5rem', color: '#f8fafc' }}>${avgSpend.toFixed(2)}</h3>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={14}/> Anomalies Detected</p>
              <h3 style={{ marginTop: '0.5rem', color: 'var(--danger)' }}>{anomalyCount}</h3>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Expenses by Category</h4>
              <div className="chart-wrapper">
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f8fafc', padding: 20 } } } }} />
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
