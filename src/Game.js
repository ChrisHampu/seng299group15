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
		var tmpBoard = new Board(this.gameData.history);
		// If player made a valid move, now the AI needs to perform a move
    }
    
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
  //returns true for valid move, false otherwise
  checkMove(user, x, y) {
    //if too far off the board
	if (x > this.gameData.boardSize || y > this.gameData.boardSize) {
		return false;
	}
	
	board = new Board(this.gameData.history);
	
	//if spot is taken
	if (board[x][y] != 0) {
		return false;
	}
	
	Board.playMoveLocal(board, x, y, user.colour);
	
	//if move is surrounded
	if (!checkLiberties(board,x,y,user.colour)) {
		return false;
	}
	
	oldBoard = new Board(this.gameData.history.pop().pop())
	
	//if oldBoard == newBoard, return false
	//checking that move doesnt recreate past board state
	for (var i =0; i < board[].length; i++) {
		for (var j =0; j < board[].length; j++) {
			if (oldBoard[i][j] != board[i][j]) {
				return false;
			}
		}
	}
	
    return true;
  }
  
  
  //returns true for liberty, false otherwise
  checkLiberties(inBoardState, x, y , inColour) {
	//check top
	if (y-1 >= 0) {
		if (inBoardState[x][y-1] == 0) {
			return true;
		} else if (inBoardState[x][y-1] == inColour){
			if (checkLiberties(inBoardState, x, y-1, inColour))
				return true;
		}
	}
	
	//check right
	if (x+1 < inBoardState[].length) {
		if (inBoardState[x+1][y] == 0) {
			return true;
		} else if (inBoardState[x+1][y] == inColour){
			if (checkLiberties(inBoardState, x+1, y, inColour))
				return true;
		}
	}
	
	//check left
	if (x-1 >= 0) {
		if (inBoardState[x-1][y] == 0) {
			return true;
		} else if (inBoardState[x-1][y] == inColour){
			if (checkLiberties(inBoardState, x-1, y, inColour))
				return true;
		}
	}
	
	//check bottom
	if (y+1 < inBoardState.length) {
		if (inBoardState[x][y+1] == 0) {
			return true;
		} else if (inBoardState[x][y+1] == inColour){
			if (checkLiberties(inBoardState, x, y+1, inColour))
				return true;
		}
	}
	
	return false;
  }
  
}

module.exports = Game;
