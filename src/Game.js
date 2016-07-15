"use strict";
var uuid = require('node-uuid');
var GameData = require('./GameData');

class Game {

  // Takes two player guids and generates game data
  constructor(inPlayerOne, inGameType, inBoardSize){

    //How is GameID generated? Is it just the number of games + 1?
    var gameID = uuid.v4();

    this.gameData = new GameData(gameID, inPlayerOne, undefined, inBoardSize)
  }
  
  playMove (UserID, x, y) {
    
    //GameID.Board.History.append(color, x, y);
    
    //calculate pieces taken and other changes to the board.
    
    //GameID.Board.CurrentState.makemove(color, x, y);
    
  }
    
    addPlayer (user){

        this.gameData.Player2 = user;
        //called when person not the owner of game accesses the game.
        this.gameData.Player1.socket.emit('playerJoined', this.gameData);

    }

    
  checkMove (GameID, UserID, x, y) {
    //GAME LOGIC, THIS IS FOR GABRIEL;
    //return true;
    //return false;
  }
  
  
}

module.exports = Game;
