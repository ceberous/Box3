// https://www.jqueryscript.net/slideshow/Simple-Automatic-Image-Video-Slideshow-Plugin-For-jQuery.html
// http://projects.craftedpixelz.co.uk/jqinstapics/
// http://getbootstrap.com/2.3.2/javascript.html#carousel
// https://github.com/achvaicer/slidify
// https://lightwidget.com/

// https://www.instagram.com/developer/embedding/
// https://www.instagram.com/developer/endpoints/

// https://www.instagram.com/developer/authentication/
// https://api.instagram.com/oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=code

// https://github.com/blueimp/Gallery
var WATCHING_MEDIA = null;
var NEXT_TIME = 3000;
var TOTAL = 0;
var REACHED_INDEX_ZERO = 0;
function START_BROWSING() {
	console.log( WATCHING_MEDIA );
	var carouselLinks = [];
	var linksContainer = $('#links');

	for ( var i = 0; i < WATCHING_MEDIA.length; ++i ) {

		if ( WATCHING_MEDIA[ i ][ "is_video" ] ) {
			// Videos go somewhere else ??
			// For some reason this doesn't work
			// carouselLinks.push({
			// 	type: "video/*" , 
			// 	sources: [ { href: WATCHING_MEDIA[ i ][ "display_src" ] , type: "video/mp4" } ] , 
			// 	title: WATCHING_MEDIA[ i ][ "code" ] 
			// });
		}
		else {
            carouselLinks.push({ href: WATCHING_MEDIA[ i ][ "display_src" ] , title: WATCHING_MEDIA[ i ][ "code" ] } );
		}

	}
	TOTAL = carouselLinks.length;
	var gallery = blueimp.Gallery( carouselLinks , {
      container: '#blueimp-image-carousel',
      fullScreen: true ,
      carousel: true ,
      onslideend: function( index , slide ) {
      	console.log( "index === " + index.toString() + " has ended" );
      	if ( index === 0 ) {
      		REACHED_INDEX_ZERO += 1;
      		if ( REACHED_INDEX_ZERO > 1 ) {
      			alert( "we have seen all the stuff" );
      			this.close();
      		}
      	}
      } ,
    });
}

var socket = null;
var webSocketConnectionString = "ws://" + socketServerAddress + ":" + socketPORT;
function wSocketSend( wTaskName ) { socket.emit( wTaskName ); console.log("we told server we are ready"); }
$(document).ready( function() {

	$("#addPlayerHere").append( "<div id='player'></div>" );

	socket = new WebSocket( webSocketConnectionString );

	socket.onopen = function () {
		console.log( socket.id );
		$("#wPlaceHolder").hide();
		socket.send( "pong" );
		// setTimeout( function() {
		// 	socket.send( "twitchReadyForFullScreenGlitch" );
		// } , 30000 );
	};

	socket.onmessage = function ( message ) {
		var x1 = JSON.parse( message.data );
		console.log( x1 );
		switch( x1.message ) {
			case "ping":
				socket.send( JSON.stringify( { message: "pong" } ) );
				break;
			case "Instagram":
				WATCHING_MEDIA = x1.playlist;
				NEXT_TIME = x1.nextMediaTime || NEXT_TIME;
				START_BROWSING();
				break;
			case "pause":
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

    $('#fullscreen-checkbox').on('change', function () {
        $('#blueimp-gallery').data('fullScreen', $(this).is(':checked'));
    });

    $('#image-gallery-button').on('click', function (event) {
        event.preventDefault();
        blueimp.Gallery($('#links a'), $('#blueimp-gallery').data());
    });

});