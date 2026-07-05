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

// 路由
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
  res.send('Todo API 運行中...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // 為了 Vercel Serverless Function 運作