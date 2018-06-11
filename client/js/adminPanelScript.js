
// https://github.com/kristoferjoseph/flexboxgrid

const ROW_VIEW_MAP = {
	basePath: "../views/admin_panel/",
	views: {
		"#musicRow": { htmlPath: "musicRow.html" , updateFN: musicRowViewUpdate },
		"#musicPlaylistRow": { htmlPath: "musicPlaylistRow.html" , updateFN: musicPlaylistRowViewUpdate },
		"#liveVideoRow": { htmlPath: "liveVideoRow.html" , updateFN: liveVideoRowViewUpdate },
		"#followerVideoRow": { htmlPath: "followerVideoRow.html" , updateFN: followerVideoRowViewUpdate },
		"#savedVideoRow": { htmlPath: "savedVideoRow.html" , updateFN: savedVideoRowViewUpdate },
		"#skypeRow": { htmlPath: "skypeRow.html" , updateFN: skypeRowViewUpdate },
		"#audioBookRow": { htmlPath: "audioBookRow.html" , updateFN: audioBookRowViewUpdate },
		"#nowPlayingRow": { htmlPath: "nowPlayingRow.html" , updateFN: nowPlayingRowViewUpdate },
	}
};

var ACTIVE_ROW = null;
function destroyActiveRow() {
	return new Promise( function( resolve , reject ) {
		try {
			$("#wChildView").remove(); ACTIVE_ROW = null;
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
async function loadViewRow( viewName ) {
	await destroyActiveRow();
	$("#workingRow").append("<div id=wChildView></div>");
	console.log( "Loading --> " + ROW_VIEW_MAP.basePath + ROW_VIEW_MAP[ "views" ][ viewName ].htmlPath );
	$("#workingRow").load( ROW_VIEW_MAP.basePath + ROW_VIEW_MAP[ "views" ][ viewName ].htmlPath , function() {
		ACTIVE_ROW = viewName;
		ROW_VIEW_MAP.views[ viewName  ].updateFN();
	});
}

var wLS = null;

var socket = null;
var sockIOConnectionString = socketIOServerAddress + ":" + socketIOPORT;
$(document).ready(function() {

    socket = io.connect( sockIOConnectionString );
	socket.on( "newConnection" , function ( data ) {
		console.log( data.message );
		wLS = data.status;
		loadViewRow( "#nowPlayingRow" );
	});

	socket.on( "controlStatusUpdate" , function ( data ) {
		wLS = data;
		console.log( wLS );
		if ( ACTIVE_ROW === "#nowPlayingRow" ) { ROW_VIEW_MAP.views[ "#nowPlayingRow"  ].updateFN( wLS ); }
	});

	// Menu Button 
	$("[data-toggle=offcanvas]").click( function() {
		$(".row-offcanvas").toggleClass( "active" );
	});

	// Home Button
	$("#homeButton").click( function() {
		$(".row-offcanvas").removeClass( "active" );
		loadViewRow( "#nowPlayingRow" );
	});


	// View-Switcher Buttons
	// ------------------------------------------------------
	// ------------------------------------------------------
	$("#switchNowPlaying").on( "click" , function() {
		$(".row-offcanvas").toggleClass("active");
		loadViewRow( "#nowPlayingRow" );
	});

	$("#switchMusic").on( "click" , function() {
		$(".row-offcanvas").toggleClass("active");
		loadViewRow( "#musicRow" );
	});

	$("#switchLiveVideo").on( "click" , function() {
		$(".row-offcanvas").toggleClass("active");
		loadViewRow( "#liveVideoRow" );
	});

	$("#switchFollowingVideo").on( "click" , function() {
		$(".row-offcanvas").toggleClass("active");
		loadViewRow( "#followerVideoRow" );
	});

	$("#switchSavedVideo").on( "click" , function() {
		$(".row-offcanvas").toggleClass("active");
		loadViewRow( "#savedVideoRow" );
	});

	$("#switchSkype").on( "click" , function() {
		$(".row-offcanvas").toggleClass("active");
		loadViewRow( "#skypeRow" );
	});

	$("#switchAudioBook").on( "click" , function() {
		$(".row-offcanvas").toggleClass("active");
		loadViewRow( "#audioBookRow" );
	});
	// ------------------------------------------------------
	// ------------------------------------------------------

});