const RU = require( "../redis_Utils.js" );
const RC = require( "../../CONSTANTS/redis.js" ).LOCAL_MEDIA;

function ADVANCE_NEXT_SHOW_POSITION( wCurrentIndex ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var FinalUNEQ_IDX = ( wCurrentIndex + 1 );
			var R_NextShow = R_FinalBase + "META.UNEQ";
			var FinalShowName = await RU.getFromListByIndex( R_NextShow , FinalUNEQ_IDX );
			if ( FinalShowName === null ) { //  IF Advanced Past Total-UNEQ-aka-Unique Shows in Genre
				//console.log( "inside show-in-genre reset" );
				FinalUNEQ_IDX = 0;
				FinalShowName = await RU.getFromListByIndex( R_NextShow , FinalUNEQ_IDX );
			}
			const x1 = [ FinalUNEQ_IDX , FinalShowName ];
			//console.log( x1 );
			resolve( x1 );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.advanceNextShow = ADVANCE_NEXT_SHOW_POSITION;

function UPDATE_LAST_PLAYED_TIME( wTime ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wTime ) { resolve(); return; }
			console.log( "Time = " + wTime.toString() );
			
			var G_NOW_PLAYING = await RU.getKey( RC.LAST_SS.NOW_PLAYING_GLOBAL );
			//console.log( G_NOW_PLAYING );
			if ( !G_NOW_PLAYING ) { resolve(); return; }
			G_NOW_PLAYING = JSON.parse( G_NOW_PLAYING );
			//console.log( "wTime === " + wTime.toString() );
			G_NOW_PLAYING.cur_time = wTime;
			G_NOW_PLAYING.remaining_time = ( G_NOW_PLAYING.duration - G_NOW_PLAYING.cur_time );
			if ( G_NOW_PLAYING.cur_time >= G_NOW_PLAYING.three_percent ) { G_NOW_PLAYING.completed = true; }
			//console.log( G_NOW_PLAYING );
			const x1 = JSON.stringify( G_NOW_PLAYING );
			await RU.setMulti( [ [ "set" , RC.LAST_SS.NOW_PLAYING[ G_NOW_PLAYING.genre ] , x1 ] ,  [ "set" , RC.LAST_SS.NOW_PLAYING_GLOBAL , x1 ] ]);
		
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.updateLastPlayedTime = UPDATE_LAST_PLAYED_TIME;

function GET_LIVE_CONFIG() {
	return new Promise( async function( resolve , reject ) {
		try {
			var liveConfig = await RU.getMultiKeys( RC.CONFIG.GENRE , RC.CONFIG.ADVANCE_SHOW , RC.CONFIG.SPECIFIC_SHOW , RC.CONFIG.SPECIFIC_EPISODE , RC.MOUNT_POINT );
			if ( liveConfig ) {
				liveConfig = {
					genre: liveConfig[ 0 ] ,
					advance_show: liveConfig[ 1 ] ,
					specific_show: liveConfig[ 2 ] ,
					specific_episode: liveConfig[ 3 ] ,
					mount_point: liveConfig[ 4 ]
				};
			}
			//console.log( liveConfig );
			resolve( liveConfig );
		}
		catch( error ) { console.log( error ); resolve( undefined ); }
	});
}
module.exports.getLiveConfig = GET_LIVE_CONFIG;

function GET_LAST_PLAYED_GLOBAL() {
	return new Promise( async function( resolve , reject ) {
		try {
			var liveLastPlayed = await RU.getKey( RC.LAST_SS.NOW_PLAYING_GLOBAL );
			liveLastPlayed = JSON.parse( liveLastPlayed );
			resolve( liveLastPlayed );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLastPlayedGlobal = GET_LAST_PLAYED_GLOBAL;

function GET_LAST_PLAYED_IN_GENRE( wGenre ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wGenre ) { resolve(); return; }
			var liveLastPlayed = await RU.getKey( RC.LAST_SS.NOW_PLAYING[ wGenre ] );
			liveLastPlayed = JSON.parse( liveLastPlayed );
			resolve( liveLastPlayed );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLastPlayedInGenre = GET_LAST_PLAYED_IN_GENRE;