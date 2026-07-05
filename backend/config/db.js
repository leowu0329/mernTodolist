const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Cloud 連線成功');
  } catch (error) {
    console.error('MongoDB 連線失敗:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;