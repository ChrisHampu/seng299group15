
var socket = io();

document.getElementById("creategame").addEventListener("click", () => {

	console.log("creategame");

  var gameType = "Network";
  /*if (checked === size)
	{
	var boardSize = 9;
	}
  else if (checked === size2)
	{
	var boardSize = 13;
	}
  else if (checked === size3)
	{
	var boardSize = 19;
	}
  else 
	{ */
	var boardSize = 13;
/*	} */

  socket.emit('createGame', gameType, boardSize);
});

document.getElementById("playmove").addEventListener("click", () => {

	console.log("playmove");

	var UserID = 1;
	var x = 2;
	var y = 3;
	socket.emit('playMove', UserID, x, y);
});

document.getElementById("passmove").addEventListener("click", () => {

	console.log("passmove called");

	var GameID = 123;
	var UserID = 1;
	socket.emit('passMove', GameID, UserID);
});

document.getElementById("joingame").addEventListener("click", () => {

	console.log("joingame called");

	var GameID = 123;
	var UserID = 1;
	socket.emit('joinGame', GameID, UserID);
});

socket.on('gameCreated', game => {

  document.getElementById("gameid").innerHTML = game.gameID;
  document.getElementById("gameid").innerHTML = game.gameData.boardSize;
});

/*
***("click", () => {

	let id = "ased123";

	socket.emit('joinGame', id);
});

*/
