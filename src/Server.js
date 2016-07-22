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

    } else if (game.gameData.gameOver) {

      user.socket.emit("failJoinGame", "Game has ended");

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
      return;
    }

    let game = this.findGameById(user.activeReplay);

    if (!game) {
      return;
    }

    let gameData = game.gameData;

    let maxIndex = gameData.gameOver && gameData.history.length > 2 ? gameData.history.length - 2 : gameData.history.length;

    let _index = index < 0 ? 0 : (index > maxIndex ? maxIndex  : index);

    let board = new Board(gameData.history.slice(0, _index), gameData.boardSize);

    let blackPoints = 0;
    let whitePoints = 0;

    if (game.gameData.gameOver && maxIndex === _index) {
      console.log("setting points");
      blackPoints = game.countPoints(board, "Black");
      whitePoints = game.countPoints(board, "White");
    }

    console.log(gameData);
    console.log(_index);
    console.log(gameData.history.length);
    console.log(game.gameData.gameOver && maxIndex === _index);

    user.socket.emit('showReplayState', board.currentState, _index, game.gameData.gameOver && maxIndex === _index, blackPoints, whitePoints);
  }
}

module.exports = Server;
