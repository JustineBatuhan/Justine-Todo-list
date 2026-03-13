import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Circle, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;

  return (
    <div className="app-container">
      <header className="header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ListTodo size={48} className="mx-auto mb-4 text-primary" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h1>Justine Todo List</h1>
          <p style={{ color: 'var(--text-muted)' }}>Master your day, one task at a time.</p>
        </motion.div>
      </header>

      <form className="input-group" onSubmit={addTodo}>
        <input
          type="text"
          placeholder="Enter a new task..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="add-btn" 
          type="submit"
        >
          <Plus size={24} />
        </motion.button>
      </form>

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

      <div className="todo-list">
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo) => (
            <motion.div
              layout
              key={todo.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <div 
                className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed && <Check size={14} color="white" />}
              </div>
              <span className="todo-text" onClick={() => toggleTodo(todo.id)}>
                {todo.text}
              </span>
              <button 
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}
          >
            No tasks found. Time to relax? ☕
          </motion.p>
        )}
      </div>

      <div className="stats">
        <span>{activeCount} tasks remaining</span>
        <span style={{ cursor: 'pointer' }} onClick={() => setTodos(todos.filter(t => !t.completed))}>
          Clear Completed
        </span>
      </div>
    </div>
  );
}

export default App;
