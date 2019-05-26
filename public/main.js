/********** retruns value of the url parameter */

function getUrlParams(urlParams)
{
   var pageUrl=window.location.search.substring(1);
   var pageUrlvariables=pageUrl.split('&');
   for(var i=0;i<pageUrlvariables.length;i++)
   {
       var paramName=pageUrlvariables[i].split('=');
       if(paramName[0] == urlParams)
       {
           return paramName[1];
       }
   }
}


var username=getUrlParams('username');

if('undefined' == typeof username || !username)
{
    username='Anonymous_'+Math.random();
}





var chat_room = getUrlParams('game_id');
if('undefined' == typeof chat_room || !chat_room)
{
    chat_room='lobby';
}


/****connect to socket server */

var socket = io.connect();

/*****what server when sends me a log message */
socket.on('log',function(array){
   console.log.apply(console,array);
});


/*  what server when sends responds that someone joined the room */
socket.on('join_room_response',function(payload){
     if(payload.result == 'fail')
     {
         alert(payload.message);
         return;
     }
     /* if we are being notified that we joined the room then ignore it */
     if(payload.socket_id == socket.id)
     {
         return;
     }

/* if someone joined then add a new row to the lobby table */
var dom_elements=$('.socket_'+payload.socket_id);
 
/* if we don't already have an entry for this person */
if(dom_elements.length == 0)
{
    var nodeA = $('<div></div>');
    nodeA.addClass('socket_'+payload.socket_id);

    var nodeB = $('<div></div>');
    nodeB.addClass('socket_'+payload.socket_id);

    var nodeC = $('<div></div>');
    nodeC.addClass('socket_'+payload.socket_id);


    nodeA.addClass('w-100');

    nodeB.addClass('col-9 text-right');
    nodeB.append('<h4>'+payload.username+'</h4>');

    nodeC.addClass('col-3 text-left');
    var buttonC = makeInviteButton();
    nodeC.append(buttonC);

    nodeA.hide();
    nodeB.hide();
    nodeC.hide();
  $('#players').append(nodeA,nodeB,nodeC);
  nodeA.slideDown(100);
  nodeB.slideDown(100);
  nodeC.slideDown(100);
}
else
{
   var buttonC=makeInviteButton();
   $('.socket_'+payload.socket_id+' button').replaceWith(buttonC);
   dom_elements.slideDown(1000);
}


     
/**manage the message that new player has joined */
var newHTML ='<p>'+payload.username+' just entered the lobby</p>';
var newNode =$(newHTML);
newNode.hide();
$('#messages').append(newNode);
newNode.slideDown(1000);
});


/*****what server when sends responds that someone left the room */
socket.on('player_disconnected',function(payload){
    if(payload.result == 'fail')
    {
        alert(payload.message);
        return;
    }
    /* if we are being notified that we left the room then ignore it */
    if(payload.socket_id == socket.id)
    {
        return;
    }

/* if someone left then animate all their content */
var dom_elements=$('.socket_'+payload.socket_id);



/* if something exits */
if(dom_elements.length != 0)
{
    dom_elements.slideUp(1000);
}

    
/**manage the message that new player has joined */
var newHTML ='<p>'+payload.username+' has left the lobby</p>';
var newNode =$(newHTML);
newNode.hide();
$('#messages').append(newNode);
newNode.slideDown(1000);
});

function send_message()
{
    var payload= {};
    payload.room=chat_room;
    payload.username=username;
    payload.message = $('#send_message_holder').val();
    console.log('**** client log message:\'send_message\' \'payload:'+JSON.stringify(payload));
   socket.emit('send_message',payload);

}
socket.on('send_message_response',function(payload){
    if(payload.result == 'fail')
    {
        alert(payload.message);
        return;
    }
    $('#messages').append('<p><b>'+payload.username+'&nbsp;&nbsp;says:&nbsp;&nbsp;</b>'+payload.message+'</p>');
});

function makeInviteButton()
{
    var newHTML='<button type=\'button\' class=\'btn btn-primary\'>Invite</button>';
    var newNode=$(newHTML);
    return(newNode);
}



$(function(){
    var payload= {};
    payload.room=chat_room;
    payload.username=username;

    console.log('**** client log message: \'join_room\'payload:'+JSON.stringify(payload));
  
   socket.emit('join_room',payload);
});




