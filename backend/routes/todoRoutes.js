const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// 取得所有 Todo
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 新增 Todo
router.post('/', async (req, res) => {
  const todo = new Todo({ title: req.body.title });
  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新 Todo 狀態
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.id || req.params.id);
    if (!todo) return res.status(404).json({ message: '找不到該項目' });
    
    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 刪除 Todo
router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;