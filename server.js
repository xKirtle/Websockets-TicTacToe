var express = require('express');
var socket = require('socket.io');

//App setup
var app = express();
var server = app.listen(7777, function () {
  console.log('Listening to requests on port 7777');
});

//Static files
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());
var gameRooms = [];

//Receive post request
app.post('/', function (request, response) {
  // console.log('Name:', request.body.game.name);
  // console.log('Room:', request.body.game.room);
  // console.log('Symbol:', request.body.game.symbol);

  //Stays on the same page
  response.status(204).send();
});

//Socket setup
var io = socket(server);

io.on('connection', function (socket) {
  console.log('Connection with the socket', socket.id);
  socket.emit('roomsList', gameRooms);
  //console.log(io.nsps['/'].adapter.rooms);

  function findRoomByNumber(roomNumber) {
    let duplicate = false;
    let duplicateIndex;
    for (let i = 0; i < gameRooms.length; i++) {
      if (gameRooms[i].roomNumber == roomNumber) {
        duplicate = true;
        duplicateIndex = i;
        break;
      }
    }

    if (duplicate) {
      return duplicateIndex;
    } else {
      return -1;
    }
  }

  function roomDuplicate(room, socketId) {
    let duplicateIndex = findRoomByNumber(room);

    if (duplicateIndex >= 0) {
      let player1 = gameRooms[duplicateIndex].Players.Player1;
      let player2 = gameRooms[duplicateIndex].Players.Player2;

      if (player1[2] == socketId) {
        //Player2 moves to Player1 and Player2 is deleted
        for (let i = 0; i < player1.length; i++) {
          player1[i] = player2[i];
          player2[i] = "";
        }
      } else {
        //Player1 remains on Player1 and Player2 is deleted
        for (let i = 0; i < player1.length; i++) {
          player2[i] = "";
        }
      }

      gameRooms[duplicateIndex].roomCount = parseInt(gameRooms[duplicateIndex].roomCount) - 1;

      if (gameRooms[duplicateIndex].roomCount == 0) {
        //Delete room object from array
        gameRooms.splice(duplicateIndex, 1);
      }
      return true;
    } else {
      return false;
    }
  }

  function orderGameRooms() {
    gameRooms.sort((a, b) => {
      return a.roomNumber - b.roomNumber;
    });
  }

  function displayRooms() {
    console.log("-----------------------------------------------");
    orderGameRooms();
    for (let i = 0; i < gameRooms.length; i++) {
      console.log(gameRooms[i]);
    }
  }

  function randomFirstPlayer(roomIndex) {
    let random = Math.floor(Math.random() * 2);
    random == 0 ? gameRooms[roomIndex].currentPlayer = gameRooms[roomIndex].Players.Player1[2] : gameRooms[roomIndex].currentPlayer = gameRooms[roomIndex].Players.Player2[2];
  }

  function switchPlayer(roomIndex) {
    let currentPlayer = gameRooms[roomIndex].currentPlayer;
    let player1 = gameRooms[roomIndex].Players.Player1[2];
    let player2 = gameRooms[roomIndex].Players.Player2[2];
    currentPlayer == player1 ? currentPlayer = player2 : currentPlayer = player1;

    gameRooms[roomIndex].currentPlayer = currentPlayer;
  }

  socket.on('disconnecting', (reason) => {
    let rooms = Object.keys(socket.rooms);
    // console.log(rooms); // [ '123', '8Z6XiCSqKL6ZhWEHAAAA' ]
    // console.log(rooms[0]); // 123
    // console.log(rooms[1]); // 8Z6XiCSqKL6ZhWEHAAAA

    if (roomDuplicate(rooms[0], socket.id)) {
      console.log('Player disconnected successfully.');
      displayRooms();
    }

    orderGameRooms();
    //Emit the new gameRooms
    io.sockets.emit('roomsList', gameRooms);
  });

  socket.on('formSubmit', (data) => {
    //Disconnects from connected rooms since it can only be in one at a time
    let rooms = Object.keys(socket.rooms);
    let playerInRoom = false;

    if (rooms[0].length <= 3) {
      //Player will only ever be connected to 1 room
      playerInRoom = true;
    }

    if (playerInRoom == false) {
      //Check if room sent is already in gameRooms

      // TODO: implement findRoomByNumber below
      let duplicate = false;
      let duplicateIndex;
      for (let i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomNumber == data.room) {
          duplicate = true;
          duplicateIndex = i;
          break;
        }
      }
      // let newRoomObjectExample =  {
      //   roomNumber: "123" ,
      //   roomCount: "1",
      //   Players: {
      //     Player1: ["Player1Name", "O", "P1socket.id"],
      //     Player2: ["Player2Name", "X", "P2socket.id"]
      //   },
      //   currentPlayer: ""
      // };

      let newRoom = {
        roomNumber: data.room,
        roomCount: "0",
        Players: {
          Player1: ["", "", ""],
          Player2: ["", "", ""]
        },
        currentPlayer: ""
      };

      // TODO: Make newRoom a constructor

      if (!duplicate) {
        newRoom.roomCount = 1;
        newRoom.Players.Player1[0] = data.name;
        newRoom.Players.Player1[1] = data.symbol;
        newRoom.Players.Player1[2] = socket.id;

        gameRooms.push(newRoom);
        socket.join(data.room);
        socket.emit('joinRoom', 1);
      } else {
        if (gameRooms[duplicateIndex].roomCount < 2) {
          //Client joins room
          newRoom.roomCount = parseInt(gameRooms[duplicateIndex].roomCount) + 1;

          //Populate first player data since the room id is duplicated
          newRoom.Players.Player1[0] = gameRooms[duplicateIndex].Players.Player1[0];
          newRoom.Players.Player1[1] = gameRooms[duplicateIndex].Players.Player1[1];
          newRoom.Players.Player1[2] = gameRooms[duplicateIndex].Players.Player1[2];

          //First player joining the room gets to choose its symbol, second one just gets the one available
          newRoom.Players.Player2[0] = data.name;
          newRoom.Players.Player1[1] == "O" ? newRoom.Players.Player2[1] = "X" : newRoom.Players.Player2[1] = "O";
          newRoom.Players.Player2[2] = socket.id;

          gameRooms[duplicateIndex] = newRoom;
          socket.join(data.room);

          socket.emit('joinRoom', gameRooms[duplicateIndex].roomCount);
          io.to(data.room).emit('joinRoom', gameRooms[duplicateIndex].roomCount);

          randomFirstPlayer(duplicateIndex);
        }
      }

      //Emit the new gameRooms
      displayRooms();
      orderGameRooms();

      io.sockets.emit('roomsList', gameRooms);
      io.to(data.room).emit('TestEvent');
    }
  });

  socket.on('leaveRoom', () => {
    let rooms = Object.keys(socket.rooms);

    if (rooms[0].length <= 3) {
      let roomToRemove = rooms[0];
      let playerSocketId = rooms[1];
      let roomIndex = -1;

      if (roomDuplicate(roomToRemove, socket.id)) {
        roomIndex = gameRooms.map(function (room) {
          return room.roomNumber;
        }).indexOf(roomToRemove);
      }

      if (roomIndex >= 0) {
        io.to(gameRooms[roomIndex].Players.Player1[2]).emit('goToWaitRoom'); //gameRooms[roomIndex].roomCount will be always 1 here
      }

      socket.leave(roomToRemove);
      displayRooms();
      io.sockets.emit('roomsList', gameRooms);
      socket.emit('leaveRoom');
    }
  });

  //Chat Window
  socket.on('chat', (data) => {
    io.sockets.emit('chat', data);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data)
  });

  socket.on('playerMove', (data) => {
    let roomIndex = findRoomByNumber(data.roomNumber);

    if (roomIndex >= 0) {
      let currentPlayer = gameRooms[roomIndex].currentPlayer;
      if (currentPlayer == data.playerSocket) {
        io.to(data.roomNumber).emit('playerMove', {
          tileId: data.tileId,
          player: gameRooms[roomIndex].currentPlayer
        });
        switchPlayer(roomIndex);
      }
    }
  });
});