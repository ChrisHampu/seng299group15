"use strict";

const fetch = require('simple-fetch').postJson;
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

  getCanPlayMove(user, x, y, pass) {

    let canPlayMove = false;

    // Check correct coloured player is performing the move
    const nextColour = this.getNextMovingPlayerColour();

    // Hot seat games don't need to verify the current player colour; its the same player
    if (this.gameData.gameType !== "Hotseat") {

      if (user.colour === nextColour) {
        canPlayMove = true;
      }
    } else {
      canPlayMove = true;
    }

    // Check actual move
    if (!pass && !this.checkMove(user, x, y)) {
      canPlayMove = false;
    }

    return canPlayMove;
  }

  playMove(user, x, y, pass) {

    // Make sure there is a second player
    if (!this.playerTwo) {
      return;
    }

    if (this.getCanPlayMove(user, x, y, pass) === false) {
      return;
    }

    const newColour = this.gameData.gameType !== "Hotseat" ? user.colour : this.getNextMovingPlayerColour();

    this.gameData.history.push({colour: newColour, x, y, pass});

    // Hot seat game play needs to alternate colours
    this.playerOne.socket.emit('showMove', newColour, x, y, pass);

    if (this.gameData.gameType !== "Hotseat" && this.playerTwo.id !== "AI") {
      this.playerTwo.socket.emit('showMove', newColour, x, y, pass);
    } else if (this.playerTwo.id === "AI") {
      
		  var tmpBoard = new Board(this.gameData.history);

      // If player made a valid move, now the AI needs to perform a move
      this.getNextMoveFromAI(move => {
        
        this.gameData.history.push({colour: move.c === 1 ? "White" : "Black", x: move.x, y: move.y});
        this.playerOne.socket.emit('showMove', move.c === 1 ? "White" : "Black", move.x, move.y);
      });
    }
    
    //calculate pieces taken and other changes to the board.
    
  }

  getNextMoveFromAI(callback) {

    var dummy = [];

    for (var i = 0; i < this.gameData.boardSize; i++) {

      var dummy2 = [];

      for (var j = 0; j < this.gameData.boardSize; j++) {
        dummy2.push(0);
      }

      dummy.push(dummy2);
    }

    dummy[0][0] = 2;

    var body = {
      size: this.gameData.boardSize,
      board: dummy,
      last: {
        x: 0,
        y: 0,
        c: 2,
        pass: false
      }
    };

    fetch('http://roberts.seng.uvic.ca:30000/ai/random', body)
    .then(json => {

      callback(json);
    });
  }
    
  addPlayer(inPlayerTwo) {

    this.playerTwo = inPlayerTwo;

    this.playerTwo.activeGame = this.gameData.gameID;
    this.playerTwo.colour = this.getOppositeColour(this.playerOne.colour);

    // Need to remove the socket before it gets serialized to the game data
    this.gameData.playerTwo = Object.assign({}, inPlayerTwo, { socket: undefined });

    this.playerOne.socket.emit('playerJoined', this.gameData.playerTwo);
    this.playerTwo.socket.emit('joinGame', this.gameData, this.gameData.playerTwo, this.gameData.playerOne);
  }

  // Check actual board x/y coordinates + other logic
  // Verify there isn't already a piece there, etc
  //returns true for valid move, false otherwise
  checkMove(user, x, y) {
    //if too far off the board
    /*
  	if (x > this.gameData.boardSize || y > this.gameData.boardSize) {
  		return false;
  	}
  	
    let board = new Board(this.gameData.history);
  	
  	//if spot is taken
  	if (board.currentState[x][y] != 0) {
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
  	for (var i =0; i < board.length; i++) {
  		for (var j =0; j < board[i].length; j++) {
  			if (oldBoard[i][j] != board[i][j]) {
  				return false;
  			}
  		}
  	}
    */
	
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
	if (x+1 < inBoardState.length) {
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
  
  //inColour can be either White or Black
  //returns the score only for the colour counted
  countPoints(inBoardState, inColour) {
  	
  	var score = 0;
  	if (inColour == "Black")
  		var otherColour = "White";
  	else
  		var otherColour = "Black";
  		
  	var otherBoardState = inBoardState;
  	
  	for (var x = 0; x < inBoardState[].length; x++) {
  		for (var x = 0; x < inBoardState[].length; x++) {
  			//the slot is filled with the same colour, add 1 to score
			if (inBoardState[x][y] == inColour) {
				score++;
  			//check if the territory belongs to the same colour
			} else if (!checkColourRecursive(otherBoardState, x, y, otherColour)) {
				score++;
			}
  		}
	}	
  }
  
  //checks that a single point does not connect to any pieces from inColour
  //effectively checking territory for the opposite colour
  //returns true if the colour is present, false otherwise
  checkTerritoryRecursive(inBoardState, x, y, inColour) {
 	
 	//already been checked
 	if (inBoardState[x][y] == "Checked")
 		return false;
  	
  	//found the colour
  	if (inBoardState[x][y] == inColour) {
		inBoardState[x][y] = "Checked";
  		return true;
  	} else if (y-1 >= 0 && checkTerritoryRecursive(inBoardState, x, y-1, inColour)) {
  		return true;
  	} else if (x-1 >= 0 && checkTerritoryRecursive(inBoardState, x-1, y, inColour)) {
  		return true;
  	} else if (x+1 < inBoardState[].length && checkTerritoryRecursive(inBoardState, x+1, y, inColour)) {
  		return true;
  	} else if (y+1 < inBoardState[].length && checkTerritoryRecursive(inBoardState, x, y+1, inColour)) {
  		return true;
  	}
  	
  	//could not find the colour
  	inBoardState[x][y] = "Checked";
  	return false;
  	
  }
  
}

module.exports = Game;
