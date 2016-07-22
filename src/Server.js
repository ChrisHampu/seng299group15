"use strict"; 

var Game = require('./Game');
var Board = require('./Board');

class Server {
  
  constructor() {
    
    this.allGames = [];
  }
  
  createGame (player, boardsize, gametype, colour) { //Passing the player guids.

    // Force hotseat games to start playing as black
    const newGame = new Game(player, boardsize, gametype, gametype === "Hotseat" ? "Black" : colour);

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

  requestReplay(user, gameID) {

    var game = this.findGameById(gameID);

    if (!game) {
      user.socket.emit('failRequestReplay', "Unable to find a game with that ID");
    } else {

      user.activeReplay = gameID;

      user.socket.emit('showReplay', game.gameData);
    }
  }

  replayMove(user, index) {

    if (!user.activeReplay) {
      console.log("No replay");
      return;
    }

    let game = this.findGameById(user.activeReplay);

    if (!game) {
      console.log("stale replay");
      return;
    }

    let gameData = game.gameData;

    let _index = index < 0 ? 0 : (index > gameData.history.length ? gameData.history.length  : index);

    let board = new Board(gameData.history.slice(0, _index), gameData.boardSize);

    user.socket.emit('showReplayState', board.currentState, _index);
  }
}

module.exports = Server;
