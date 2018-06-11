
var YTIFrameManager = {

	"wPlayer" : null,
	"playlist" : null,
	"usingPlaylist": false,
	"muted": true,

	init: function() {
		console.log( "inside init()" );
		//YTIFrameManager.playlist = YTIFrameManager.buildPlaylistArray( true );
		if ( YTIFrameManager.playlist.length > 1 ) { YTIFrameManager.usingPlaylist = true; }
		YTIFrameManager.showVideo();
		//if ( nextVideoTime > 0 ) { YTIFrameManager.startNextVideoInterval(); }

	},

	buildPlaylistArray: function( extraRandom ) {

		function extraShuffle(wArr) {
			var cIDX = wArr.length , wTmp , rIDX;
			while ( 0 !== cIDX ) {
		    	rIDX = Math.floor( Math.random() * cIDX );
		    	cIDX = cIDX - 1;
		    	wTmp = wArr[cIDX];
		    	wArr[ cIDX ] = wArr[ rIDX ];
			    wArr[ rIDX ] = wTmp;
		  	}
			return wArr;
		}
		var wPlaylist = [];
		if ( extraRandom === true ) { wPlaylist = extraShuffle( YTIFrameManager.playlist ); wPlaylist = extraShuffle( YTIFrameManager.playlist ); }
		return wPlaylist;

	},

	tearDown: function() {
		YTIFrameManager.wPlayer.destroy();
		setTimeout(function(){
			YTIFrameManager.wPlayer = null;
			//socket.emit('player closed');
		} , 1000 );
	},

	showVideo: function(wVideo) {

		if ( !wVideo ){ var wVideo = { id: "o2Qmc8Sb6Ws" }; } 

		var wThis = $(window);
		var wOptions = { version: 3 , height: wThis.height() , width: wThis.width() , videoId: YTIFrameManager.playlist[0] , loop: 1 };
		wOptions.events = {
			'onReady': YTIFrameManager.onPlayerReady,
			'onStateChange': YTIFrameManager.onPlayerStateChange,
			'onError': YTIFrameManager.errorHandler,
		};

		YTIFrameManager.wPlayer = new YT.Player( 'player', wOptions );

	},

	errorHandler: function(event) {
		console.log( "error = " + event.data.toString() );
	},

	onPlayerStateChange: function(event) {
		var wID = YTIFrameManager.wPlayer.getVideoUrl().split("https://www.youtube.com/watch?v=")[1];
		switch ( event.data ) {
			case -1:
				console.log(" video is unstarted ");
				//socket.send( "youtubeLiveStatus" , { status: "unstarted" , id: wID } );
				break;
			case 0:
				console.log(" video is over ");
				socket.send( JSON.stringify( { message: "YTStandardVideoOver" } ) );
				//socket.send( "youtubeLiveStatus" , { status: "over" , id: wID } );
				break;
			case 1:
				console.log(" video is now playing ");
				//socket.send( "youtubeLiveStatus" , { status: "playing" , id: wID } );
				break;
			case 2:
				console.log(" video is paused ");
				socket.send( "youtubeLiveStatus" , { status: "paused" , id: wID } );
				break;
			case 3:
				console.log(" video is buffering ");
				//socket.emit( "youtubeLiveStatus" , { status: "buffering" , id: wID } );
				break;
			case 5:
				console.log(" new video is cued ");
				//socket.emit( "youtubeLiveStatus" , { status: "cued" , id: wID } );
				break;
		}
	},

	onPlayerReady: function(event) {
		console.log("player is supposedly ready");
		if ( YTIFrameManager.usingPlaylist ) { 
			YTIFrameManager.wPlayer.cuePlaylist( YTIFrameManager.playlist );
		}
		setTimeout( function() {
			//YTIFrameManager.wPlayer.setShuffle( true );
			//YTIFrameManager.wPlayer.setLoop(true);
			//if ( YTIFrameManager.muted ) { YTIFrameManager.wPlayer.mute(); }
			//socket.send( "youtubeReadyForFullScreenGlitch" );
			socket.send( JSON.stringify( { message: "youtubeReadyForFullScreenGlitch" } ) );
			//$( ".ytp-fullscreen-button.ytp-button" ).click();
		} , 1000 );
	},

	startNextVideoInterval: function() {
		setInterval( function() {
			YTIFrameManager.wPlayer.nextVideo();
		} , nextVideoTime );	

	},

};

var socket = null;
var webSocketConnectionString = "ws://" + socketServerAddress + ":" + socketPORT;
var nextVideoTime = null;

function waitForYoutubeReady( x1 ) {
	function readyYoutube(){
		if( ( typeof YT !== "undefined" ) && YT && YT.Player ) {
			nextVideoTime = x1.nextVideoTime;
			YTIFrameManager.playlist = x1.playlist;;
			YTIFrameManager.init();
		}
		else{ setTimeout( readyYoutube , 100 ); }
	}
	readyYoutube();
}
$(document).ready( function() {

	$("#addPlayerHere").append( "<div id='player'></div>" );

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
			case "YTStandardForeground":
				waitForYoutubeReady( x1 );
				break;
			case "pause":
				var cur_state = parseInt( YTIFrameManager.wPlayer.getPlayerState() );
				if ( cur_state === 2 ) {
					YTIFrameManager.wPlayer.playVideo();
				}
				else {
					YTIFrameManager.wPlayer.pauseVideo();
				}
				break;				
			case "next":
				console.log( "next video === " + x1.options );
				YTIFrameManager.wPlayer.loadVideoById( x1.options );
				break;
			case "previous":
				YTIFrameManager.wPlayer.previousVideo();
				break;				
			case "shutdown":
				YTIFrameManager.wPlayer.destroy();
				break;
			default:
				break;
		}
	};

	socket.onerror = function (error) {
		console.log( "WebSocket error: " + error);
	};	

});