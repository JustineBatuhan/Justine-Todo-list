import React, { useState, useEffect, useRef } from 'react';
import { Plus, ListTodo, Search, Mic, LogOut, Compass } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';
import TodoItem from './components/TodoItem';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Helper to create a secure-looking key from a username (case-insensitive)
  const getSecureKey = (name) => {
    const normalized = name.toLowerCase();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `qm_vault_${Math.abs(hash).toString(16)}`;
  };

  const [todos, setTodos] = useState(() => {
    if (!user) return [];
    const savedTodos = localStorage.getItem(getSecureKey(user.username));
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Sync todos to local storage
  useEffect(() => {
    if (user) {
      const vaultKey = getSecureKey(user.username);
      localStorage.setItem(vaultKey, JSON.stringify(todos));
      
      // Update global registry for Admin tracking
      const registry = JSON.parse(localStorage.getItem('qm_admin_registry') || '{}');
      registry[user.username] = { 
        lastUpdated: new Date().toISOString(),
        vaultKey: vaultKey,
        count: todos.length
      };
      localStorage.setItem('qm_admin_registry', JSON.stringify(registry));
    }
  }, [todos, user]);

  // Handle data loading on user change
  useEffect(() => {
    if (user) {
      const savedTodos = localStorage.getItem(getSecureKey(user.username));
      setTodos(savedTodos ? JSON.parse(savedTodos) : []);
    } else {
      setTodos([]);
    }
  }, [user]);

  // Voice Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const startVoice = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const handleLogin = (username, password) => {
    const registry = JSON.parse(localStorage.getItem('user_registry') || '{}');
    const normalized = username.trim().toLowerCase();
    
    if (registry[normalized]) {
      // Existing user: Verify password
      if (registry[normalized] === password) {
        const userData = { username: normalized, role: 'user' };
        setUser(userData);
        localStorage.setItem('current_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: 'Incorrect password for this user.' };
      }
    } else {
      // New user: Register
      registry[normalized] = password;
      localStorage.setItem('user_registry', JSON.stringify(registry));
      const userData = { username: normalized, role: 'user' };
      setUser(userData);
      localStorage.setItem('current_user', JSON.stringify(userData));
      return { success: true, message: 'Account created and logged in!' };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('current_user');
  };

  const handleAdminLogin = (password) => {
    if (password === 'Justinebatuhan2004') {
      setIsAdminAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid admin password.' };
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      priority,
      category,
      dueDate,
      subtasks: [],
      username: user.username,
      created_at: new Date().toISOString()
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const updateSubtasks = (id, subtasks) => {
    setTodos(todos.map(t => t.id === id ? { ...t, subtasks } : t));
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'active' ? !todo.completed : (filter === 'completed' ? todo.completed : true);
    const matchesCategory = activeCategory === 'All' || todo.category === activeCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const categories = ['All', 'Personal', 'Work', 'Urgent', 'Health', 'Finance'];

  // Conditional Rendering
  if (isAdminAuthenticated) {
    return <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />;
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <Login onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', padding: '1rem' }}>
      <nav style={{ 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid var(--glass-border)',
        padding: '0.8rem 1rem',
        marginBottom: '2rem',
        borderRadius: '16px'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div className="explorer-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Compass size={18} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Explorer</p>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{user.username}</h3>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-btn" 
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <header className="header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <ListTodo size={40} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem' }} />
          <h1>Quest Master</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Level up your productivity.</p>
        </motion.div>
      </header>

      <form className="input-section" onSubmit={addTodo}>
        <div className="input-main">
          <input
            type="text"
            placeholder="What's your next quest?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="button" onClick={startVoice} className={`voice-btn ${isRecording ? 'voice-active' : ''}`}>
            <Mic size={20} />
          </button>
          <button className="add-btn" type="submit">
            <Plus size={24} />
          </button>
        </div>
        
        <div className="input-options">
          <select className="option-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <select className="option-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input 
            type="date" 
            className="option-select" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
          />
        </div>
      </form>

      <div className="controls-row">
        <div className="search-bar">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search quests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '8px' }}>
        {categories.map(c => (
          <button 
            key={c} 
            className={`filter-btn ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}
            style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.8rem' }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="todo-list-container">
        <AnimatePresence mode="popLayout">
          {filteredTodos.length > 0 ? (
            <Reorder.Group 
              axis="y" 
              values={filter === 'all' && searchQuery === '' && activeCategory === 'All' ? todos : filteredTodos} 
              onReorder={(newOrder) => {
                if (filter === 'all' && searchQuery === '' && activeCategory === 'All') {
                  setTodos(newOrder);
                }
              }} 
              style={{ listStyle: 'none', padding: 0 }}
            >
              {filteredTodos.map((todo) => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                  toggleTodo={toggleTodo} 
                  deleteTodo={deleteTodo}
                  updateSubtasks={updateSubtasks}
                />
              ))}
            </Reorder.Group>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}
            >
              No quests found. Start a new adventure! ⚔️
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="stats" style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
        <span>{todos.filter(t => !t.completed).length} active quests</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {Math.round((todos.filter(t => t.completed).length / (todos.length || 1)) * 100)}% Complete
        </span>
      </div>
    </div>
  );
}

export default App;
