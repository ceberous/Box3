const wEmitter = require( "../../main.js" ).wEmitter;

// const redis = require( "../../main.js" ).redis;
// const RU = require( "../utils/redis_Utils.js" );
// const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE;

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wOptions.playlist_id ) { resolve( "no playlist given" ); return; }
			await require( "../utils/generic.js" ).setStagedFFClientTask( { message: "YTStandardForeground" , playlist_id: [ wOptions.playlist_id ]  } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeStandard" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "pause" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../firefoxManager.js" ).terminateFFWithClient();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "next" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() { // ehhhh needs fixed
	return new Promise( async function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "previous" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;