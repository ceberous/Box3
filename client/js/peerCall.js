
function startCall( wURL ) {
	var fURL = "https://peercalls.com/call/" + wURL;
	console.log( "Started Call @@@ " + fURL );
	var wThis = $( window );
	var wIF = document.getElementById( "peerCallIFrame" ); 
	wIF.height = wThis.height();
	wIF.width = wThis.width();
	wIF.src = fURL;
}

var socket = null;
var webSocketConnectionString = "ws://" + socketServerAddress + ":" + socketPORT;
$(document).ready( function() {

	socket = new WebSocket( webSocketConnectionString );

	socket.onopen = function () {
		console.log( socket.id );
		$("#wPlaceHolder").hide();
		socket.send( "pong" );
	};

	socket.onmessage = function ( message ) {
		var x1 = JSON.parse( message.data );
		console.log( x1 );
		switch( x1.message ) {
			case "ping":
				socket.send( "pong" );
				break;
			case "PeerCall":
				startCall( x1.url );
				break;						
			case "shutdown":
				break;
			default:
				break;
		}
	};

	socket.onerror = function (error) {
		console.log( "WebSocket error: " + error);
	};

});