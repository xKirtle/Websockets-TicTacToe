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
var gameRooms = [];

//Receive post request
app.post('/', function(request, response){
  // console.log('Name:', request.body.game.name);
  // console.log('Room:', request.body.game.room);
  // console.log('Symbol:', request.body.game.symbol);

  //Stays on the same page
  response.status(204).send();
});

// Socket setup
var io = socket(server);

io.on('connection', function(socket) {
  console.log('Connection with the socket', socket.id);
  //console.log(io.nsps['/'].adapter.rooms);

  socket.on('joinNewRoom', function(data) {
    console.log(data);

    var room = io.nsps['/'].adapter.rooms[data.room];
    var roomLength;
    if (room) {
      roomLength = io.nsps['/'].adapter.rooms[data.room].length;
      console.log(roomLength);
    }

    if (typeof room == 'undefined') {
      socket.join(data.room);
      roomLength = 1; //room was undefined
      console.log('Joined');

      //Create new room object to insert in the Rooms array
      let newRoom = {
        roomNumber: data.room,
        roomCount: roomLength
      }

      //Push to array and sort it
      gameRooms.push(newRoom);
      gameRooms.sort(function(a,b) {
        return a.roomNumber - b.roomNumber;
      });

      //Send it to clients
      io.sockets.emit('roomJoined', gameRooms);
    }
    if (typeof room != 'undefined' && roomLength < 2) {
      socket.join(data.room);
      roomLength = io.nsps['/'].adapter.rooms[data.room].length;
      console.log('Joined2');

      //Create new room object to insert in the Rooms array
      let newRoom = {
        roomNumber: data.room,
        roomCount: roomLength
      }

      let duplicate = false;
      for (let i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomNumber == newRoom.roomNumber) {
          duplicate = true;

          //Just to prevent the number from going up if the user spams it
          if (gameRooms[i].roomCount < 2) {
            gameRooms[i].roomCount += 1;
          }
        }
      }

      //Push to array and sort it
      if (!duplicate) {
        gameRooms.push(newRoom);
      }

      gameRooms.sort(function(a,b) {
        return a.roomNumber - b.roomNumber;
      });

      //Send it to clients
      io.sockets.emit('roomJoined', gameRooms);
    }
    //One of the both if conditions above will be triggered
  });
});
