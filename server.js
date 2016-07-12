//-----------------------------------------------------------------------------
//     INCLUDES
//-----------------------------------------------------------------------------

var Server = require('./src/Server');

var express = require('express');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var developmentMode = process.env.NODE_ENV !== 'production';

// Inject live reload before the static files if applicable
if (developmentMode) {
	app.use(require('connect-livereload')({
    port: 35729
  }));
}

app.use(express.static('public'));


const port = process.env.PORT || 3000;


//-----------------------------------------------------------------------------
//     CONNECTIONS
//-----------------------------------------------------------------------------

io.on('connection', socket => {
  console.log('a user connected');
  
  socket.on('disconnect', () =>{
    console.log('user disconnected');
  });
});

// Development mode live reload
if (developmentMode) {

	require('express-livereload')(app);
}

console.log("Running in " + (developmentMode ? "development" : "production") + " mode");

http.listen(port, () => console.log('listening on *:' + port));


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