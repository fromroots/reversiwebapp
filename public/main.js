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


//$('#messages').append('<h2>'+ username + '</h2>');


var chat_room="one room";


/****connect to socket server */

var socket = io.connect();
socket.on('log',function(array){
   console.log.apply(console,array);
});

socket.on('join_room_response',function(payload){
     if(payload.result == 'fail')
     {
         alert(payload.message);
         return;
     }
     $('#messages').append('<p>New user joined the room:'+payload.username+'</p>');
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
    $('#messages1').append('<p><b>'+payload.username+'says:</b>'+payload.message+'</p>');
});



$(function(){
    var payload= {};
    payload.room=chat_room;
    payload.username=username;

    console.log('**** client log message: \'join_room\'payload:'+JSON.stringify(payload));
  
   socket.emit('join_room',payload);
});




