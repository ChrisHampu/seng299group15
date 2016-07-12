class UserData {

  constructor(inUserID, inFullName, inEmail, inNumPlayed, inActiveGames) {

    this.userID = inUserID || "";
    this.fullName = inFullName || "";
    this.email = inEmail || "";
    this.numGamesPlayed = inNumPlayed || 0;
    this.activeGames = inActiveGames || [];
  }
}