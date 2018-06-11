const RU = require( "../utils/redis_Utils.js" );

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME = "YOUTUBE_LIVE_BACKGROUND";

function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

async function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			var current_state = await RU.getKey( R_STATE );
			var live_vids = await require( "../youtubeManager.js" ).updateLive();
			//console.log( live_vids );
			await require( "../utils/generic.js" ).setStagedFFClientTask( { message: "YTLiveBackground" , playlist: live_vids , nextVideoTime: 180000 } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeLiveBackground" );
			await RU.setMulti( [ [ "set" , R_STATE , R_STATE_NAME ] , [ "set" , R_PREVIOUS , current_state ] ] );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	
}

function wStop() { 
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/xdotoolWrapper.js" ).mouseDoubleClick();
			await wsleep( 1000 );
			await require( "../firefoxManager.js" ).terminateFFWithClient(); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;