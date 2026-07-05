require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

// 連接資料庫
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// 核心路由：同時掛載 /api/todos 與 / (因為 Vercel 轉發過來時可能會移除前綴)
app.use('/api/todos', todoRoutes);
app.use('/', todoRoutes); 

// 將原本的測試根路由移除，或者改到別的路徑，避免它搶走所有請求
app.get('/api-health', (req, res) => {
  res.send('Todo API 運行中...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // 為了 Vercel Serverless Function 運作