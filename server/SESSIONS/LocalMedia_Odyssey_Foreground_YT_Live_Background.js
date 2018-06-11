const RU = require( "../utils/redis_Utils.js" );

const R_STATE_BASE = "LAST_SS.STATE."
const R_STATE_ACTIVE = R_STATE_BASE + "ACTIVE";
const R_STATE_PREVIOUS = R_STATE_BASE + "PREVIOUS";
const R_STATE_NAME = "LOCAL_MEDIA_ODYSSEY_FOREGROUND_YT_LIVE_BACKGROUND";
function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var current_state = await RU.getKey( R_STATE_ACTIVE );
			current_state = current_state || "null";
			var LM_OPS = {
				genre: "Odyssey" ,
				advance_show: "false" , 
				specific_show: "false" ,
				specific_episode: "false" ,
			};
			await require( "../STATES/LocalMedia_Foreground.js" ).start( LM_OPS );
			await require( "../STATES/YT_Live_Background.js" ).start();
			await RU.setMulti( [ [ "set" , R_STATE_ACTIVE , R_STATE_NAME ] , [ "set" , R_STATE_PREVIOUS , current_state ] ] );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() { 
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/LocalMedia_Foreground.js" ).pause();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function wResume() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/LocalMedia_Foreground.js" ).resume();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/LocalMedia_Foreground.js" ).stop();
			await require( "../STATES/YT_Live_Background.js" ).stop();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/LocalMedia_Foreground.js" ).next();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/LocalMedia_Foreground.js" ).previous();
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