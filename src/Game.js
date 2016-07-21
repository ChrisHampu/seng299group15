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

      // If player made a valid move, now the AI needs to perform a move
      this.getNextMoveFromAI(move => {
        
        this.gameData.history.push({colour: move.c === 1 ? "White" : "Black", x: move.x, y: move.y});
        this.playerOne.socket.emit('showMove', move.c === 1 ? "White" : "Black", move.x, move.y);
      });
    }
    
    //calculate pieces taken and other changes to the board.
    
  }

  getNextMoveFromAI(callback) {

    var tmpBoard = new Board(this.gameData.history, this.gameData.boardSize);

    /*
    var dummy = [];

    for (var i = 0; i < this.gameData.boardSize; i++) {

      var dummy2 = [];

      for (var j = 0; j < this.gameData.boardSize; j++) {
        dummy2.push(0);
      }

      dummy.push(dummy2);
    }

    dummy[0][0] = 2;
    */

    var lastMove = this.gameData.history[this.gameData.history.length - 1];

    var body = {
      size: this.gameData.boardSize,
      board: tmpBoard.currentState,
      last: {
        x: lastMove.x,
        y: lastMove.y,
        c: lastMove.colour === "White" ? 1 : 2,
        pass: lastMove.pass
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
    
  	if (x < 0 || x > this.gameData.boardSize || y < 0 || y > this.gameData.boardSize) {
  		return false;
  	}
  	
    let board = new Board(this.gameData.history, this.gameData.boardSize);
  	
  	//if spot is taken
  	if (board.currentState[x][y] != 0) {
      console.log("spot is taken");
  		return false;
  	}
  	
    // This function doesn't exist?
  	//Board.playMoveLocal(board, x, y, user.colour);
  	
    board.checkCaptures(x, y, this.getNextMovingPlayerColour());

  	//if move is surrounded
  	if (!board.checkLiberties(x,y,this.getNextMovingPlayerColour() === "White" ? "Black" : "White")) {
      console.log("no liberties");
  		return false;
  	}
  	
  	let oldBoard = new Board(this.gameData.history.slice(0, this.gameData.history.length - 3), this.gameData.boardSize);
  	
    let duplicated = true;

  	//if oldBoard == newBoard, return false
  	//checking that move doesnt recreate past board state
  	for (var i =0; i < this.gameData.boardSize; i++) {
  		for (var j = 0; j < this.gameData.boardSize; j++) {
  			if (oldBoard.currentState[i][j] != board.currentState[i][j]) {
  				duplicated = false;
  			}
  		}
  	}

    if (this.gameData.history.length > 2 && duplicated === true) {
      console.log("move duplicated");
      return false;
    }
    
    return true;
  }
  
}

module.exports = Game;
