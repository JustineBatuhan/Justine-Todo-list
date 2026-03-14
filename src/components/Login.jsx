import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

function Login({ onLogin, onAdminLogin }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const [isAvailable, setIsAvailable] = useState(null);

  // Load remembered credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('qm_remember');
    if (saved) {
      const { username: u, password: p } = JSON.parse(saved);
      setUsername(u || '');
      setPassword(p || '');
      setRememberMe(true);
    }
  }, []);

  // Check availability when username changes (case-insensitive)
  useEffect(() => {
    if (!isAdminMode && username.trim().length > 0) {
      const registry = JSON.parse(localStorage.getItem('user_registry') || '{}');
      setIsAvailable(!registry[username.trim().toLowerCase()]);
    } else {
      setIsAvailable(null);
    }
  }, [username, isAdminMode]);

  const suggestNumbers = () => {
    const registry = JSON.parse(localStorage.getItem('user_registry') || '{}');
    let baseName = username.trim().toLowerCase();
    let isTaken = true;
    while (isTaken) {
      const rand = Math.floor(100 + Math.random() * 899);
      const possibleName = `${baseName}${rand}`;
      if (!registry[possibleName]) {
        setUsername(possibleName);
        isTaken = false;
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both name and password.');
      return;
    }

    if (isAdminMode) {
      const result = onAdminLogin(password);
      if (!result.success) setError(result.message);
    } else {
      const result = onLogin(username.trim(), password);
      if (!result.success) {
        setError(result.message);
      } else {
        if (rememberMe) {
          localStorage.setItem('qm_remember', JSON.stringify({ username: username.trim(), password }));
        } else {
          localStorage.removeItem('qm_remember');
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="auth-container"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        padding: '2.5rem',
        borderRadius: '32px',
        border: '1px solid var(--glass-border)',
        maxWidth: '430px',
        width: '100%',
        margin: '0 auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: isAdminMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1rem',
          color: isAdminMode ? 'var(--danger)' : 'var(--primary)'
        }}>
          {isAdminMode ? <ShieldCheck size={32} /> : <User size={32} />}
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
          {isAdminMode ? 'Admin Access' : 'Quest Master'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {isAdminMode ? 'Enter credentials to view analytics.' : 'Secure isolation for your productivity.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div className="auth-input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isAdminMode ? 'Admin ID' : 'Your Name'}
            </label>
            {!isAdminMode && username.trim() && (
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '2px 8px', 
                borderRadius: '10px', 
                fontWeight: 600,
                background: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: isAvailable ? 'var(--success)' : 'var(--warning)',
                border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
              }}>
                {isAvailable ? 'Available ✨' : 'Already Taken'}
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder={isAdminMode ? "Admin" : "e.g. Justine"} 
              style={{ 
                padding: '0.8rem 0.8rem 0.8rem 40px', 
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          {!isAdminMode && isAvailable === false && (
            <button 
              type="button"
              onClick={suggestNumbers}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--primary)', 
                fontSize: '0.75rem', 
                marginTop: '8px', 
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              This name is yours? Sign in. Otherwise, suggest numbers?
            </button>
          )}
        </div>

        <div className="auth-input-group">
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
            {isAdminMode ? 'Admin Password' : 'Your Password'}
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="••••••••" 
              style={{ 
                padding: '0.8rem 0.8rem 0.8rem 40px', 
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'white',
                outline: 'none'
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {!isAdminMode && (
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              First time? This password will be saved for your name.
            </p>
          )}
        </div>

        {!isAdminMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              onClick={() => setRememberMe(!rememberMe)}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                border: `2px solid ${rememberMe ? 'var(--primary)' : 'var(--glass-border)'}`,
                background: rememberMe ? 'var(--primary)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              {rememberMe && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span
              onClick={() => setRememberMe(!rememberMe)}
              style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}
            >
              Remember me
            </span>
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>{error}</p>
        )}

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          style={{ 
            background: isAdminMode ? 'var(--danger)' : 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isAdminMode ? 'Unlock Console' : 'Start My List'} <ArrowRight size={18} />
        </motion.button>
      </form>

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
        <button 
          onClick={() => { setIsAdminMode(!isAdminMode); setError(''); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isAdminMode ? 'Back to User Login' : 'Admin Panel Sign In'}
        </button>
      </div>
    </motion.div>
  );
}

export default Login;
