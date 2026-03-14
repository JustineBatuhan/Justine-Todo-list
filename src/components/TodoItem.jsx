import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Trash2, Check, ChevronDown, ChevronUp, Plus, Calendar, Tag } from 'lucide-react';

function TodoItem({ todo, toggleTodo, deleteTodo, updateSubtasks }) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const updated = [...(todo.subtasks || []), { id: Date.now(), text: newSubtask, completed: false }];
    updateSubtasks(todo.id, updated);
    setNewSubtask('');
  };

  const toggleSubtask = (sId) => {
    const updated = todo.subtasks.map(s => 
      s.id === sId ? { ...s, completed: !s.completed } : s
    );
    updateSubtasks(todo.id, updated);
  };

  const completedSubtasks = (todo.subtasks || []).filter(s => s.completed).length;
  const totalSubtasks = (todo.subtasks || []).length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Reorder.Item
      value={todo}
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
    >
      <div className="todo-item-top">
        <div 
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => toggleTodo(todo.id)}
        >
          {todo.completed && <Check size={14} color="white" />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="todo-text" onClick={() => toggleTodo(todo.id)}>
              {todo.text}
            </span>
            <div className="badges">
              {todo.priority && (
                <span className={`badge badge-${todo.priority}`}>
                  {todo.priority}
                </span>
              )}
              {todo.category && (
                <span className="category-tag">
                  <Tag size={10} style={{ marginRight: '4px' }} />
                  {todo.category}
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {todo.dueDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
            <span onClick={() => setShowSubtasks(!showSubtasks)} style={{ cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} steps` : 'Add steps'} 
              {showSubtasks ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </div>
        </div>

        <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
          <Trash2 size={18} />
        </button>
      </div>

      {totalSubtasks > 0 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {showSubtasks && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="subtasks-container"
        >
          {todo.subtasks.map(s => (
            <div key={s.id} className="subtask-item">
              <div 
                className={`subtask-dot ${s.completed ? 'done' : ''}`}
                onClick={() => toggleSubtask(s.id)}
              />
              <span style={{ textDecoration: s.completed ? 'line-through' : 'none', opacity: s.completed ? 0.6 : 1 }}>
                {s.text}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input 
              type="text" 
              placeholder="Add step..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
              style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'white', padding: '2px 0' }}
            />
            <button onClick={addSubtask} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
              <Plus size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </Reorder.Item>
  );
}

export default TodoItem;
