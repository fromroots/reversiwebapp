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


$('#messages').append('<h4>'+ username + '</h4>');



var socket=io.connect();
socket.on('log',function(array){
   console.log.apply(console,array);
});