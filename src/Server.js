"use strict"; 

var Game = require('./Game');

class Server {

  // The number of games is just the array size of 'allGames'
  //var NumberOfGames;    //integer
  
  constructor() {
    
    this.allGames = [];
  }
  
  createGame (player1, boardsize, gametype) { //Passing the player guids.
    //this.NumberOfGames ++;       //increment number of games.

    // Need to remove the socket before it gets serialized to the game data
    const newGame = new Game(Object.assign({}, player1, { socket: undefined }), boardsize, gametype);

  	if (gametype === 'Network') {
  		this.allGames.push(game); //Store game reference in server.
      //join game occurs later.
    }
  	else if (gametype === 'Hotseat') {
  		this.allGames.push(game);
  		//this.allGames[gameID].joinGame(player1);
  	}
  	else if (gametype === 'AI') {
  		this.allGames.push(game);
  		//this.allGames[GameID].joinGame(AI); //need to define a GUID for the AI. perhaps '00000001'?
  	}
  	else {
  		//error message
  	}
    //update players? 

    // Send the player a 'gameCreated' message with the game data
    player1.socket.emit('gameCreated', newGame.gameData);
    
    this.updatePlayers(newGame.gameID); //?
  }

  findGameById(gameID) {

    return this.allGames.find(game => game.id === gameID);
  }

  playMove (gameID, userID, x, y) {
	  
	  //call playmove out of "Game" class functions
	  //this.allGames[GameID].playMove(UserID, x, y);
	  this.updatePlayers(gameID);
  }
  
  
  //Need to send boardstate.
  updatePlayers (gameID) {

    const game = this.findGameById(gameID);
    
    if (!game) {
      return;
    }

    //IF HOTSEAT PLAY, SEND
	
  	if ('Hotseat' == game.gameData.gameType){
  		//send boardstate, and color of next move
  	}
    else {
  		if ('AI' == game.gameData.gameType){
  			//If AI moves next
  			//getMoveFromAI()
  			//always update human player, but if it is their turn, send the turn request flag.
  		}
  		else if ('network' == game.gameData.gameType){
  			
  		}
  		else {
  			//error message			
  		}
  		
  	}
  }
}

module.exports = Server;