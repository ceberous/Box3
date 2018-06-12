const wEmitter	= require("../main.js").wEmitter;

const RU = require( "./utils/redis_Utils.js" );
const RC = require( "./CONSTANTS/redis.js" ).MOPIDY;


const colors = require("colors");
const Mopidy = require("mopidy");

// https://github.com/thebigmunch/gmusicapi-scripts

function wcl( wSTR ) { console.log( colors.white.bgBlue( "[MOPIDY_MAN] --> " + wSTR ) ); }
function tryIgnoreError( wFunc ) { try { wFunc(); } catch( error ) { return; } }
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

// Change File --> /usr/local/lib/python2.7/dist-packages/gmusicapi/clients/mobileclient.py
// --> @ Line Number 143
// 		self.android_id = self._validate_device_id(device_id, is_mac=is_mac)
// --> TO:
// 		self.android_id = "VALID_DEVICE_ID"

var mopidy = null;
Mopidy.prototype._handleWebSocketError = async function ( error ) { 
	wcl( "Mopdiy WebSocket ERROR" ); 
	this._cleanup(); 
	this.close(); 
	mopidy.off(); 
	mopidy = null;
	await RU.setKey( "STATUS.MOPIDY" , "OFFLINE" );
	return;
};
function tryToConnectMopidy( wPort ) {
	try {
		mopidy = new Mopidy({ 
			webSocketUrl: "ws://localhost:" + wPort.toString() + "/mopidy/ws/" ,
			autoConnect: true ,
			callingConvention: "by-position-or-by-name"
		});
	} catch( error ) { wcl( "ERROR --> Mopdiy Binary not Running !" ); }
}
tryToConnectMopidy( 6690 );
module.exports.mopidy = mopidy;

mopidy.on( "state:online" , GLOBAL_INITIALIZE );

var LAST_EVENT_TIME = 0;
const EVENT_TIME_EASEMENT = 5000;
const R_LAST_SS_BASE = "LAST_SS.MOPIDY.";
const R_CONTINUOUS_PLAY = R_LAST_SS_BASE + "CONTINUOUS_PLAY";
mopidy.on( "event:trackPlaybackEnded" , async function ( wEvent ) {
	wcl( "PLAYBACK --> ENDED" );
	await sleep( 1000 );
	const time_now = new Date().getTime();
	const wDiff = ( time_now - LAST_EVENT_TIME );
	if ( wDiff < EVENT_TIME_EASEMENT ) {
		LAST_EVENT_TIME = time_now;
		await sleep( EVENT_TIME_EASEMENT );
	}
	else {
		var wCTIDX = await require( "./utils/mopidy/playbackManager.js" ).getCurrentTrackIndex();
		console.log( "PLAYBACK --> CURRENT_INDEX --> " + wCTIDX );
		if ( wCTIDX === null ) {
			var still_live = await RU.getKey( R_CONTINUOUS_PLAY );
			if ( still_live !== null && still_live !== "STOPPED" ) {
				await require( "./utils/mopidy/restartContinousPlay.js" ).restart();
			}
		}
		LAST_EVENT_TIME = time_now;
	}
});

const R_NOW_PLAYING = R_LAST_SS_BASE + "NOW_PLAYING";
mopidy.on( "event:trackPlaybackStarted" , async function ( wEvent ) {
	await sleep( 1000 );
	var wCT = await require( "./utils/mopidy/playbackManager.js" ).getCurrentTrack();
	if ( wCT === null ) { return; }
	await RU.setKey( R_NOW_PLAYING , JSON.stringify( wCT ) );
	console.log("");
	wcl( "PLAYBACK --> STARTED || CURRENT-TRACK --> " );
	wcl( "Title = " + wCT[ "name" ] );
	wcl( "Artist = " + wCT[ "artists" ][0].name );
});

mopidy.on( "event:playbackStateChanged" , async function ( wEvent ) {
	await sleep( 3000 );
	await RU.setKey( RC.STATE , wEvent.new_state.toUpperCase() );
	wcl( "PLAYBACK --> CHANGED --> " );
	console.log( wEvent );
});

function GLOBAL_SHUTDOWN() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( mopidy ) {
				try { await mopidy.playback.stop(); }
				catch(e) {}
				tryIgnoreError( mopidy.close );
				tryIgnoreError( mopidy.off );
			}
			mopidy = null;
			await RU.setKey( RC.STATUS , "OFFLINE" );
			await RU.setKey( RC.STATE , "STOPPED" );
			wcl( "CLOSED" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function GLOBAL_INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "./utils/mopidy/libraryManager.js" ).initialize();
			await require( "./utils/mopidy/playbackManager.js" ).initialize();
			await require( "./utils/mopidy/tracklistManager.js" ).initialize();
			wcl( "CONNECTED !!!" );
			await RU.setKey( RC.STATUS , "ONLINE" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.shutdown = GLOBAL_SHUTDOWN;

// process.on( "SIGINT" , async function () {
// 	wcl( "Shutting Down" );
// 	await GLOBAL_SHUTDOWN();
// 	// await sleep( 1000 );
// 	// process.exit(1);
// });