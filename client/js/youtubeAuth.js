var socket = null;
var webSocketConnectionString = "ws://" + socketServerAddress + ":" + socketPORT;


var AUTH_B1 = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http%3A%2F%2Flocalhost%3A6969%2FyoutubeAuth&response_type=token&client_id=";
function getAuthToken( wClientID ) {
	var url = AUTH_B1 + wClientID;
	console.log( url );

    // var xmlHttp = new XMLHttpRequest();
    // xmlHttp.open( "GET", url , false );
    // xmlHttp.setRequestHeader('Access-Control-Allow-Origin','*' );
    // xmlHttp.send( null );
    // var token = JSON.parse( xmlHttp.responseText );
    // console.log( token );

	var anHttpRequest = new XMLHttpRequest();
	anHttpRequest.onreadystatechange = function() { 
	    if ( anHttpRequest.readyState == 4 && anHttpRequest.status == 200 ) {
		    var token = JSON.parse( xmlHttp.responseText );
		    console.log( token );	        
	    }
	};
	anHttpRequest.open( "GET" , url , true );
	anHttpRequest.setRequestHeader( "Content-Type" , "application/x-www-form-urlencoded; charset=UTF-8" );
	anHttpRequest.setRequestHeader( "Access-Control-Allow-Origin" , "*" );
	anHttpRequest.send( null );
}

$(document).ready( function() {

	console.log( window.location );
	socket = new WebSocket( webSocketConnectionString );

	socket.onopen = function () {
		console.log( socket.id );
		$("#wPlaceHolder").hide();
		socket.send( "pong" );
		if ( window.location.hash ) {
			if ( window.location.hash.length > 3 ) {
				socket.send( JSON.stringify({
					message: "youtubeAuthHash" ,
					location: window.location ,
					hash: window.location.hash
				}));
			}
		}
	};

	socket.onmessage = function ( message ) {
		var x1 = JSON.parse( message.data );
		if ( !x1 ) { return; }
		console.log( x1 );
		switch( x1.message ) {
			case "ping":
				socket.send( "pong" );
				break;
			case "YTGetAuthToken":
				getAuthToken( x1.client_id );
				break;
			default:
				break;
		}
	};

	socket.onerror = function (error) {
		console.log( "WebSocket error: " + error);
	};	

});