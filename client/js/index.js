var viewFiles = {
	path: "../views",
	youtubeLiveBackground: "youtubeLiveBackground.html",
	youtubeLive: "youtubeLive.html",
	youtubeStandard: "youtubeStandard.html",
	twitchLive: "twitchLive.html",
	error: "error.html"
};

function cleanseViews() {
	$(document).trigger( "tearDownPlayer" );
	$("#wChildView").remove();
	$("#wPlaceHolder").show();
}

function addChildView( viewName ) {
	cleanseViews();
	setTimeout( function() {
		$("#wPlaceHolder").hide();	
		$("#vAPP").append("<div id=wChildView></div>");
		$("#wChildView").load( viewFiles.path + "/" + viewName );
	} , 1000 );
}

var socket = null;
var wChildViewActive = false;
var sockIOConnectionString = socketIOServerAddress + ":" + socketIOPORT;
var youtubePlaylist = null;
var nextVideoTime = null;
var twitchPlaylist = null
function wSocketSend( wTaskName ) { socket.emit( wTaskName ); }
$(document).ready( function() {

	socket = io.connect( sockIOConnectionString );
	
	socket.on( 'newConnection' , function ( data ) {
		console.log(socket.id);
		console.log(data.message);
		cleanseViews();
		$("#wPlaceHolder").hide();
		$("#vAPP").append( "<div id=wChildView></div>" );
		$("#wChildView").append( "<p>connected to c&c server @ <a href='" + sockIOConnectionString + "'>" + sockIOConnectionString +"</a> via socket.io</p>" );
		wChildViewActive = true;
		setTimeout( function(){ wSocketSend( "ffViewerReady" ); } , 1000 );
	});

	socket.on( 'MopidyYTLiveBackground' , function( data ) {
		console.log( data );
		nextVideoTime = data.nextVideoTime;
		youtubePlaylist = data.playlist;
		addChildView( viewFiles.youtubeLiveBackground );
	});

	socket.on( 'shutdown' , function( data ) {
		YTIFrameManager.wPlayer.destroy();
	});

});