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

    if (this.history.length) {

      // If this class is passed in a valid history, the board state must be reconstructed here
    }
  }
}

module.exports = Board;