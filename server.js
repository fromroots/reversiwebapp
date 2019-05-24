/*****include static file webserver *******/
var static = require('node-static');

/**** include http server****/
var http = require('http');

/***** assume on heroku *****/
var port = process.env.PORT;
var directory = __dirname + '/public';

/******* if not on  heroku ****/
if(typeof port == 'undefined' || !port)
{
	directory = './public';
	port = 8080;
}

/***** set up a static web server *****/

var file = new static.Server(directory);

/***** construct an http server that gets files from server ***/

var app = http.createServer(
	function(request,response){
		request.addListener('end',
			function()
			{
				file.serve(request,response);
			}
			).resume();
	}
	).listen(port);
 
 console.log('the server is running');

 /******set up the web socket **********/
 var io = require('socket.io').listen(app);
 io.sockets.on('connection',function(socket){
	 function log(){
		 var array = ['***server log message: '];
		 for(var i=0;i<arguments.length;i++)
		 {
			 array.push(arguments[i]);
			 console.log(arguments[i]);
		 }
		 socket.emit('log',array);
		 socket.broadcast.emit('log',array);
	 }
		 log('A web site connected to the server');

	 socket.on('disconnect',function(socket){
		log('A web site disconnected from the server');
	});
 }
 );