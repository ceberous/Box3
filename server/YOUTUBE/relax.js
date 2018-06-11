const colors = require( "colors" );

const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE.RELAX;

function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_CURRATED] --> " + wSTR ) ); }

function GET_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			const list = await RU.getFullSet( RC.QUE );
			resolve( list );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getQue = GET_QUE;

function ADD_TO_QUE( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( wVideoID ) {
				if ( wVideoID.length > 10 ) {
					await RU.setAdd( RC.QUE , wVideoID );
					await RU.setAdd( RC.RECYCLED_QUE , wVideoID );
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.addToQue = ADD_TO_QUE;

function REMOVE_FROM_QUE( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.setRemove( RC.QUE , wVideoID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.removeFromQue = REMOVE_FROM_QUE;


function IMPORT_FROM_PLAYLIST_ID( wPlaylistID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const videos = await require( "./youtubeAPI_Utils.js" ).getPlaylist( wPlaylistID );
			const ids = videos.map( x => x[ "videoId" ] );
			const filtered_ids = await require( "./generic.js" ).filterCommon( ids );
			console.log( "Filtered IDS === " );
			console.log( filtered_ids );
			await RU.setSetFromArray( RC.QUE , filtered_ids );
			resolve( filtered_ids );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.importFromPlaylistID = IMPORT_FROM_PLAYLIST_ID;


function GET_NEXT_IN_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			var final_next = "empty";
			
			var next_video = await RU.popRandomSetMembers( RC.QUE , 1 );
			console.log( "Next in Relax Que === " );
			console.log( next_video );
			if ( next_video.length < 1 ) {
				console.log( "Normal Relax Que Empty , Recyling" );
				var recycled_q = await RU.getFullSet( RC.RECYCLED_QUE );
				console.log( recycled_q );
				if ( recycled_q ) {
					if ( recycled_q.length > 0 ) {
						await RU.setSetFromArray( RC.QUE , recycled_q );
						await RU.delKey( RC.RECYCLED_QUE );
						next_video = await RU.popRandomSetMembers( RC.QUE , 1 );
						next_video = next_video[ 0 ];
					}
				}
			}
			else { next_video = next_video[ 0 ]; }
			console.log( "Final Computed Next Relax Video === "  + next_video );
			await RU.setAdd( RC.RECYCLED_QUE , next_video );
			resolve( next_video );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getNextInQue = GET_NEXT_IN_QUE;