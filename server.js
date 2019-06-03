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


 /* registry of socket_ids***/


 /******set up the web socket **********/

 /* registry of socket_ids and player information***/
var players=[];

 var io = require('socket.io').listen(app);
 io.sockets.on('connection',function(socket){

	log('Client connection by'+socket.id);

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
		 

	 

/*    join_room command.room username*/ 
	socket.on('join_room',function(payload){
		log('\"join_room\" command'+JSON.stringify(payload));
/*** check that the client sent a playload */
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
/* check that payload has a room to join */
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

/* a username hasbeen provided */
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

/* store information about this new player */
players[socket.id]={};
players[socket.id].username=username;
players[socket.id].room=room;

/* actually have the user join the room */
socket.join(room);
	
/* get the room object */
var roomObject= io.sockets.adapter.rooms[room];

/* tell everyone that already in room that someone just joined the room */
var numClients=roomObject.length;
var success_data={
	  result:'success',
	  room:room,
	  username:username,
	  socket_id:socket.id,
	  membership:numClients

};
io.in(room).emit('join_room_response',success_data);

for(var socket_in_room in roomObject.sockets)
{
	var success_data={
		result:'success',
		room:room,
		username:players[socket_in_room].username,
		socket_id:socket_in_room,
		membership:numClients
  
  };
  socket.emit('join_room_response',success_data);
}
log('join_room success');


if(room !== 'lobby')
{
	send_game_update(socket,room,'initial update');
}
});

socket.on('disconnect',function(){
	log('client disconnected'+JSON.stringify(players[socket.id]));
	if('undefined' !== typeof players[socket.id] && players[socket.id])
	{
		var username=players[socket.id].username;
		var room =players[socket.id].room;
		var payload ={
			username:username,
			socket_id:socket.id
		};
		delete players[socket.id];
		io.in(room).emit('player_disconnected',payload);
	}

});

/***send message command */

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

var username=players[socket.id].username;
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

io.in(room).emit('send_message_response',success_data);
log('message sent to room'+room+'by'+username);

});


/***invite command */

socket.on('invite',function(payload){
	log('invite with'+JSON.stringify(payload));

if('undefined' === typeof payload || !payload)
{
var error_messsage ='invite had no payload,command aborted';
log(error.message);
socket.emit('invite_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

/* check that message can be traced to a username */
var username=players[socket.id].username;
if('undefined' === typeof username || !username)
{
var error_messsage ='invite can\'t identify who sent the message';
log(error.message);
socket.emit('invite_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var requested_user=payload.requested_user;
if('undefined' ==typeof requested_user || !requested_user)
{
var error_messsage ='invite didn\'t specify a username,command aborted';
log(error.message);
socket.emit('invite_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}


var room= players[socket.id].room;
var roomObject =io.sockets.adapter.rooms[room];
/* make sure that user being is in the room */
if(!roomObject.sockets.hasOwnProperty(requested_user) )
{
	var error_messsage ='invite requested a user that wasn\'t in the room,command aborted';
	log(error.message);
	socket.emit('invite_response',{
		   result:'fail',
		   message:error_messsage
});
return;
}

/* if everything is okay repond to the inviter that it was successful */


var success_data={
	result:'success',
	socket_id:requested_user
};

socket.emit('invite_response',success_data);

/* tell invitee that they have been invited */
var success_data={
	result:'success',
	socket_id:socket.id
};

socket.to(requested_user).emit('invited',success_data);
log('invite successful');


});



/***uninvite command */

socket.on('uninvite',function(payload){
	log('uninvite with'+JSON.stringify(payload));

if('undefined' === typeof payload || !payload)
{
var error_messsage ='uninvite had no payload,command aborted';
log(error.message);
socket.emit('uninvite_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

/* check that message can be traced to a username */
var username=players[socket.id].username;
if('undefined' === typeof username || !username)
{
var error_messsage ='uninvite can\'t identify who sent the message';
log(error.message);
socket.emit('uninvite_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var requested_user=payload.requested_user;
if('undefined' ==typeof requested_user || !requested_user)
{
var error_messsage ='uninvite didn\'t specify a username,command aborted';
log(error.message);
socket.emit('uninvite_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}


var room= players[socket.id].room;
var roomObject =io.sockets.adapter.rooms[room];
/* make sure that user being is in the room */
if(!roomObject.sockets.hasOwnProperty(requested_user) )
{
	var error_messsage ='invite requested a user that wasn\'t in the room,command aborted';
	log(error.message);
	socket.emit('uninvite_response',{
		   result:'fail',
		   message:error_messsage
});
return;
}

/* if everything is okay repond to the uninviter that it was successful */


var success_data={
	result:'success',
	socket_id:requested_user
};

socket.emit('uninvite_response',success_data);

/* tell invitee that they have been invited */
var success_data={
	result:'success',
	socket_id:socket.id
};

socket.to(requested_user).emit('uninvited',success_data);
log('uninvite successful');


});


/* game start command */

socket.on('game_start',function(payload){
	log('game_start with'+JSON.stringify(payload));

if('undefined' === typeof payload || !payload)
{
var error_messsage ='game start had no payload,command aborted';
log(error.message);
socket.emit('game_start_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

/* check that message can be traced to a username */
var username=players[socket.id].username;
if('undefined' === typeof username || !username)
{
var error_messsage ='game start can\'t identify who sent the message';
log(error.message);
socket.emit('game_start_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var requested_user=payload.requested_user;
if('undefined' ==typeof requested_user || !requested_user)
{
var error_messsage ='uninvite didn\'t specify a username,command aborted';
log(error.message);
socket.emit('uninvite_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}


var room= players[socket.id].room;
var roomObject =io.sockets.adapter.rooms[room];
/* make sure that user being is in the room */
if(!roomObject.sockets.hasOwnProperty(requested_user) )
{
	var error_messsage ='game start requested a user that wasn\'t in the room,command aborted';
	log(error.message);
	socket.emit('game_start_response',{
		   result:'fail',
		   message:error_messsage
});
return;
}

/* if everything is okay repond to the uninviter that it was successful */

var game_id=Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
var success_data={
	result:'success',
	socket_id:requested_user,
	game_id:game_id
};

socket.emit('game_start_response',success_data);

/* tell other player to play that they have been invited */
var success_data={
	result:'success',
	socket_id:socket.id,
	game_id:game_id
};

socket.to(requested_user).emit('game_start_response',success_data);
log('game start was  successful');


});

/* play token command */

socket.on('play_token',function(payload){
	log('play_token with'+JSON.stringify(payload));

if('undefined' === typeof payload || !payload)
{
var error_messsage ='play_token had no payload,command aborted';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

/* check that the player has previously registered */
var player=players[socket.id];
if('undefined' === typeof player || !player)
{
var error_messsage ='game start can\'t identify who sent the message';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var username=players[socket.id].username;
if('undefined' === typeof username || !username)
{
var error_messsage ='play token can\'t identify who sent the message';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}

var game_id = players[socket.id].room;
if('undefined' === typeof game_id || !game_id)
{
var error_messsage ='play token can\'t find your game board';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}


var row = payload.row;
if('undefined' === typeof row || row < 0 || row > 7)
{
var error_messsage ='play token didn\'t specify a valid row ,command aborted';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}


var column = payload.column;
if('undefined' === typeof column || column < 0 || column > 7)
{
var error_messsage ='play token didn\'t specify a valid column ,command aborted';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}



var color = payload.color;
if('undefined' === typeof color || !color || (color != 'white' &&  color != 'black'))
{
var error_messsage ='play token didn\'t specify a valid color ,command aborted';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}


var game = games[game_id];
if('undefined' === typeof game || !game)
{
var error_messsage ='play token couldn\'t find your game board';
log(error.message);
socket.emit('play_token_response',{
	   result:'fail',
	   message:error_messsage
});
return;
}


var success_data ={
	result:'success'
};

socket.emit('play_token_response',success_data);

/* execute the move */
if(color == 'white')
{
	game.board[row][column] = 'w';
	game.whose_turn = 'black';
}
else if(color == 'black')
{
	game.board[row][column] = 'b';
	game.whose_turn = 'white';
}

 var d=new Date();
game.last_move_time = d.getTime();

send_game_update(socket,game_id,'played a token');


});

});
/* this code related to game state */

var games=[];

function create_new_game(){
	var new_game={};
	new_game.player_white = {};
	new_game.player_black = {};
	new_game.player_white.socket = '';
	new_game.player_white.username = '';
	new_game.player_black.socket = '';
	new_game.player_black.username = '';
	var d = new Date();
	new_game.last_move_time = d.getTime();
	new_game.whose_turn = 'white';
	new_game.board = [
[' ',' ',' ',' ',' ',' ',' ',' '],
[' ',' ',' ',' ',' ',' ',' ',' '],
[' ',' ',' ',' ',' ',' ',' ',' '],
[' ',' ',' ','w','b',' ',' ',' '],
[' ',' ',' ','b','w',' ',' ',' '],
[' ',' ',' ',' ',' ',' ',' ',' '],
[' ',' ',' ',' ',' ',' ',' ',' '],
[' ',' ',' ',' ',' ',' ',' ',' ']
	];
	return new_game;
}

function send_game_update(socket,game_id,message)
{
	/* check if see if a game with game_id already exists */
   if(('undefined' === typeof games[game_id] ) || !games[game_id])
   {
	 /* no game exist so make one */
	 console.log('no game exists. creating' +game_id+'for '+socket.id);
	 games[game_id]=create_new_game();
   }

	/* make sure that only 2 people are in a game room */
var roomObject;
var numClients;
do{
	roomObject = io.sockets.adapter.rooms[game_id];
	numClients = roomObject.length;
	if(numClients > 2)
	{
		console.log('too many clients in room'+game_id+'#:'+numClients);
		if(games[game_id].player_white.socket == roomObject.sockets[0]){
			games[game_id].player_white.socket='';
			games[game_id].player_white.username='';
		}
		if(games[game_id].player_black.socket == roomObject.sockets[0]){
			games[game_id].player_black.socket='';
			games[game_id].player_black.username='';
		}
		/* kick one of the extra people out */
		var sacrifice = Object.keys(roomObject.sockets)[0];
		io.of('/').connected[sacrifice].leave(game_id);
	
	}

}while((numClients-1) > 2);
	/* assign this socket a color */

	/* if the current player isn't assigned a color */
	if((games[game_id].player_white.socket != socket.id) && (games[game_id].player_black.socket != socket.id))
	{
		console.log('player isn\'t assigned a color:'+socket.id);
		/* and there isn't color to give them */
		if((games[game_id].player_black.socket != '') && (games[game_id].player_white.socket != '')){
		   games[game_id].player_white.socket = '';
		   games[game_id].player_white.username = '';
		   games[game_id].player_black.socket = '';
		   games[game_id].player_black.username = '';
		}
	}
	/* assign colors to the player if not already done */
	if(games[game_id].player_white.socket == '')
	{
		if(games[game_id].player_black.socket != socket.id){
			games[game_id].player_white.socket = socket.id;
			games[game_id].player_white.username = players[socket.id].username;
		}
	}

	if(games[game_id].player_black.socket == '')
	{
		if(games[game_id].player_white.socket != socket.id){
			games[game_id].player_black.socket = socket.id;
			games[game_id].player_black.username = players[socket.id].username;
		}
	}



	/* send game update */
	var success_data ={
		result:'success',
		game:games[game_id],
		message:message,
		game_id:game_id
	};

	io.in(game_id).emit('game_update',success_data);
	/* check to see if the game is over */
	var row,column;
	var count=0;
	for(row=0;row<8;row++)
	{
	for(column=0;column<8;column++)
	  {  
		if(games[game_id].board[row][column] != ' ')
		{
			count++;
		}
	  }
	}
	if(count == 64)
	{
		var success_data ={
			result:'success',
			game:games[game_id],
			who_won:'everyone',
			game_id:game_id
		};
		io.in(game_id).emit('game_over',success_data);

		/* DELTE OLD GAMES AFTER 1 HR */
		setTimeout(function(id){
               return function(){
				   delete games[id];
			   }
		}(game_id),60*60*1000);
	}
}
