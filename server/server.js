// server.js
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
const os = require('os');
const pty = require('node-pty');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

io.on('connection', (socket) => {
  console.log('Client connected');
  
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
  });

  // Handle incoming data from the terminal
  ptyProcess.onData((data) => {
    socket.emit('output', data);
  });

  // Handle input from the client
  socket.on('input', (data) => {
    ptyProcess.write(data);
  });

  // Handle terminal resize
  socket.on('resize', (size) => {
    ptyProcess.resize(size.cols, size.rows);
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    ptyProcess.kill();
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});