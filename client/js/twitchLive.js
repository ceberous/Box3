function startPlayer() {
	var xWidth = $( window ).width();
	var xHeight = ( xWidth / 2 );
	var xOptions = {
		width: xWidth ,
		height: xHeight ,
		channel: LIVE_USERS[0] ,
		chat: "default" ,
		layout: "video-and-chat" ,
		allowfullscreen: true ,
		autoplay: true ,
		muted: false ,
	};

	
	TWITCH_PLAYER = new Twitch.Player( "addTwitchPlayerHere" , xOptions );
	TWITCH_PLAYER.addEventListener( "online" , function () {
		console.log( "Player ONLINE !!!" );
		//socket.send( "twitchLiveStatus" , "online" );
	});
	TWITCH_PLAYER.addEventListener( "offline" , function () {
		console.log( "Player OFFLINE !!!" );
		//socket.send( "twitchLiveStatus" , "offline" );
	});
	TWITCH_PLAYER.addEventListener( "ready" , function () {
		console.log( "Player READY !!!" );
	});
	TWITCH_PLAYER.addEventListener( "ended" , function () {
		console.log( "Player ENDED !!!" );
		//socket.send( "twitchLiveStatus" , "ended" );
	});
	TWITCH_PLAYER.addEventListener( "play" , function () {
		console.log( "Player PLAY !!!" );
		//if ( !FULL_SCREEN ) { socket.emit( "twitchReadyForFullScreenGlitch" ); FULL_SCREEN = true; }
		$( ".player-button.player-button--fullscreen.js-control-fullscreen" ).click();
		//socket.send( "twitchLiveStatus" , "playing" );
	});
	TWITCH_PLAYER.addEventListener( "pause" , function () {
		console.log( "Player PAUSE !!!" );
		//socket.send( "twitchLiveStatus" , "paused" );
	});	
	//player.setVolume( 0.5 );
}
function setNewChannel( wChannelName ) { TWITCH_PLAYER.setChannel( wChannelName ); }
function setNewVideo( wVideoID ) { TWITCH_PLAYER.setVideo( wVideoID ); }

var FULL_SCREEN = false;
var TWITCH_PLAYER = null;
var LIVE_USERS = null;
var LIVE_USERS_INDEX = 0;

// https://dev.twitch.tv/docs/embed
// https://dev.twitch.tv/docs/embed#embedding-everything

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
		setTimeout( function() {
			socket.send( JSON.stringify( { message: "twitchReadyForFullScreenGlitch" } ) );
		} , 30000 );
	};

	socket.onmessage = function ( message ) {
		var x1 = JSON.parse( message.data );
		console.log( x1 );
		switch( x1.message ) {
			case "ping":
				socket.send( JSON.stringify( { message: "pong" } ) );
				break;
			case "TwitchLiveForeground":
				LIVE_USERS = x1.playlist;
				console.log( LIVE_USERS );
				startPlayer();
				break;
			case "twitchLiveNewChannel":
				LIVE_USERS_INDEX += 1;
				if ( LIVE_USERS_INDEX === LIVE_USERS.length ) { LIVE_USERS_INDEX = 0; }
				setNewChannel( LIVE_USERS[ LIVE_USERS_INDEX ] );
				break;
			case "twitchLiveNewVideo":
				setNewVideo( x1.options );
				break;
			case "pause":
				if ( TWITCH_PLAYER.isPaused() ) {
					TWITCH_PLAYER.play();
				}
				else {
					TWITCH_PLAYER.pause();
				}
				break;
			case "shutdown":
				TWITCH_PLAYER.pause();
				//YTIFrameManager.wPlayer.destroy();
				break;
			default:
				break;
		}
	};

	socket.onerror = function (error) {
		console.log( "WebSocket error: " + error);
	};		

});