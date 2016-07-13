
var socket = io();

document.getElementById("creategame").addEventListener("click", () => {

  var gameType = "Network";
  var boardSize = 13;

  socket.emit('createGame', gameType, boardSize);
});

socket.on('gameCreated', game => {

  document.getElementById("gameid").innerHTML = game.gameID;
});