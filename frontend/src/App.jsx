import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 根據環境變數自動切換 API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/todos';

function App() {
  // 確保初始狀態為空陣列 []
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  // Modal 相關狀態
  const [showModal, setShowModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  // 1. 取得所有 Todo
  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      // 安全檢查：確保後端回傳的是陣列才寫入狀態，否則給予空陣列
      if (Array.isArray(res.data)) {
        setTodos(res.data);
      } else {
        console.error('後端回傳的資料格式不是陣列:', res.data);
        setTodos([]);
      }
    } catch (err) {
      console.error('讀取資料失敗', err);
      setTodos([]);
    }
  };

  // 2. 新增 Todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await axios.post(API_URL, { title: input });
      // 確保目前 todos 是陣列才進行解構新增
      if (Array.isArray(todos)) {
        setTodos([res.data, ...todos]);
      } else {
        setTodos([res.data]);
      }
      setInput('');
    } catch (err) {
      console.error('新增失敗', err);
    }
  };

  // 3. 切換單一 Todo 狀態
  const toggleTodo = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`);
      if (Array.isArray(todos)) {
        setTodos(todos.map(todo => todo._id === id ? res.data : todo));
      }
    } catch (err) {
      console.error('更新失敗', err);
    }
  };

  // 4. 開啟刪除確認 Modal
  const openDeleteModal = (todo) => {
    setTodoToDelete(todo);
    setShowModal(true);
  };

  // 5. 執行刪除
  const confirmDelete = async () => {
    if (!todoToDelete) return;
    try {
      await axios.delete(`${API_URL}/${todoToDelete._id}`);
      if (Array.isArray(todos)) {
        setTodos(todos.filter(todo => todo._id !== todoToDelete._id));
      }
      setShowModal(false);
      setTodoToDelete(null);
    } catch (err) {
      console.error('刪除失敗', err);
    }
  };

  // 6. 全選 / 全不選 安全邏輯
  const isTodosArray = Array.isArray(todos);
  // 使用安全導引操作符 ?. 確保 todo 存在
  const isAllChecked = isTodosArray && todos.length > 0 && todos.every(todo => todo?.completed);

  const handleSelectAll = async () => {
    if (!isTodosArray) return;
    const targetStatus = !isAllChecked;
    
    // 前端發送請求同步後端狀態
    const updatedTodos = await Promise.all(
      todos.map(async (todo) => {
        if (todo && todo.completed !== targetStatus) {
          try {
            const res = await axios.put(`${API_URL}/${todo._id}`);
            return res.data;
          } catch (err) {
            console.error('批次更新失敗的項目 ID:', todo._id, err);
            return todo;
          }
        }
        return todo;
      })
    );
    setTodos(updatedTodos);
  };

  // 7. 統計數據安全計算
  const totalCount = isTodosArray ? todos.length : 0;
  const completedCount = isTodosArray ? todos.filter(todo => todo?.completed).length : 0;
  const uncompletedCount = totalCount - completedCount;

  return (
    <div className="container py-5" style={{ maxWidth: '650px' }}>
      <h1 className="text-center mb-4 fw-bold text-primary">MERN Todo List</h1>
      
      {/* 統計資訊欄位 */}
      <div className="row g-2 mb-4 text-center">
        <div className="col-4">
          <div className="bg-light border rounded p-2 shadow-sm">
            <span className="text-muted d-block small">全部</span>
            <strong className="fs-4 text-dark">{totalCount}</strong> <span className="small text-muted">筆</span>
          </div>
        </div>
        <div className="col-4">
          <div className="bg-success-subtle border border-success-subtle rounded p-2 shadow-sm">
            <span className="text-success d-block small">已完成</span>
            <strong className="fs-4 text-success">{completedCount}</strong> <span className="small text-success">筆</span>
          </div>
        </div>
        <div className="col-4">
          <div className="bg-danger-subtle border border-danger-subtle rounded p-2 shadow-sm">
            <span className="text-danger d-block small">未完成</span>
            <strong className="fs-4 text-danger">{uncompletedCount}</strong> <span className="small text-danger">筆</span>
          </div>
        </div>
      </div>

      {/* 輸入表單 */}
      <form onSubmit={addTodo} className="input-group mb-3 shadow-sm">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="新增待辦事項..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary px-4" type="submit">新增</button>
      </form>

      {/* 全選控制列 */}
      {totalCount > 0 && (
        <div className="d-flex align-items-center justify-content-between p-2 mb-2 bg-white border rounded shadow-sm">
          <div className="form-check ms-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="selectAllCheckbox"
              checked={isAllChecked}
              onChange={handleSelectAll}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label className="form-check-label ms-2 fw-medium user-select-none" htmlFor="selectAllCheckbox" style={{ cursor: 'pointer' }}>
              {isAllChecked ? '取消全選' : '全選所有事項'}
            </label>
          </div>
          <span className="text-muted small me-2">勾選即可批次切換狀態</span>
        </div>
      )}

      {/* Todo 列表 */}
      <ul className="list-group shadow-sm">
        {isTodosArray && todos.map(todo => (
          todo && (
            <li key={todo._id} className="list-group-item d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center" style={{ flex: 1, marginRight: '10px' }}>
                <input
                  className="form-check-input me-3"
                  type="checkbox"
                  checked={todo.completed || false}
                  onChange={() => toggleTodo(todo._id)}
                  style={{ width: '1.4rem', height: '1.4rem', cursor: 'pointer', flexShrink: 0 }}
                />
                <span className={`fs-5 text-break ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                  {todo.title}
                </span>
              </div>
              <button 
                className="btn btn-outline-danger btn-sm" 
                onClick={() => openDeleteModal(todo)}
                style={{ flexShrink: 0 }}
              >
                刪除
              </button>
            </li>
          )
        ))}
        {totalCount === 0 && (
          <li className="list-group-item text-center p-4 text-muted bg-light">
            目前沒有任何待辦事項，動手新增一個吧！
          </li>
        )}
      </ul>

      {/* ================= Bootstrap Modal (刪除確認視窗) ================= */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title fw-bold">⚠️ 確認刪除</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => { setShowModal(false); setTodoToDelete(null); }}></button>
                </div>
                <div className="modal-body py-4">
                  <p className="fs-5 mb-1">您確定要刪除此項待辦事項嗎？</p>
                  <p className="text-muted bg-light p-2 rounded border-start border-danger border-3 text-truncate">
                    「 {todoToDelete?.title} 」
                  </p>
                  <span className="text-danger small">*此操作將無法復原。</span>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setTodoToDelete(null); }}>取消</button>
                  <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>確認刪除</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}
    </div>
  );
}

export default App;