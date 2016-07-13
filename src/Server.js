"use strict"; 

var Game = require('./Game');

class Server {

  // The number of games is just the array size of 'allGames'
  //var NumberOfGames;    //integer
  
  constructor() {
    
    this.allGames = [];
  }
  
  createGame (player1, player2, boardsize, gametype) { //Passing the player guids.
    //this.NumberOfGames ++;       //increment number of games.

	if (gametype == 'network'){
		this.allGames.push(new Game(player1, boardsize, gametype)); //Store game reference in server.
		//join game occurs later.
    }
	else if (gametype == 'Hotseat'){
		this.allGames.push(new game(player1, boardsize, gametype));
		this.allGames[gameID].joinGame(player1);
	}
	else if (gametype == 'AI'){
		this.allGames.push(new game(player1, boardsize, gametype));
		this.allGames[GameID].joinGame(AI); //need to define a GUID for the AI. perhaps '00000001'?
	}
	else{
		//error message
	}
    //update players?
    
    updatePlayers(GameID); //?
  }

  playMove (GameID, UserID, x, y) {
	  
	  //call playmove out of "Game" class functions
	  this.allGames[GameID].playMove(UserID, x, y);
	  updatePlayers(GameID);
  }
  
  
  //Need to send boardstate.
  updatePlayers (GameID) {
    
    //IF HOTSEAT PLAY, SEND
	
	if ('Hotseat' == this.allGames[GameID].Game.GameData.gameType){
		//send boardstate, and color of next move
	}
    else {
		if ('AI' == this.allGames[GameID].Game.GameData.gameType){
			//If AI moves next
			//getMoveFromAI()
			//always update human player, but if it is their turn, send the turn request flag.
		}
		else if ('network' == this.allGames[GameID].Game.GameData.gameType){
			
		}
		else {
			//error message			
		}
		
	}
  }
}

module.exports = Server;