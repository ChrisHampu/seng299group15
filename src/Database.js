var MongoClient = require("mongodb").MongoClient;

class Database {

  constructor () { 

    this.gameCache = [];
  }
  
      function connect(callback) {
        
        var that = this; 

        MongoClient.connect(
            "mongodb://" + this._host + ":" + this._port + "/" + this._dbname,
            function (err, db) {

                if (err) {
                    console.log("ERROR: Could not connect to database.");
                    that._db = null;
                    callback(err);
                } else {
                    console.log("INFO: Connected to database.");
                    that._db = db;
                    callback(null);
                }

            }
        );
    }
  
  getGamesFromPlayer(userID, callback) {
	  var result_array = [];
	  var result = this._db.collection('games').find({"userID": userID}).toArray(function(err, result_array){
		callback (null, result_array);
		}
	  }
  }
  
  loadAllGames(callback) {
	  var result_array = [];
	  var result = this._db.collection('games').find({})
	  callback
  }
  
  storeAllGames() {
  }
  
  loadUser(userID,callback) {
  	var result = this._db.users.find( { "userID": userID } )
  	callback(result);
  }
  
  saveUser(user,callback) {
  	this._db.users.save(
  		{"userID": user.userID, "fullName" : user.fullName, "numGamesPlayed" : user.numGamesPlayed}
  	)
  }
  
  removeGame() {
  }
  
  storeGame() {
  }
}

module.exports = Database;
