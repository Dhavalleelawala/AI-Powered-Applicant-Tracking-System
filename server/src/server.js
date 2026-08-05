const app = require('./app');
const config = require('./config');
const { connectDb } = require('./config/db');

async function start() {
  try {
    await connectDb();

    const server = app.listen(config.port, () => {
      console.log(`Rolefit API listening on http://localhost:${config.port}`);
      console.log(`Health: GET http://localhost:${config.port}/api/health`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `Port ${config.port} is already in use. Stop the other process or set PORT in server/.env`
        );
      } else {
        console.error('Failed to start server:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
