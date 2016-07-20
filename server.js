//-----------------------------------------------------------------------------
//     INCLUDES
//-----------------------------------------------------------------------------
"use strict";

var stackTrace = require('stack-trace');
var Server = new (require('./src/Server'));
var express = require('express')
var app = express();
var http = require('http').Server(app);
var database = new (require('./src/Database'));

var io = require('socket.io')(http);
var ios = require('socket.io-express-session');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Configuration
const port = process.env.PORT || 3000;
const developmentMode = process.env.NODE_ENV !== 'production';
const googleClientID = process.env.GOOGLE_CLIENT_ID || "1042858849145-hqg47cutf9jdgb7u1c373q433bhsui8f.apps.googleusercontent.com";
const googleSecret = process.env.GOOGLE_SECRET || "Ri-TWGe7QTl4qEBRmnvg0M6z";
const googleCallback = process.env.GOOGLE_CALLBACK || `http://localhost:${port}/auth/callback`;
const sessionSecret = process.env.SESSION_SECRET || "Seng299Group15";

var session = require('express-session')({ secret: 'sessionSecret', resave: true, saveUninitialized: true });

// Passport configuration
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// Inject live reload before the static files if applicable

if (developmentMode) {

	app.use(require('connect-livereload')({
    port: 35729
  }));
}

// Root endpoint

app.get('/', (req, res, err) => {

	if (!req.isAuthenticated()) {

		res.sendFile('public/login.html', { root: __dirname });
	} else {

		res.sendFile('public/index.html', { root: __dirname });
	}
});

// Public folder

app.use(express.static('public'));

// Authentication

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

try {
	passport.use(new GoogleStrategy({
	    clientID: googleClientID,
	    clientSecret: googleSecret,
	    callbackURL: googleCallback
	  },
	  (accessToken, refreshToken, profile, done) => {

		database.loadUser(profile.id, (doc) => {
		
			done(null, { numGamesPlayed: doc.numGamesPlayed, fullName: profile.displayName, profilePicture: profile._json.image.url });
		});
	  
	  	// The database will need to be called here to retrieve/save the users info
	  	//done(null, { id : profile.id, l });
	  }
	));

} catch(err) {
	console.log(err);
	console.log("Google OAuth is not configured properly, therefore authentication will not work.");
}

app.get('/auth',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }
));

app.get('/auth/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {

  	// Save resulting user into session data
  	req.session.user = req.user;

    res.redirect('/');
	}
);

app.get('/logout', (req, res, err) => {

  req.logout();

  res.redirect('/');
});

//-----------------------------------------------------------------------------
//     CONNECTIONS
//-----------------------------------------------------------------------------

io.use(ios(session));

io.on('connection', socket => {

	const user = Object.assign({}, socket.handshake.session.user, { socket });

  if (socket.handshake.session.user) {

  	console.log(user.fullName + " connected");

    socket.emit('connected', socket.handshake.session.user);

    socket.on('error', err => {

      console.log(stackTrace.parse(err)[0]);

      console.log('Socket error: ', err);
    });

  	// This function runs when the client sends a 'createGame' message
  	socket.on('createGame', (gameType, boardSize, colour) => {

  		Server.createGame(user, gameType, boardSize, colour);
    });

  	socket.on('joinGame', id => {

          Server.joinGame(user, id);
      });
  	
  	socket.on('playMove', (userID, x, y) => {
  	
  		Server.playMove(userID, x, y);
  	});
  	
  	socket.on('passMove', (gameID, userID) => {
  	
  		Server.passMove(userID, gameID);
  	});

  } else {
		console.log("Unauthenticated user connected");
	}

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Development mode live reload
if (developmentMode) {

	require('express-livereload')(app);
}

console.log("Running in " + (developmentMode ? "development" : "production") + " mode");

http.listen(port, () => console.log('listening on *:' + port));


//when server closes, save all games
process.on('SIGINT', function() {
	console.log("storing all games");
	database.storeAllGames();
	
	process.exit();
});


//-------------------- AI communication
/*
req = http.request(options, callback);

var postData = {
	"size" : size,
	"board" : board,
	"last" : lastMove
}

req.write (JSON.stringify (postData));

req.end();
*/

			// var options = {
			// host: 'roberts.seng.uvic.ca',
			// path: '/ai/random',
			// port: '30000',
			// method: 'POST',
			// headers : {'Content-Type': 'application/json'}
	
			// };
		
			// var callback = function(response){
	
			// var str = '';
	
			// response.on('data', function(chunk){
				// str += chunk.toString();
			// })
		
			// response.on('end', function(){
				// console.log(str);
				// console.log('no more data');
			
				// console.log ("returning string " + str);
				// cb (JSON.parse(str));
			
			// })

/* Chris' AI implementation (requires node-fetch package)

    var body = {
    	size: size,
    	board: board,
    	last: lastMove
    };

    fetch('http://roberts.seng.uvic.ca:30000/ai/random', { method: "POST", 'Content-Type': 'application/json', body } )
    .then(res => {
    	return res.json();
    }).then(json => {

    	cb(json);
    });
*/
