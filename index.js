var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(7777, function(){
  console.log('Listening to requests on port 7777');
});

// Static files
app.use(express.static('public'));


// Socket setup
var io = socket(server);

io.on('connection', function(socket) {
  console.log('Connection with the socket', socket.id);

  //Handle chat event
  socket.on('chat', function(data) {
    io.sockets.emit('chat', data);
  });

  //Handle chat typing event
  socket.on('typing', function(data) {
  socket.broadcast.emit('typing', data)
  });
});
