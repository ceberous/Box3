var process = require("process");

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var MPlayer = require("mplayer");

var player = new MPlayer();;
player.setOptions({
    cache: 512,
    cacheMin: 1
});

var LPT = 0; // Latest Played Time
player.openFile( process.env.mplayerFP );

player.on( "status" , function( wStatus ) {
	process.send( { status: wStatus } );
});

player.on( "time" , function( wTime ) {
	LPT = wTime;
	process.send( { time: wTime } );
});

var BECAUSE_OF_PAUSE_COMMAND = false;
player.on( "stop" ,  function( wTime ) {
	triggerQuit();
});

async function triggerQuit() {
    // player.player.cmd('quit');
	process.send( { ended: "UNREF_ME" , time: LPT } );
	await sleep( 2000 );
	process.exit(0);
}

process.on( "message" , function( wData ) {
	//console.log( "FROM_PARENT = " + wData );
	var x = wData.split("/");
	switch( x[0] ) {
		case "quit":
			triggerQuit();
			break;
		case "pause":
			if ( player.status.playing ) { player.pause(); }
			else { player.play(); }
			break;
		case "stop":
			//process.send( { time: wTime } );
			player.stop();
			break;
		case "seekSeconds":
			player.seek( x[1] );
			break;
		case "seekPercent":
			player.seekPercent( x[1] );
			break;
		case "hideSubtitles":
			player.hideSubtitles();
			break;
		case "fullscreen":
			player.fullscreen();
			break;
		default:
			break;						
	}
});