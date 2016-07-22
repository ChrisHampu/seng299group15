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

    return canPlayMove;
  }

  playMove(user, x, y, pass) {

    // Make sure there is a second player
    if (!this.playerTwo) {
      return;
    }

    // Basic checks; is player the right colour, etc
    if (this.getCanPlayMove(user, x, y, pass) === false) {
      return;
    }

    // Hot seat game play needs to alternate colours
    const newColour = this.gameData.gameType !== "Hotseat" ? user.colour : this.getNextMovingPlayerColour();
	
    // The state to send to the client
    let newState = null;

    if (!pass) {
	
      // Perform move will do the move and return a new board state
      // If the move is invalid, it'll return the current board state
      newState = this.performMove(user, x, y, pass);  
    } else {
	
      // If there's a pass, simply send the client the current board state
      const oldBoard = new Board(this.gameData.history, this.gameData.boardSize);
      newState = oldBoard.currentState;
    }

    console.log("Points for", newColour, this.countPoints(newState, newColour));

    // Send client new board state, colour of user moving, and the pass state
    this.playerOne.socket.emit('showBoard', newState, newColour, pass);

    // If this is a network game, send move the player 2
    if (this.gameData.gameType === "Network") {
      this.playerTwo.socket.emit('showBoard', newState, newColour, pass);
	 
    // If this is an AI game, get a new move from the AI and send it to player
    } else if (this.playerTwo.id === "AI") {

      // If player made a valid move, now the AI needs to perform a move
      this.getNextMoveFromAI(move => {
        
        this.gameData.history.push({colour: move.c === 1 ? "Black" : "White", x: move.x, y: move.y, pass: move.pass});

        const newBoard = new Board(this.gameData.history, this.gameData.boardSize);

        this.playerOne.socket.emit('showBoard', newBoard.currentState, move.pass);
      });
    }
  }

  getNextMoveFromAI(callback) {

    var tmpBoard = new Board(this.gameData.history, this.gameData.boardSize);
    var aiBoard = tmpBoard.convertToInteger();

    var lastMove = this.gameData.history[this.gameData.history.length - 1];

    var body = {
      size: this.gameData.boardSize,
      board: aiBoard,
      last: {
        x: lastMove.x,
        y: lastMove.y,
        c: lastMove.colour === "White" ? 2 : 1,
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

  performMove(user, x, y, pass) {
    
    //if too far off the board
  	if (x < 0 || x > this.gameData.boardSize || y < 0 || y > this.gameData.boardSize) {
  		return false;
  	}
  	
    let duplicated = true;
    let moveValid = true;
    const newColour = this.gameData.gameType !== "Hotseat" ? user.colour : this.getNextMovingPlayerColour();
    
    // Create board with current history
    let board = new Board(this.gameData.history, this.gameData.boardSize);
  	// Use it to check that the spot isn't taken
  	if (board.currentState[x][y] != 0) {
      console.log("spot is taken");
  		return board.currentState;
  	}
	
    // Push new move and construct new board state; army capture will be calculated
    this.gameData.history.push({colour: newColour, x, y, pass});	
    board = new Board(this.gameData.history, this.gameData.boardSize);

  	// Check if move is surrounded
  	if (!board.checkLiberties(x,y,this.getNextMovingPlayerColour() === "White" ? "Black" : "White")) {
      console.log("no liberties");
  		moveValid = false;
  	}
  	
    // Construct board state back 3 moves and use it to check for duplicate moves
  	let oldBoard = new Board(this.gameData.history.slice(0, this.gameData.history.length - 3), this.gameData.boardSize);
  	    
  	//if oldBoard == newBoard, return false
  	//checking that move doesnt recreate past board state
  	for (var i = 0; i < this.gameData.boardSize; i++) {
  		for (var j = 0; j < this.gameData.boardSize; j++) {
  			if (oldBoard.currentState[i][j] != board.currentState[i][j]) {
  				duplicated = false;
  			}
  		}
  	}

    if (this.gameData.history.length > 2 && duplicated === true) {
      console.log("move duplicated");
      moveValid = false;
    }

    // If move is invalid, restore previous board history
    if (!moveValid) {
      console.log("Returning old state");
	  
      this.gameData.history.pop();
    }

    // Return a new board state
    return new Board(this.gameData.history, this.gameData.boardSize).currentState;
  }
  
  //inColour can be either White or Black
  //returns the score only for the colour counted
  countPoints(inBoardState, inColour) {
  	
    console.log("reached count points");
    
  	var score = 0;
    
    console.log(inColour, "is inColour");
 

  	var otherColour = this.getOppositeColour(inColour);
    
    console.log(otherColour, "is otherColour");
  		

    
    console.log ("first for", inBoardState.length);
    console.log ("second for", inBoardState/*[x]*/.length);
    console.log("gamedata boardsize", this.gameData.boardSize);
  	
  	for (var x = 0; x < inBoardState.length; x++) {
  		for (var y = 0; y < inBoardState/*[x]*/.length; y++) {
      
        //var otherBoardState = inBoardState.slice(0);
        
        var otherBoardState = new Array(this.gameData.boardSize);
      
        for (var counter1 = 0; counter1 < inBoardState.length; counter1++){
          otherBoardState[counter1] = new Array(this.gameData.boardSize);
          for (var counter2 = 0; counter2 < inBoardState[counter1].length; counter2++){
            otherBoardState[counter1][counter2] = inBoardState[counter1][counter2];
         }        
        }
        
        console.log("at point", x, ",", y);

    			//the slot is filled with the same colour, add 1 to score
  			if (inBoardState[x][y] == inColour) {
          console.log("token present");
  				score++;
          


    			//check if the territory belongs to the same colour
  			} else if (this.checkTerritoryRecursive(otherBoardState, x, y, otherColour)) {
  				score++;
  			}
         console.log("end loop 2");
  		}
      console.log("end loop 1");
	  }
    return score;
  }
  
  //checks that a single point does not connect to any pieces from inColour
  //effectively checking territory for the opposite colour
  //returns true if the colour is present, false otherwise
  //RETURNS TRUE IF COMPLETELY BOUNDED BY INCOLOUR AND NO OTHERS.
  checkTerritoryRecursive(inBoardState, x, y, inColour) {
  
  //console.log(inBoardState);
  
  console.log("at point", x, ",", y);
  console.log("calculating ", inColour);
 	
    if (x < 0 || x > this.gameData.boardSize - 1 || y < 0 || y > this.gameData.boardSize - 1) {
      console.log("out of board", x, y);
      return true;
    } 

   	//already been checked
   	if (inBoardState[x][y] == "Checked") {
      console.log("already checked");
   		return true;
    }
  	
  	//found the colour
  	if (inBoardState[x][y] != inColour) {
      //console.log("Score plus 1");
      //one edge is correct colour.
      console.log("found op edge");
  		return false;
  	}
    
    if (inBoardState[x][y] == inColour){
      console.log("found own edge");
      return true;
    }
    
    inBoardState[x][y] = "Checked";

    console.log("-----right before-----");
    if (inBoardState[x][y] == 0) {
      if (this.checkTerritoryRecursive(inBoardState, x, y-1, inColour) && this.checkTerritoryRecursive(inBoardState, x-1, y, inColour) 
      && this.checkTerritoryRecursive(inBoardState, x+1, y, inColour) && this.checkTerritoryRecursive(inBoardState, x, y+1, inColour))
      {
        return true;
      }
    }
    
    /*
    console.log ("passed 1");
    if (y-1 >= 0 && this.checkTerritoryRecursive(inBoardState, x, y-1, inColour)) {
      console.log("y-1", y-1);

  		return true;
  	}

    console.log ("passed 2");
    if (x-1 >= 0 && this.checkTerritoryRecursive(inBoardState, x-1, y, inColour)) {
      console.log("x-1", x-1);

  		return true;
  	}

    console.log ("passed 3");
    if (x+1 < inBoardState.length - 1 && this.checkTerritoryRecursive(inBoardState, x+1, y, inColour)) {
      console.log("x+1", x+1);
  		return true;
  	}

    console.log ("passed 4");
    if (y+1 < inBoardState.length - 1 && this.checkTerritoryRecursive(inBoardState, x, y+1, inColour)) {
        console.log("y+1", y+1);
  		return true;
  	}
  	console.log ("passed 5"); */
    
  	//could not find the colour
  	inBoardState[x][y] = "Checked";
    console.log("Not found");
  	return false;
  }
  
}

module.exports = Game;
