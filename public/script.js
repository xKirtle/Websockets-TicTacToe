// Make Connection
var socket = io.connect();//.connect('http://localhost:7777');

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

//O Events
containerO.addEventListener('mouseover', mouseOverO);
containerO.addEventListener('mouseout', mouseOutO);
containerO.addEventListener('click', () => { symbolBorderColor('O'); });
//X Events
containerX.addEventListener('mouseover', mouseOverX);
containerX.addEventListener('mouseout', mouseOutX);
containerX.addEventListener('click', () => { symbolBorderColor('X'); });

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

leaveRoom.addEventListener('click', () => { socket.emit('leaveRoom'); });

//Room No. Input checker
roomNumber.addEventListener('input', function() {
  this.value = Math.abs(this.value.replace(/[^0-9]/g, '').slice(0,this.maxLength));
});

function formSubmit() {
  let symbol = symbolRadio[0].checked == true ? symbolRadio[0].value : symbolRadio[1].value;
  socket.emit('formSubmit', {
    name: playerName.value,
    room: roomNumber.value,
    symbol: symbol
  });
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

socket.on('leaveRoom', () => { goToLobbyRoom() });

socket.on('goToWaitRoom', (roomCount) => { goToWaitRoom(roomCount); });

socket.on('TestEvent', () => {
  console.log("test");
});

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
  while(infoTable.firstChild) {
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
  gameTile.addEventListener('click', (i) => {
    playerMove(i);
  })
}

function playerMove(tileId) {
  console.log("some text");
}
