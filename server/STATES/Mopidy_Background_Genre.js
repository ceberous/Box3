const RU = require( "../utils/redis_Utils.js" );

const R_KEY_BASE = "MOPIDY.CACHE."
const R_LAST_SS_BASE = "LAST_SS.MOPIDY.";
const R_CONTINUOUS_PLAY = R_LAST_SS_BASE + "CONTINUOUS_PLAY";
function wStart( wButton_Genre_Type ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wButton_Genre_Type = wButton_Genre_Type || "UNKNOWN";
			wButton_Genre_Type = wButton_Genre_Type + ".TRACKS";
			await RU.setKey( R_CONTINUOUS_PLAY , wButton_Genre_Type );
			await require( "../utils/mopidy/restartContinousPlay.js" ).restart();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/mopidy/playbackManager.js" ).pause();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wResume() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/mopidy/playbackManager.js" ).resume();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.setKey( R_CONTINUOUS_PLAY , "STOPPED" );
			await require( "../utils/mopidy/playbackManager.js" ).stop();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/mopidy/playbackManager.js" ).next();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/mopidy/playbackManager.js" ).previous();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.resume = wResume;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;