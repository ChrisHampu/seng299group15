"use strict"; 

var Game = require('./Game');

class Server {

  // The number of games is just the array size of 'allGames'
  //var NumberOfGames;    //integer
  
  constructor() {
    
    this.allGames = [];
  }

  createGame (player1, player2) { //Passing the player guids.
    //this.NumberOfGames ++;       //increment number of games.

    this.allGames.push(new Game(player1, player2)); //Store game reference in server.
    
    //update players?
    
    UpdatePlayers(); //?
  }
  
  checkMove (GameID, UserID, x, y) {
    //GAME LOGIC, THIS IS FOR GABRIEL;
    //return true;
    //return false;
  }
  
  playMove (GameID, UserID, x, y) {
    
    //GameID.Board.History.append(color, x, y);
    
    //calculate pieces taken and other changes to the board.
    
    //GameID.Board.CurrentState.makemove(color, x, y);
    
  }
  
  updatePlayers (GameID) {
    var game = this.allGames[GameID];
    
    //IF HOTSEAT PLAY, SEND
    
    //ELSE UPDATE PERSON WHO JUST PLAYED
    
      //IF AI MAKES NEXT MOVE
      
      //ELSE NETWORKED PLAYER MAKES NEXT MOVE
    
  }
}

module.exports = Server;