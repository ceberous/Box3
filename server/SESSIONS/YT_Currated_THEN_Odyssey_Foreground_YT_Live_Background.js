const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE;

const wEmitter = require( "../../main.js" ).wEmitter;

// const R_BASE = "LAST_SS.STATE.";
// const R_STATE = R_BASE + "ACTIVE";
// const R_PREVIOUS = R_BASE + "PREVIOUS";
// const R_STATE_NAME_GENERAL = "YOU_TUBE_CURRATED_THEN_ODYSSEY_FOREGROUND_YOU_TUBE_LIVE_BACKGROUND";
// const R_STATE_NAME_YOUTUBE = "YOUTUBE_STANDARD";

function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

function RESTART_IN_YOU_TUBE_LIVE_MODE(){
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "no more 'curated' videos" );
			require( "../clientManager.js" ).pressButtonMaster( 11 ); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function TRY_FOR_NEXT_VIDEO() {
	return new Promise( async function( resolve , reject ) {
		try {
			var next_video = await RU.popRandomFromSet( RC.CURRATED.MAIN_LIST );
			if ( next_video ) {
				resolve( next_video );
				return;
			}
			else {
				resolve( "null" );
				return;
			}
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			var next_video = await TRY_FOR_NEXT_VIDEO();
			if ( next_video === "null" ) { await RESTART_IN_YOU_TUBE_LIVE_MODE(); }
			else {
				await require( "../../main.js" ).setStagedFFClientTask( { message: "YTStandardForeground" , playlist: [ next_video ]  } );
				await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeStandard" );
				await RU.setMulti( [ 
					[ "sadd" , RC.ALREADY_WATCHED , next_video ] ,
					[ "lpush" , RC.NP_SESSION_LIST , next_video ] ,
					[ "set" , RC.NP_SESSION_INDEX , 0 ] ,
				]);
			}
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			var next_video = null;
			var current_index = await RU.getKey( RC.NP_SESSION_INDEX );
			var list_length = await RU.getListLength( RC.NP_SESSION_LIST );
			if ( list_length && current_index ) {
				list_length = parseInt( list_length );
				current_index = parseInt( current_index );
				list_length = ( list_length - 1 );
				if ( current_index < list_length ) {
					//console.log( "somebody must of pressed the 'previous' button" );
					current_index = ( current_index + 1 );
					next_video = await RU.getFromListByIndex( RC.NP_SESSION_LIST , current_index );
					if ( !next_video ) {
						await RESTART_IN_YOU_TUBE_LIVE_MODE();
						resolve();
						return;
					}
					else {
						wEmitter.emit( "sendFFClientMessage" , "next" , next_video );
						await RU.incrementInteger( RC.NP_SESSION_INDEX );
						resolve();
						return;
					}
				}
				else {
					next_video = await TRY_FOR_NEXT_VIDEO();
					if ( next_video === "null" ) { console.log( "level - 5" ); await RESTART_IN_YOU_TUBE_LIVE_MODE(); }
					else {
						wEmitter.emit( "sendFFClientMessage" , "next" , next_video );
						await RU.setMulti( [ 
							[ "sadd" , RC.ALREADY_WATCHED , next_video ] ,
							[ "rpush" , RC.NP_SESSION_LIST , next_video ] ,
							[ "incr" , RC.NP_SESSION_INDEX ] , 
						]);
					}
					resolve();
					return;
				}
				console.log( "level - 7" );
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			var previous_index = await RU.decrementInteger( RC.NP_SESSION_INDEX );
			previous_index = parseInt( previous_index );
			console.log( "previous_index === " + previous_index.toString() );
			var now_playing = await RU.getFromListByIndex( RC.NP_SESSION_LIST , previous_index );
			if ( now_playing ) {
				wEmitter.emit( "sendFFClientMessage" , "next" , now_playing );
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../firefoxManager.js" ).terminateFFWithClient();
			await RU.delKey( RC.NP_SESSION_LIST );
			console.log( "we did delete the key ??" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "pause" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.stop = wStop;
module.exports.pause = wPause;
module.exports.resume = wPause;
module.exports.next = wNext;
module.exports.previous = wPrevious;