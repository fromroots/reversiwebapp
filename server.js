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
