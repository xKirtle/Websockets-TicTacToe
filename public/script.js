// Make Connection
var socket = io.connect(); //.connect('http://localhost:7777');

//DOM Queries
var containerO = document.getElementById('circleContainer');
var containerX = document.getElementById('crossContainer');
var symbolO = document.getElementById('circle');
var symbolX = document.getElementById('cross');
var symbolX2 = document.getElementById('cross2');
var symbolRadio = document.getElementsByName('game[symbol]');
var playerName = document.getElementById('playerName');
var roomNumber = document.getElementById('roomNumber');
var infoTable = document.getElementById('table');
var leaveRoom = document.getElementById('leaveRoom');
var gameTableCorner = document.getElementsByClassName('corner');
var lobbyContainer = document.getElementById('lobby');
var gameTableContainer = document.getElementById('game');
var waitRoom = document.getElementById('waitRoom');
var message = document.getElementById('message');
var btn = document.getElementById('send');
var output = document.getElementById('output');
var feedback = document.getElementById('feedback');
var gameSpace = gameTableContainer.getElementsByTagName('td');
var currentPlayer = document.getElementById('currentPlayer');
var winner = document.getElementById('winner');

//O Events
containerO.addEventListener('mouseover', mouseOverO);
containerO.addEventListener('mouseout', mouseOutO);
containerO.addEventListener('click', () => {
  symbolBorderColor('O');
});
//X Events
containerX.addEventListener('mouseover', mouseOverX);
containerX.addEventListener('mouseout', mouseOutX);
containerX.addEventListener('click', () => {
  symbolBorderColor('X');
});

function mouseOutX() {
  symbolX.style.borderColor = "white";
  symbolX2.style.borderColor = "white";
}

function mouseOverX() {
  symbolX.style.borderColor = "dodgerblue";
  symbolX2.style.borderColor = "dodgerblue";
}

function mouseOutO() {
  symbolO.style.borderColor = "white";
}

function mouseOverO() {
  symbolO.style.borderColor = "dodgerblue";
}

function symbolBorderColor(symbol) {
  if (symbol == 'O') {
    if (symbolX.style.borderColor == "dodgerblue") {
      symbolX.style.borderColor = "white";
      symbolX2.style.borderColor = "white";
    }

    symbolO.style.borderColor = "dodgerblue";

    //remove mouseout while it's selected
    containerO.removeEventListener('mouseout', mouseOutO);

    //enables back the mouseout of the other symbol
    containerX.addEventListener('mouseout', mouseOutX);

    symbolRadio[0].checked = true;
  }

  if (symbol == 'X') {
    if (symbolO.style.borderColor == "dodgerblue") {
      symbolO.style.borderColor = "white";
    }

    symbolX.style.borderColor = "dodgerblue";
    symbolX2.style.borderColor = "dodgerblue";


    //remove mouseout while it's selected
    containerX.removeEventListener('mouseout', mouseOutX);

    //enables back the mouseout of the other symbol
    containerO.addEventListener('mouseout', mouseOutO);

    symbolRadio[1].checked = true;
  }
}

leaveRoom.addEventListener('click', () => {
  socket.emit('leaveRoom');
});

//Room No. Input checker
roomNumber.addEventListener('input', function () {
  this.value = Math.abs(this.value.replace(/[^0-9]/g, '').slice(0, this.maxLength));
});

//Chat
function sendMessage() {
  if (playerName.value.replace(/\s/g, "").length > 0 && message.value.length > 0) {
    socket.emit('chat', {
      message: message.value,
      handle: playerName.value
    });
    message.value = '';
  } else if (!playerName.value.replace(/\s/g, "").length > 0) {
    alert('Please select a username before using the chat ');
    playerName.focus();
  } else {
    alert('Please write a valid message!');
  }
}
btn.addEventListener('click', sendMessage);

message.addEventListener('keypress', (evt) => {
  let keycode = (evt.keyCode ? evt.keyCode : evt.which);
  if (keycode == '13') sendMessage();
});

message.addEventListener('keypress', () => {
  socket.emit('typing', playerName.value);
});

socket.on('chat', (data) => {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('typing', (data) => {
  feedback.innerHTML = '<p><em>' + data + ' is typing a message..</em></p>';
});

//Lobby related functions
function formSubmit() {
  let symbol = symbolRadio[0].checked == true ? symbolRadio[0].value : symbolRadio[1].value;
  socket.emit('formSubmit', {
    name: playerName.value,
    room: roomNumber.value,
    symbol: symbol
  });
}

function goToGameRoom() {
  lobbyContainer.style.display = "none";
  gameTableContainer.style.display = "flex";
  waitRoom.style.display = "none";
  waitRoom.innerHTML = "";
}

function goToWaitRoom() {
  lobbyContainer.style.display = "none";
  gameTableContainer.style.display = "none";
  waitRoom.style.display = "inline-block";
  waitRoom.innerHTML = "Waiting for another player...";
}

function goToLobbyRoom() {
  lobbyContainer.style.display = "flex";
  gameTableContainer.style.display = "none";
  waitRoom.style.display = "none";
  waitRoom.innerHTML = "";
}

socket.on('roomsList', (gameRooms) => {
  removeAllServers();
  for (let i = 0; i < gameRooms.length; i++) {
    addNewServer(gameRooms[i].roomNumber, gameRooms[i].roomCount);
  }
});

socket.on('joinRoom', (roomCount) => {
  roomCount == 1 ? goToWaitRoom() : goToGameRoom();
});

socket.on('leaveRoom', () => {
  goToLobbyRoom()
});

socket.on('goToWaitRoom', (roomCount) => {
  goToWaitRoom(roomCount);
});

//Rooms display functions
function addNewServer(room, roomCount) {
  var newRow = document.createElement('tr');
  infoTable.appendChild(newRow);
  newRow.classList.add("roomRow");

  var rowRoom = document.createElement('td');
  rowRoom.innerHTML = room;
  rowRoom.id = room;
  newRow.appendChild(rowRoom);

  var rowPlayers = document.createElement('td');
  rowPlayers.innerHTML = roomCount;
  newRow.appendChild(rowPlayers);
}

function removeAllServers() {
  while (infoTable.firstChild) {
    infoTable.removeChild(infoTable.firstChild);
  }

  addNewServer('Room No.', 'Players');
}

//Game Corners
gameTableCorner[0].style.borderRadius = "10px 0 0 0";
gameTableCorner[1].style.borderRadius = "0 10px 0 0";
gameTableCorner[2].style.borderRadius = "0 0 0 10px";
gameTableCorner[3].style.borderRadius = "0 0 10px 0";

//Game onclick events
for (let i = 0; i < 9; i++) {
  let gameTile = document.getElementById('' + i + '');
  gameTile.addEventListener('click', () => {
    playerMove(i);
  })
}

function playerMove(tileId) {
  socket.emit('playerMove', {
    tileId: tileId,
    roomNumber: roomNumber.value
  });
}

socket.on('playerMove', (data) => {
  drawMove(data.tileId, data.symbol);
  currentPlayerDisplay(data.player);
});

socket.on('currentPlayerDisplay', (player) => {
  currentPlayerDisplay(player);
});

socket.on('cleanBoard', () => {
  for (let i = 0; i < 9; i++) {
    gameSpace[i].textContent = '';
  }
});

socket.on('winnerDisplay', (player) => {
  winnerDisplay(player);
});

socket.on('cleanText', () => {
  cleanText();
});

function currentPlayerDisplay(player) {
  currentPlayer.textContent = "It's " + player + "'s turn";
}

function drawMove(tileId, symbol) {
  gameSpace[tileId].textContent = symbol;
}

function winnerDisplay(player) {
  winner.textContent = player + " Wins!";
  currentPlayer.textContent = '';
}

function cleanText() {
  currentPlayer.textContent = '';
  winner.textContent = '';
  location.reload(true);
}