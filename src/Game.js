"use strict";
var uuid = require('node-uuid');
var GameData = require('./GameData');

class Game {

  // Takes two player guids and generates game data
  constructor(inPlayerOne, inGameType, inBoardSize) {

    //How is GameID generated? Is it just the number of games + 1?
    var gameID = uuid.v4();

    this.playerOne = inPlayerOne; // This object has access to the socket
    this.playerTwo = undefined;

    this.gameData = new GameData(gameID, Object.assign({}, inPlayerOne, { socket: undefined }), undefined, inBoardSize)
  }
  
  playMove (UserID, x, y) {
    
    //GameID.Board.History.append(color, x, y);
    
    //calculate pieces taken and other changes to the board.
    
    //GameID.Board.CurrentState.makemove(color, x, y);
    
  }
    
  addPlayer (inPlayerTwo){

    this.playerTwo = inPlayerTwo;

    this.gameData.playerTwo = Object.assign({}, inPlayerTwo, { socket: undefined });

    this.playerOne.socket.emit('playerJoined', this.gameData);
    this.playerTwo.socket.emit('joinGame', this.gameData);
  }

    
  checkMove (GameID, UserID, x, y) {
    //GAME LOGIC, THIS IS FOR GABRIEL;
    //return true;
    //return false;
  }
  
  
}

module.exports = Game;
