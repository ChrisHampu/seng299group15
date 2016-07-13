"use strict"; 

var GameData = require('./GameData');

class Game {

  // Takes two player guids and generates game data
  constructor(inPlayerOne, inPlayerTwo){

    //How is GameID generated? Is it just the number of games + 1?
    var gameID = 0;

    this.gameData = new GameData(gameID, inPlayerOne, inPlayerTwo, inBoardSize)
  }
  
    playMove (UserID, x, y) {
    
    //GameID.Board.History.append(color, x, y);
    
    //calculate pieces taken and other changes to the board.
    
    //GameID.Board.CurrentState.makemove(color, x, y);
    
  }
    
  checkMove (GameID, UserID, x, y) {
    //GAME LOGIC, THIS IS FOR GABRIEL;
    //return true;
    //return false;
  }
  
  
}

module.exports = Game;