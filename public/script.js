// Make Connection
var socket = io.connect();//.connect('http://localhost:7777');

// Emit events
// for (let i = 0; i < 9; i++) {
//   cells[i].addEventListener('click', function() {
//       socket.emit('click', cells[i].id);
//       console.log('click on id ' + cells[i].id);
//   });
// }

//Listen for events returned by the server
// socket.on('click', function(cellId) {
//     cells[cellId].innerHTML = "Used";
// });

//DOM Queries
var containerO = document.getElementById('circleContainer');
var containerX = document.getElementById('crossContainer');
var symbolO = document.getElementById('circle');
var symbolX = document.getElementById('cross');
var symbolX2 = document.getElementById('cross2');
var symbolRadio = document.getElementsByName('game[symbol]');
var playerName = document.getElementById('playerName');
var roomNumber = document.getElementById('roomNumber');
var playButton = document.getElementById('playButton');

//O Events
containerO.addEventListener('mouseover', mouseOverO);
containerO.addEventListener('mouseout', mouseOutO);
containerO.addEventListener('click', function() {
    symbolBorderColor('O');
});
//X Events
containerX.addEventListener('mouseover', mouseOverX);
containerX.addEventListener('mouseout', mouseOutX);

containerX.addEventListener('click', function() {
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


//Room No. Input checker
roomNumber.addEventListener('input', function() {
  this.value = Math.abs(this.value.replace(/[^0-9]/g, '').slice(0,this.maxLength));
});

function formSubmit() {
  console.log('Valid inputs');
}
