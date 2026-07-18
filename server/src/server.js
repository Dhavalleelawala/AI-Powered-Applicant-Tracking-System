const app = require('./app');
const config = require('./config');
const { connectDb } = require('./config/db');

async function start() {
  try {
    await connectDb();

    app.listen(config.port, () => {
      console.log(`ATS API listening on http://localhost:${config.port}`);
      console.log(`Health: GET http://localhost:${config.port}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
