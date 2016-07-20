"use strict";
var uuid = require('node-uuid');
var GameData = require('./GameData');
var Board = require('./Board');

class Game {

  // Takes two player guids and generates game data
  constructor(inPlayerOne, inGameType, inBoardSize, inDesiredColour) {

    //How is GameID generated? Is it just the number of games + 1?
    var gameID = uuid.v4();

    this.playerOne = inPlayerOne; // This object has access to the socket
    this.playerTwo = undefined;

    this.playerOne.activeGame = gameID;
    this.playerOne.colour = inDesiredColour;

    if (inGameType === "AI") {

      this.playerTwo = {
        id: "AI",
        colour: this.getOppositeColour(inDesiredColour),
        activeGame: gameID
      };
    } else if(inGameType === "Hotseat") {

      this.playerTwo = {
        id: "Hotseat",
        colour: this.getOppositeColour(inDesiredColour),
        activeGame: gameID
      }
    }

    // Need to remove the socket before it gets serialized to the game data
    this.gameData = new GameData(gameID, Object.assign({}, inPlayerOne, { socket: undefined }), this.playerTwo, [], parseInt(inBoardSize), inGameType);
  }
  
  getOppositeColour(colour) {

    return colour === "White" ? "Black" : "White";
  }

  // Determine which colour is allowed to move next
  getNextMovingPlayerColour() {

    // black moves first
    if (this.gameData.history.length === 0) {
      return "Black";
    }

    // Take the last move played and return the opposite colour
    return this.gameData.history[this.gameData.history.length - 1].colour === "White" ? "Black" : "White";
  }

  getCanPlayMove(user, x, y) {

    let canPlayMove = false;

    // Check correct coloured player is performing the move
    const nextColour = this.getNextMovingPlayerColour();

    if (user.id === this.playerOne.id && this.playerOne.colour === nextColour) {
      canPlayMove = true;
    } else if(user.id === this.playerTwo.id && this.playerTwo.colour === nextColour) {
      canPlayMove = true;
    }

    // Check actual move
    if (!this.checkMove(user, x, y)) {
      canPlayMove = false;
    }

    return canPlayMove;
  }

  playMove(user, x, y) {

    // Make sure there is a second player
    if (!this.playerTwo) {
      return;
    }

    if (this.getCanPlayMove(user, x, y) === false) {
      return;
    }

    this.gameData.history.push({colour: user.colour, x, y});

    this.playerOne.socket.emit('showMove', user.colour, x, y);

    if (this.playerTwo.id !== "AI" && this.playerOne.id !== this.playerTwo.id) {
      this.playerTwo.socket.emit('showMove', user.colour, x, y);
    } else if (this.playerTwo.id === "AI") {

      // If player made a valid move, now the AI needs to perform a move
    }
    
    //calculate pieces taken and other changes to the board.
    
    //GameID.Board.CurrentState.makemove(color, x, y);
  }
    
  addPlayer(inPlayerTwo) {

    this.playerTwo = inPlayerTwo;

    this.playerTwo.activeGame = this.gameData.gameID;
    this.playerTwo.colour = getOppositeColour(this.playerOne.colour);

    // Need to remove the socket before it gets serialized to the game data
    this.gameData.playerTwo = Object.assign({}, inPlayerTwo, { socket: undefined });

    this.playerOne.socket.emit('playerJoined', this.gameData);
    this.playerTwo.socket.emit('joinGame', this.gameData);
  }

  // Check actual board x/y coordinates + other logic
  // Verify there isn't already a piece there, etc
  checkMove(user, x, y) {
    //if too far off the board
	if (x > this.GameData.boardSize || y > this.GameData.boardSize) {
		return false;
	}
	
	board = new Board(this.gameData.history);
	
	//if move is surrounded
	//if (board.currentState[x+1][y] == 0) 
	

    return true;
  }
  
}

module.exports = Game;
