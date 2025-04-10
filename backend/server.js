const http = require('http');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
