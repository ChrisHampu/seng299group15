//-----------------------------------------------------------------------------
//     INCLUDES
//-----------------------------------------------------------------------------

var express = require('express');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

//-----------------------------------------------------------------------------
//     DATABASE
//-----------------------------------------------------------------------------

class Database {
	var GameCache;		//array
	constructor () {	
	}
	
	GetGamesFromPlayer(){
	}
	
	LoadAllGames(){
	}
	
	StoreAllGames(){
	}
	
	LoadUser(){
	}
	
	RemoveGame(){
	}
	
	StoreGame(){
	}
}

class User extends Database {
	var FullName;		//string
	var Email;			//string
	var NumGamesPlayed;	//integer
	var ActiveGames;	//array
	var UserID;			//guid
}

class Game extends Database {
	var GameID;			//guid
	var PlayerOne;		//guid
	var PlayerTwo;		//guid
	var History;		//array
	//Added due to recommendation from Milestone 3
	var BoardSize;		//integer
}

//-----------------------------------------------------------------------------
//     SERVER
//-----------------------------------------------------------------------------


class Server {
	var NumberOfGames;		//integer
	var AllGames;			//array
	
	constructor(){
		
	}
	function CreateGame (var player1, var player2){ //Passing the player guids.
		this.NumberOfGames ++;		   //increment number of games.
		this.AllGames.push(new Game(player1, player2)); //Store game reference in server.
		
		//update players?
		
		UpdatePlayers(); //?
	}
	
	function CheckMove (var GameID, var UserID, var x var y){
		//GAME LOGIC, THIS IS FOR GABRIEL;
		//return true;
		//return false;
	}
	
	function PlayMove (var GameID, var UserID, var x, var y){
		
		//GameID.Board.History.append(color, x, y);
		
		//calculate pieces taken and other changes to the board.
		
		//GameID.Board.CurrentState.makemove(color, x, y);
		
	}
	
	function UpdatePlayers (var GameID) {
		var game = this.AllGames[GameID];
		
		//IF HOTSEAT PLAY, SEND
		
		//ELSE UPDATE PERSON WHO JUST PLAYED
		
			//IF AI MAKES NEXT MOVE
			
			//ELSE NETWORKED PLAYER MAKES NEXT MOVE
		
		

}

req = http.request(options, callback);

var postData = {
	"size" : size,
	"board" : board,
	"last" : lastMove
}

req.write (JSON.stringify (postData));

req.end();
		
		send Game.
		
	}
	
}


class Game {
	var GameID; 		//guid
	var PlayerOne;		//guid
	var PlayerTwo; 		//guid
	
	constructor(var player1, var player2){ //build by guid.
		this.PlayerOne = player1;
		this.PlayerTwo = player2;
		this.GameID = 0; //How is GameID generated? Is it just the number of games + 1?
	}
}

class Board {
	var History;		//Array of moves, rather than linked list, due to milestone 3 feedback.
	var CurrentState; 	//two dimensional array of integers for pieces on the board.
						//0 indicates an empty square,
						//1 indicates a black piece,
						//2 indicates a white piece.
						
	constructor (var History){
		//THIS BUILDS THE BOARD STATE BY EXECUTING THE MOVES IN TURN.
		//HISTORY IS COPIED OVER, and CURRENT STATE IS BUILT.
	}
	
	constructor (){
		//THIS CREATES AN EMPTY BOARD?
	}
	
	var 
}

//-----------------------------------------------------------------------------
//     CONNECTIONS
//-----------------------------------------------------------------------------

io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


















//-------------------- AI communication
			// var options = {
			// host: 'roberts.seng.uvic.ca',
			// path: '/ai/random',
			// port: '30000',
			// method: 'POST',
			// headers : {'Content-Type': 'application/json'}
	
			// };
		
			// var callback = function(response){
	
			// var str = '';
	
			// response.on('data', function(chunk){
				// str += chunk.toString();
			// })
		
			// response.on('end', function(){
				// console.log(str);
				// console.log('no more data');
			
				// console.log ("returning string " + str);
				// cb (JSON.parse(str));
			
			// })