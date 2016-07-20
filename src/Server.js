"use strict"; 

var Game = require('./Game');

class Server {

  // The number of games is just the array size of 'allGames'
  //var NumberOfGames;    //integer
  
  constructor() {
    
    this.allGames = [];
  }
  
  createGame (player, boardsize, gametype, colour) { //Passing the player guids.
	
	 console.log("createGame called");

    const newGame = new Game(player, boardsize, gametype, colour);

    this.allGames.push(newGame);

    // Send the player a 'gameCreated' message with the game data
    player.socket.emit('gameCreated', newGame.gameData);
  }

  // user becomes player 2
  joinGame(user, gameID) {

    let game = this.findGameById(gameID);

    if (!game) {

      user.socket.emit('failJoinGame', "Unable to find a game with that ID");

    } else {

      user.activeGame = gameID;
      game.addPlayer(user);
    }
  }

  findGameById(gameID) {

    return this.allGames.find(game => game.gameData.gameID === gameID || game.gameData.gameID.startsWith(gameID));
  }

  passMove (user) {
  
    console.log("called passMove");
  
  }
  
  playMove (user, x, y) {
  
  	console.log("called playMove");
  	  
  	  //call playmove out of "Game" class functions
  	  //this.allGames[GameID].playMove(UserID, x, y);


  	var game = this.findGameById(user.activeGame);

    if (!game) {
      return;
    }

  	game.playMove(user, x, y);
  	//game.updatePlayers(gameID);
  }
  
  
  //Need to send boardstate.
/*  updatePlayers (gameID) {

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
  } */
}

module.exports = Server;
