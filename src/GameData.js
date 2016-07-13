"use strict"; 

class GameData {

  constructor(inGameID, inPlayerOne, inPlayerTwo, inHistory, inBoardSize, inGameType) {

    this.gameID = inGameID || "";
    this.playerOne = inPlayerOne || "";
    this.playerTwo = inPlayerTwo || "";
    this.history = inHistory || [];
    this.boardSize = inBoardSize || 9; //Added due to recommendation from Milestone 3
	this.gameType = inGameType || 'Hotseat';
  }
}

module.exports = GameData;