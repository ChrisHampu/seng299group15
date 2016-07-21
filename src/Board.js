"use strict";

class Board {

  // THIS BUILDS THE BOARD STATE BY EXECUTING THE MOVES IN TURN.
  // HISTORY IS COPIED OVER, and CURRENT STATE IS BUILT.

  // @param: A valid history object, or no parameter to create a blank state
  constructor (inHistory){

    // Array of moves, rather than linked list, due to milestone 3 feedback.
    this.history = inHistory || [];

    // two dimensional array of integers for pieces on the board.
    // 0 indicates an empty square,
    // 1 indicates a black piece,
    // 2 indicates a white piece.
    this.currentState = [];

	//build the board array
    for (var i = 0; i < this.history.length; i++) {
		//this.playMove(this.currentState, this.history[i].x, this.history[i].y, this.history[i].colour)
    }
	
	
  }
  
  //now plays moves
  playMove(inBoardState, x, y, colour) {
	inBoardState[x][y] == colour;
	
	var offColour = "";
	if (colour == "White")
		offColour = "Black";
	if (colour == "Black")
		offColour = "White";
	
	if (!Game.checkLiberties(inBoardState, x, y-1, offColour))
		inBoardState[x][y-1] = 0;
	if (!Game.checkLiberties(inBoardState, x+1, y, offColour))
		inBoardState[x+1][y] = 0;
	if (!Game.checkLiberties(inBoardState, x-1, y, offColour))
		inBoardState[x-1][y] = 0;
	if (!Game.checkLiberties(inBoardState, x, y+1, offColour))
		inBoardState[x][y+1] = 0;
  }
  
  convertToInteger(inBoardState) {
	state = [];
	for (var i = 0; i < inBoardState.length; i++) {
		for (var j = 0; j < inBoardState[i].length; j++) {
			if (inBoardState[i][j] == "Black") {
				state[i][j] = 1;
			}
			if (inBoardState[i][j] == "White") {
				state[i][j] = 2;
			}
			else {
				state[i][j] = 0;
			}
		}
	}
	return state;
  }
  
}

module.exports = Board;