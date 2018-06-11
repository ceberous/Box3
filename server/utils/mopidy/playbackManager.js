const RU = require( "../redis_Utils.js" );
const RC = require( "../../CONSTANTS/redis.js" ).MOPIDY;
const mopidy = require( "../../mopidyManager.js" ).mopidy;
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

const R_BASE = "MOPIDY.";
const x1 = "testing";

function STOP() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.stop().then( async function ( something ) {
				await RU.setKey( RC.STATE , "STOPPED" );
				resolve("success");
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function PLAY() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.play().then( async function ( something ) {
				await RU.setKey( RC.STATE , "PLAYING" );				
				resolve("success");
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function PAUSE() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.getState().then( async function ( state ) {
				if ( state === "paused" ) {
					await RESUME();
				}
				else {
					mopidy.playback.pause().then( async function ( something ) {
						await RU.setKey( RC.STATE , "PAUSED" );
						resolve("success");
					});
				}
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function RESUME() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.resume().then( async function ( something ) {
				await RU.setKey( RC.STATE , "PLAYING" );
				resolve("success");
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function NEXT() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.next().then( function ( something ) {
				resolve("success");
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function PREVIOUS() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.previous().then( function ( something ) {
				resolve("success");
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function GET_CURRENT_TRACK_INDEX() {
	return new Promise( function( resolve , reject ) {
		try { mopidy.tracklist.index( {} ).then( function( data ) { resolve( data ); }).catch( function( wERR ) { /*console.log( error );*/ } ); }
		catch( error ) { /*console.log( error );*/ /* reject( error ); */ }
	});
}

function GET_CURRENT_TRACK() {
	return new Promise( function( resolve , reject ) {
		if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
		try {
			mopidy.playback.getCurrentTrack()
			.then( function ( wTrack ) { resolve( wTrack ); } )
			.catch( function( wERR ) { reject( wERR ); } );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function GET_STATE() {
	return new Promise( function( resolve , reject ) {
		try {
			mopidy.playback.getState().then( async function ( state ) {
				if ( !state ) { state = "UNKNOWN"; }
				if ( state.length < 3 ) { state = "UNKNOWN"; }
				else { state = state.toUpperCase(); }
				console.log( "STATE = " + state );
				await RU.setKey( RC.STATE , state );
				resolve( state );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await sleep( 1000 );
			console.log( await GET_STATE() );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;
module.exports.getState = GET_STATE;
module.exports.play = PLAY;
module.exports.getCurrentTrackIndex = GET_CURRENT_TRACK_INDEX;
module.exports.getCurrentTrack = GET_CURRENT_TRACK;
module.exports.previous = PREVIOUS;
module.exports.next = NEXT;
module.exports.pause = PAUSE;
module.exports.resume = RESUME;
module.exports.stop = STOP;