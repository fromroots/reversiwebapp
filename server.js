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

/*    join_room command.room username*/ 
	socket.on('join_room',function(payload){
		log('server received a command','join_room',payload);

if('undefined' ==typeof payload || !payload)
{
	var error_messsage ='join_room had no payload,command aborted';
	log(error.message);
	socket.emit('join_room_response',{
		   result:'fail',
		   message:error_messsage
	});
	return;
}
var room=payload.room;
if('undefined' ==typeof room || !room)
{
	var error_messsage ='join_room didn\'t specify a room,command aborted';
	log(error.message);
	socket.emit('join_room_response',{
		   result:'fail',
		   message:error_messsage
	});
	return;
}

var username=payload.username;
if('undefined' ==typeof username || !username)
{
	var error_messsage ='join_room didn\'t specify a username,command aborted';
	log(error.message);
	socket.emit('join_room_response',{
		   result:'fail',
		   message:error_messsage
	});
	return;
}
socket.join(room);
	
var roomObject= io.sockets.adapter.rooms[room];
if('undefined' ==typeof roomObject || !roomObject)
{
	var error_messsage ='join_room could not create a room(internal error),command aborted';
	log(error.message);
	socket.emit('join_room_response',{
		   result:'fail',
		   message:error_messsage
	});
	return;
}
var numClients=roomObject.length;
var success_data={
	  result:'success',
	  room:room,
	  username:username,
	  membership:[numClients+1]

};
io.sockets.in(room).emit('join_room_response',success_data);
log('Room'+room+'was just joined by'+username);



});

/***send message coomand */

socket.on('send_message',function(payload){
	log('server received a command','send_message',payload);

if('undefined' ==typeof payload || !payload)
{
var error_messsage ='send_message had no payload,command aborted';
log(error.message);
socket.emit('send_message_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}
var room=payload.room;
if('undefined' ==typeof room || !room)
{
var error_messsage ='send_message didn\'t specify a room,command aborted';
log(error.message);
socket.emit('send_message_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var username=payload.username;
if('undefined' ==typeof username || !username)
{
var error_messsage ='send_message didn\'t specify a username,command aborted';
log(error.message);
socket.emit('send_message_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var message=payload.message;
if('undefined' ==typeof message || !message)
{
var error_messsage ='send_message didn\'t specify a username,command aborted';
log(error.message);
socket.emit('send_message_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var success_data={
	result:'success',
	room:room,
	username:username,
	message:message   
};

io.sockets.in(room).emit('send_message_response',success_data);
log('message sent to room'+room+'by'+username);
});

 
});