
const mongodb = require('mongodb');
let mongoClient = mongodb.MongoClient;

class Database {

  constructor () { 

    this.gameCache = [];
    
	this.collections = new Map();

	mongoClient.connect("mongodb://localhost:27017", (err, db) => {
	
		this.database = db;
	
		if(err) {
			console.log(err);
			process.exit();
		}
		
		this.getCollection(db, "users", col => {
			this.collections.set("users", col);
		});
		
		this.getCollection(db, "games", col => {
			this.collections.set("games", col);
		});
	});
  }
  
	getCollection(db, name, cb) {
		
		db.collection(name, (err, col) => {
			
			if (err) {
				
				db.createCollection(name).then((err, res) => {
					
					cb(db.collection(name));
				});
			} else {
				cb(col);
			}
		});
	}
  /*
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
	*/
  
	addToCache(game) {
	
		this.gameCache.push(game);
	}
	
	removeFromCache(gameID) {
	
		let gameIndex = this.gameCache.find(el => el.gameID === gameID);
		
		if (gameIndex !== -1) {
			
			this.gameCache.splice(gameIndex, 1);
		}
	}
  
  getGamesFromPlayer(userID, callback) {
	  
	this.collections.get("games").find({"userID":userID}).limit(1).next((err, doc) => {
	
		console.log(err);
		console.log(doc);
		
		callback(doc || { gameID ,});
	});
	  
  }
  
  loadAllGames(callback) {
	  this.collections.get("games").find({}).limit(1).next((err, doc) => {
	
		console.log(err);
		console.log(doc);
		
		let game = doc || { gameID };
		this.gameCache.push(game);
		
		callback(game);
	});
  }
  
  storeAllGames() {
	for (var i=0; i< this.gameCache.length; i++) {
		this.storeGame(this.gameCache[i]);
	}
  }
  
  loadUser(userID,callback) {
  
 	this.collections.get("users").find({userID}).limit(1).next((err, doc) => {
	
		console.log(err);
		console.log(doc);
		
		callback(doc || { userID, numGamesPlayed: 0,  });
	});
 
  }
  
  saveUser(user) {
  
  	this.collections.get("users").save(
  		{"userID": user.userID, "fullName" : user.fullName, "numGamesPlayed" : user.numGamesPlayed}
  	)
  }
  
  removeGame() {
  }
  
  storeGame(game) {
	this.collections.get("games").save(
  		{"gameID": game.gameData.gameID , 
		"playerOne" : game.gameData.playerOne, 
		"playerTwo" : game.gameData.playerTwo,
		"history" : game.gameData.history,
		"boardSize" : game.gameData.boardSize,
		"gameType" : game.gameData.gameType
		}
  	)
  }
}

module.exports = Database;
