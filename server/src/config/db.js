const mongoose = require('mongoose');
const config = require('./index');

async function connectDb() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongodbUri);

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  return mongoose.connection;
}

function getDbStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = {
  connectDb,
  getDbStatus,
};
