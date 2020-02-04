var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(7777, function(){
  console.log('Listening to requests on port 7777');
});

// Static files
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());

//Receive post request
app.post('/', function(request, response){
    console.log('Name:', request.body.game.name);
    console.log('Room:', request.body.game.room);
    console.log('Symbol:', request.body.game.symbol);
});

// Socket setup
var io = socket(server);

io.on('connection', function(socket) {
  console.log('Connection with the socket', socket.id);

  // socket.on('click', function(cellId) {
  //     io.sockets.emit('click', cellId);
  //     console.log('Received request from', socket.id);
  //     console.log('Updated the cell with the id of', cellId);
  //     console.log(' ');
  // });

  //Handle chat event
  // socket.on('chat', function(data) {
  //   io.sockets.emit('chat', data);
  // });
  //
  // //Handle chat typing event
  // socket.on('typing', function(data) {
  // socket.broadcast.emit('typing', data)
  // });
});
