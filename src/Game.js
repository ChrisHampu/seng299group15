"use strict"; 

var GameData = require('./GameData');

class Game {

  // Takes two player guids and generates game data
  constructor(inPlayerOne, inPlayerTwo){

    //How is GameID generated? Is it just the number of games + 1?
    var gameID = 0;

    this.gameData = new GameData(gameID, inPlayerOne, inPlayerTwo)
  }
}