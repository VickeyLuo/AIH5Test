const mongoose = require('mongoose');
const Player = require('./models/Player');
require('dotenv').config();

// MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legend-game';

async function initDatabase() {
  try {
    console.log('正在连接到MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ 已成功连接到MongoDB数据库');
    console.log('数据库URL:', MONGODB_URI);
    
    // 检查数据库连接
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('现有集合:', collections.map(c => c.name));
    
    // 创建索引
    console.log('正在创建索引...');
    await Player.createIndexes();
    console.log('✅ 索引创建完成');
    
    console.log('✅ 数据库初始化完成');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n可能的解决方案:');
    console.log('1. 确保MongoDB服务正在运行');
    console.log('2. 检查连接字符串是否正确');
    console.log('3. 使用云数据库服务（如MongoDB Atlas）');
    console.log('\n如果没有安装MongoDB，可以:');
    console.log('- macOS: brew install mongodb-community');
    console.log('- 或使用Docker: docker run -d -p 27017:27017 mongo');
    console.log('- 或使用MongoDB Atlas云服务');
  } finally {
    await mongoose.disconnect();
  }
}

initDatabase();