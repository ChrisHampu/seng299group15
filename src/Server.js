"use strict"; 

var Game = require('./Game');

class Server {
  
  constructor() {
    
    this.allGames = [];
  }
  
  createGame (player, boardsize, gametype, colour) { //Passing the player guids.

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
  
  playMove (user, x, y, pass) {

  	var game = this.findGameById(user.activeGame);

    if (!game) {
      return;
    }

  	game.playMove(user, x, y, pass);
  }
}

module.exports = Server;
