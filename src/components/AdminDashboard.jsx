import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, LogOut, RefreshCcw, BarChart3, TrendingUp, ArrowLeft } from 'lucide-react';

function AdminDashboard({ onLogout }) {
  const [allTodos, setAllTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    categoryData: {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    try {
      const registry = JSON.parse(localStorage.getItem('qm_admin_registry') || '{}');
      const flattened = Object.keys(registry).flatMap(username => {
        const vaultKey = registry[username].vaultKey;
        const tasks = JSON.parse(localStorage.getItem(vaultKey) || '[]');
        return tasks.map(todo => ({ ...todo, username }));
      });
      
      const sorted = flattened.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      });

      // Calculate Stats
      const catData = {};
      flattened.forEach(t => {
        const cat = t.category || 'Other';
        if (!catData[cat]) catData[cat] = { total: 0, completed: 0 };
        catData[cat].total++;
        if (t.completed) catData[cat].completed++;
      });

      setStats({
        total: flattened.length,
        completed: flattened.filter(t => t.completed).length,
        pending: flattened.filter(t => !t.completed).length,
        categoryData: catData
      });

      setAllTodos(sorted);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-container"
      style={{ margin: '0 auto', width: '100%' }}
    >
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
          <TrendingUp size={32} color="var(--primary)" />
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Executive Insights</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Quest Master Analytics</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button className="logout-btn" onClick={fetchData} title="Refresh Data">
            <RefreshCcw size={16} />
          </button>
          <button className="logout-btn" onClick={onLogout} style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.85rem' }}>
            <LogOut size={16} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
            Logout Session
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quest Completion</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0' }}>
            {Math.round((stats.completed / (stats.total || 1)) * 100)}%
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <div className="progress-fill" style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span>{stats.completed} Done</span>
            <span>{stats.pending} Remaining</span>
          </div>
        </div>

        <div className="stat-card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top Categories</span>
          <div className="chart-bar-container">
            {Object.keys(stats.categoryData).slice(0, 5).map(cat => {
                const height = (stats.categoryData[cat].total / (stats.total || 1)) * 100;
                return (
                  <div key={cat} className="chart-bar" style={{ height: `${Math.max(10, height)}%` }}>
                    <span className="chart-label" style={{ fontSize: '0.55rem' }}>{cat.substring(0, 3)}</span>
                  </div>
                );
            })}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} /> Detailed Activity Log
        </h2>
        
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Explorer</th>
                <th>Quest</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Scanning local scrolls...</td></tr>
              ) : allTodos.length > 0 ? (
                allTodos.map((todo, index) => (
                  <tr key={`${todo.id}-${index}`}>
                    <td><span className="user-badge">{todo.username}</span></td>
                    <td>{todo.text}</td>
                    <td><span className="category-tag">{todo.category || 'None'}</span></td>
                    <td>
                      <span className={`status-badge ${todo.completed ? 'status-completed' : 'status-pending'}`}>
                        {todo.completed ? 'Achieved' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No recorded quests in this domain.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;
