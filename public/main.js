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
    var buttonC = makeInviteButton(payload.socket_id);
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
   uninvite(payload.socket_id);
   var buttonC=makeInviteButton(payload.socket_id);
   $('.socket_'+payload.socket_id+' button').replaceWith(buttonC);
   dom_elements.slideDown(1000);
}


     
/**manage the message that new player has joined */
var newHTML ='<p>'+payload.username+' just entered the room</p>';
var newNode =$(newHTML);
newNode.hide();
$('#messages').prepend(newNode);
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
$('#messages').prepend(newNode);
newNode.slideDown(1000);
});


/* send a invite message to the server */
function invite(who)
{
    var payload={};
    payload.requested_user=who;

    console.log('*** Ciient log messsage:\'invite\' payload:'+JSON.stringify(payload));
    socket.emit('invite',payload);
}


socket.on('invite_response',function(payload){
    if(payload.result == 'fail')
    { 
        alert(payload.message);
        return;
    }
    var newNode = makeInvitedButton(payload.socket_id);
    console.log("hello"+newNode);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

socket.on('invited',function(payload){
    if(payload.result == 'fail')
    {
        alert(payload.message);
        return;
    }
    var newNode = makePlayButton(payload.socket_id);
    
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});



/* send a uninvite message to the server */
function uninvite(who)
{
    var payload={};
    payload.requested_user=who;

    console.log('*** Ciient log messsage:\'uninvite\' payload:'+JSON.stringify(payload));
    socket.emit('uninvite',payload);
}


socket.on('uninvite_response',function(payload){
    if(payload.result == 'fail')
    { 
        alert(payload.message);
        return;
    }
    var newNode = makeInviteButton(payload.socket_id);
    console.log("hello"+newNode);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

socket.on('uninvited',function(payload){
    if(payload.result == 'fail')
    {
        alert(payload.message);
        return;
    }
    var newNode = makeInviteButton(payload.socket_id);
    
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});



/* send a game start message to the server */
function game_start(who)
{
    var payload={};
    payload.requested_user=who;

    console.log('*** Ciient log messsage:\'game_start\' payload:'+JSON.stringify(payload));
    socket.emit('game_start',payload);
}


socket.on('game_start_response',function(payload){
    if(payload.result == 'fail')
    {
        alert(payload.message);
        return;
    }
    var newNode = makeEngagedButton(payload.socket_id);
    
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);

    /* jump to a new page */
    window.location.href = 'game.html?username='+username+'&game_id='+payload.game_id;

});





function send_message()
{
    var payload= {};
    payload.room=chat_room;
    payload.message = $('#send_message_holder').val();
    console.log('**** client log message:\'send_message\' \'payload:'+JSON.stringify(payload));
    socket.emit('send_message',payload);
    $('#send_message_holder').val('');

}
socket.on('send_message_response',function(payload){
    if(payload.result == 'fail')
    {
        alert(payload.message);
        return;
    }
    var newHTML = '<p><b>'+payload.username+'&nbsp;&nbsp;says:&nbsp;&nbsp;</b>'+payload.message+'</p>';
    var newNode=$(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);
});

function makeInviteButton(socket_id)
{
    var newHTML='<button type=\'button\' class=\'btn btn-primary\'>Invite</button>';
    var newNode=$(newHTML);
    newNode.click(function(){
    invite(socket_id);
    });
    return(newNode);
}

function makeInvitedButton(socket_id)
{
    var newHTML='<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
    var newNode=$(newHTML);
    newNode.click(function(){
        uninvite(socket_id);
        });
    return(newNode);
}

function makePlayButton(socket_id)
{
    var newHTML='<button type=\'button\' class=\'btn btn-success\'>Play</button>';
    var newNode=$(newHTML);
    newNode.click(function(){
        game_start(socket_id);
        });
    return(newNode);
}

function makeEngagedButton()
{
    var newHTML='<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
    var newNode=$(newHTML);
    return(newNode);
}


$(function(){
    var payload= {};
    payload.room=chat_room;
    payload.username=username;

    console.log('**** client log message: \'join_room\'payload:'+JSON.stringify(payload));
  
   socket.emit('join_room',payload);

   $('#quit').append('<a href="lobby.html?username='+username+'" class="btn btn-danger btn-default active" role="button" aria-pressed="true">Quit</a>');


});


var old_board = [
               ['?','?','?','?','?','?','?','?'],
               ['?','?','?','?','?','?','?','?'],
               ['?','?','?','?','?','?','?','?'],
               ['?','?','?','?','?','?','?','?'],
               ['?','?','?','?','?','?','?','?'],
               ['?','?','?','?','?','?','?','?'],
               ['?','?','?','?','?','?','?','?'],
               ['?','?','?','?','?','?','?','?']
];
var my_color = ' ';

socket.on('game_update',function(payload)
{
    console.log('**** client log message: \'game_update\'\n\tpayload:'+JSON.stringify(payload));

    /*  check for a good board upda*/
    if(payload.result == 'fail')
    {
        console.log(payload.message);
        window.location.href = 'lobby.html?username='+username;
        return;
    }
    /* check for good board in the payload */
    var board = payload.game.board;
    if('undefined' == typeof board || !board)
    {
        console.log('internal error:received a malfubction board update from the server');
        return;
    }
    /* update my color */
    if(socket.id == payload.game.player_white.socket)
    {
        my_color='white';
    }
    else if(socket.id == payload.game.player_black.socket)
    {
        my_color ='black';
    }
    else
    {
        window.location.href='lobby.html?username='+username;
        return;
    }
    $('#my_color').html('<h3 id="my_color">I am ' +my_color+'</h3>');
    $('#my_color').append('<h4>Its '+payload.game.whose_turn+'\s turn</h4>');

    /* animate changes to the board */
    var blacksum=0;
    var whitesum=0;
     var row,column;
     for(row=0;row<8;row++){
         for(column = 0; column < 8 ; column++)
         {
             if(board[row][column] == 'b'){
                 blacksum++;
             }
             if(board[row][column] == 'w'){
                whitesum++;
            }
             /* if a board space has changed  */
             if(old_board[row][column] != board[row][column])
             {
                 if(old_board[row][column] == '?' && board[row][column] == ' ')
                 {
                     $('#'+row+'_'+column).html('<img src="assets/images/empty.png" alt="empty square" />');
                 }
             else if(old_board[row][column] == '?' && board[row][column] == 'w')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/empty_to_white.gif" alt="white square" />');
                }
                else if(old_board[row][column] == '?' && board[row][column] == 'b')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/empty_to_black.gif" alt="black square" />');
                }
                else if(old_board[row][column] == ' ' && board[row][column] == 'w')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/empty_to_white.gif" alt="white square" />');
                }
                else if(old_board[row][column] == ' ' && board[row][column] == 'b')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/empty_to_black.gif" alt="black square" />');
                }
                else if(old_board[row][column] == 'w' && board[row][column] == ' ')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/white_to_empty.gif" alt="empty square" />');
                }
                else if(old_board[row][column] == 'b' && board[row][column] == ' ')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/black_to_white.gif" alt="empty square" />');
                }
                else if(old_board[row][column] == 'w' && board[row][column] == 'b')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/white_to_black.gif" alt="black square" />');
                }
                else if(old_board[row][column] == 'b' && board[row][column] == 'w')
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/black_to_white.gif" alt="white square" />');
                }
                else
                {
                    $('#'+row+'_'+column).html('<img src="assets/images/error.gif" alt="error" />');
                }
               /* set up interactivity  */
               $('#'+row+'_'+column).off('click');
               if(board[row][column] == ' ')
               {
                   $('#'+row+'_'+column).addClass('hovered_over');
                   $('#'+row+'_'+column).click(function(r,c){
                              return function(){
                                 var payload ={};
                                 payload.row =r;
                                 payload.column=c;
                                 payload.color=my_color;
                                 console.log('*** client log message \'play_token\' payload'+JSON.stringify(payload));
                                 socket.emit('play_token',payload);
                              };
                   }(row,column));
               }
                else
                {
                    $('#'+row+'_'+column).removeClass('hovered_over');
                }
         }
        }
     }
     $('#blacksum').html(blacksum);
     $('#whitesum').html(whitesum);
     old_board= board;
});

socket.on('play_token_response',function(payload)
{
        console.log('*** client log message\'play_token_response\'\n\tpayload:'+JSON.stringify(payload));
        /* check for a good play token response */
        if(payload.result == 'fail'){
            console.log(payload.message);
            alert(payload.message);
            return;
        }
});

socket.on('game_over',function(payload)
{
        console.log('*** client log message\'game over\'\n\tpayload:'+JSON.stringify(payload));
        /* check for a good play token response */
        if(payload.result == 'fail'){
            console.log(payload.message);
            return;
        }
        /* jump to a new page */
        $('#game_over').html('<h1>Game over</h1><h2>'+payload.who_won+' won!</h2>');
        $('#game_over').append('<a href="lobby.html?username='+username+'" class="btn btn-primary btn-large active" role="button" aria-pressed="true">Return to the Lobby</a>')
});
