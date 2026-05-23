const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create an Express application
const app = express();

// Create an HTTP server to attach Socket.IO
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 3000;

// Store poll data in memory
const poll = {
  question: 'Which backend technology is best?',
  options: {
    'Node.js': 0,
    'Python': 0,
    'Java': 0,
    'Go': 0,
  },
};

// Simple route to verify the server is running
app.get('/', (req, res) => {
  res.send('Real-Time Polling App backend is running.');
});

// Send the current poll state to a specific socket
function sendCurrentPoll(socket) {
  socket.emit('pollUpdate', poll);
}

// Handle new socket connections
io.on('connection', (socket) => {
  console.log(`User connected: socket id=${socket.id}`);

  // Send poll data immediately to the newly connected client
  sendCurrentPoll(socket);

  // Handle incoming votes from clients
  socket.on('vote', (selectedOption) => {
    try {
      if (typeof selectedOption !== 'string') {
        console.warn(`Invalid vote payload from socket id=${socket.id}`);
        socket.emit('voteError', { message: 'Invalid vote format.' });
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(poll.options, selectedOption)) {
        console.warn(`Invalid vote option received: ${selectedOption} from socket id=${socket.id}`);
        socket.emit('voteError', { message: 'Option not found.' });
        return;
      }

      // Increase the vote count for the selected option
      poll.options[selectedOption] += 1;
      console.log(`Vote received: ${selectedOption} (socket id=${socket.id})`);

      // Broadcast the updated poll results to all connected clients
      io.emit('pollUpdate', poll);
    } catch (error) {
      console.error('Error handling vote event:', error);
      socket.emit('serverError', { message: 'Unable to process vote.' });
    }
  });

  // Handle client disconnects
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: socket id=${socket.id}, reason=${reason}`);
  });
});

// Start the server on port 3000
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
