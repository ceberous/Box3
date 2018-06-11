const wEmitter = require( "../../main.js" ).wEmitter;

const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE;

const MODE_MAP = {
	LIVE: "../YOUTUBE/live.js" ,
	STANDARD: "../YOUTUBE/standard.js" ,
	CURRATED: "../YOUTUBE/currated.js" ,
	RELAX: "../YOUTUBE/relax.js"
};


function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Store Mode
			var wMode = wOptions.mode || "LIVE";
			var wPosition = wOptions.position || "FOREGROUND";

			var final_options = { message: "Youtube" , mode: wMode , position: wPosition };
			if ( wMode === "LIVE" ) {
				final_options.playlist = await require( "../YOUTUBE/live.js" ).getLiveVideos();
			}
			else if ( wMode === "RELAX" ) {
				var item = await require( "../YOUTUBE/relax.js" ).getNextInQue();
				if ( !item ) { final_options.mode = "CURRATED"; wMode = "CURRATED"; }
				else { final_options.playlist = [ item ]; }
			}
			if ( wMode === "CURRATED" ) {
				var item = await RU.getRandomSetMembers( RC.CURRATED.QUE , 1 );
				if ( !item ) { final_options.mode = "STANDARD"; wMode = "STANDARD"; }
				else if ( item.length < 1 ) { final_options.mode = "STANDARD"; wMode = "STANDARD"; }
				else { final_options.playlist = [ item[ 0 ] ]; }
			}			
			if ( wMode === "STANDARD" ) {
				var item = await RU.listRPOP( RC.STANDARD.QUE , 1 );
				if ( item ) {
					final_options.playlist = [ item ];
				}
			}
			else if ( wMode === "SINGLE" ) {
				if ( !wOptions.single_id ) { resolve(); return; }
				final_options.playlist = [ wOptions.single_id ];
			}
			else if ( wMode === "PLAYLIST_OFFICIAL" ) {
				final_options.playlist_id = wOptions.playlist_id;
			}
			else if ( wMode === "LIST" ) {
				final_options.playlist = wOptions.playlist;
			}

			var starting_item = null;
			if ( final_options.playlist ) { starting_item = final_options.playlist[ 0 ] }
			else { starting_item = final_options.playlist_id; }
			await RU.setMulti( [ 
				[ "set" , RC.NOW_PLAYING_ID , starting_item ] ,
				[ "rpush" , RC.NP_SESSION_LIST , starting_item ] ,
				[ "set" , RC.NP_SESSION_INDEX , 0 ] ,
				[ "set" , RC.MODE , wMode ] ,
			]);
			console.log( final_options );
			await require( "../utils/generic.js" ).setStagedFFClientTask( final_options );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtube" );
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

			const current_mode = await RU.getKey( RC.MODE );
			console.log( "CURRENT YOUTUBE MODE === " + current_mode );
			if( current_mode === "LIVE" ) {
				wEmitter.emit( "sendFFClientMessage" , "next" );
				resolve();
				return;
			}

			const completed_id = await RU.getKey( RC.NOW_PLAYING_ID );
			if ( completed_id ) {
				await RU.setAdd( RC.WATCHED , completed_id );
			}
			
			// 2.) Determine Place In Session
			await RU.incrementInteger( RC.NP_SESSION_INDEX );
			var current_index = await RU.getKey( RC.NP_SESSION_INDEX );
			var session_length = await RU.getListLength( RC.NP_SESSION_LIST );
			console.log( "\nINDEX === " + current_index.toString() );
			console.log( "LENGTH === " + session_length.toString() );
			
			// 4.) Get Next Video
			var next_video = null;
			// if we are still at the head of the list and havn't navigated via previous button
			if ( parseInt( current_index ) < ( parseInt( session_length ) ) ) {
				console.log( "Somebody used the previous button" );
				next_video = await RU.getFromListByIndex( RC.NP_SESSION_LIST , current_index );
			}
			else {
				if ( current_mode === "SINGLE" ) {
					resolve();
					return;
				}				
				else if ( current_mode === "CURRATED" ) {
					await RU.setRemove( RC.CURRATED.LIST , completed_id );
					next_video = await require( "../YOUTUBE/currated.js" ).getNextInQue();
				}
				else if ( current_mode === "RELAX" ) {
					next_video = await require( "../YOUTUBE/relax.js" ).getNextInQue();

				}
				else if ( current_mode === "STANDARD" ) {
					next_video = await require( "../YOUTUBE/standard.js" ).getNextVideo();
				}

				console.log( next_video );
				console.log( "Next Video === " + next_video );
				await RU.setKey( RC.NOW_PLAYING_ID , next_video );
				await RU.listRPUSH( RC.NP_SESSION_LIST , next_video );
			}

			wEmitter.emit( "sendFFClientMessage" , "next" , next_video );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			const current_mode = await RU.getKey( RC.MODE );
			if( current_mode === "LIVE" ) {
				wEmitter.emit( "sendFFClientMessage" , "previous" );
				resolve();
				return;
			}
			var previous_index = await RU.decrementInteger( RC.NP_SESSION_INDEX );
			previous_index = parseInt( previous_index );
			console.log( "previous_index === " + previous_index.toString() );
			if ( previous_index < 0 ) {
				var list_lenth = await RU.getListLength( RC.NP_SESSION_LIST );
				console.log( "list_lenth === " + list_lenth.toString() );
				previous_index = parseInt( list_lenth ) - 1;
				await RU.setKey( RC.NP_SESSION_INDEX , previous_index );
				console.log( "List Index Now Set to --> " + previous_index.toString() );
			}
			
			var now_playing = await RU.getFromListByIndex( RC.NP_SESSION_LIST , previous_index );
			if ( now_playing ) {
				await RU.setKey( RC.NOW_PLAYING_ID , now_playing );
				wEmitter.emit( "sendFFClientMessage" , "next" , now_playing );
			}
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