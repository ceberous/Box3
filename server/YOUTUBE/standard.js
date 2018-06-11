const colors = require( "colors" );
const request = require( "request" );
const FeedParser = require( "feedparser" );
const { map } = require( "p-iteration" );

const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE.STANDARD;

function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_STANDARD] --> " + wSTR ) ); }

const wMonth = 2629800;
const wWeek = 604800;
const wDay = 86400;
const ytXML_Base = "https://www.youtube.com/feeds/videos.xml?channel_id=";

function FILTER_OLD_VIDEOS_BASED_ON_TIME( wItems , wTimeLimit ) {
	if ( !wItems ) {  return; }
	wTimeLimit = wTimeLimit || wMonth;
	var n1 = new Date();
	var n2 = Math.round( n1.getTime() / 1000 );
	for ( var i = 0; i < wItems.length; ++i ) {
		for ( var x = 0; x < wItems[ i ].length; ++x ) {
			if ( ( n2 - wItems[ i ][ x ][ "pubdate" ] ) > wTimeLimit ) {
				wItems[ i ].splice( x , 1 );
			}
		}
	}
	return wItems;
}

function PARSE_STANDARD_FOLLOWER_XML( wResults , wChannelID ) {
	var parsed = [];
	if ( wResults ) {
		for ( var i = 0; i < wResults.length; ++i ) {
			var t1 = new Date( wResults[ i ].pubdate );
			var t2 = Math.round( t1.getTime() / 1000 );
			var xID = wResults[i]["yt:videoid"]["#"];
			if ( xID ) {
				parsed.push({
					id: xID ,
					channel_id: wChannelID ,
					title: wResults[ i ].title ,
					pubdate: t2 ,
					completed: false ,
					skipped: false ,
					current_time: 0 ,
					remaining_time: 0 ,
					duration: 0 ,
				});
			}
		}
	}
	return( parsed );
}

// https://github.com/ceberous/MediaBrowser/blob/master/server/videoManager.js
// from view-source:https://www.youtube.com/user/$USER_NAME/about
// data-channel-external-id=
// FEED_MAN
function STANDARD_FOLLOWERS_FETCH_XML( channelID ) {
	return new Promise( function( resolve , reject ) {
		try {
			var wFP_Options = { "normalize": true ,"feedurl": wFeedURL };
			var feedparser = new FeedParser( [ wFP_Options ] );

			var wResults = [];
			var wFeedURL = ytXML_Base + channelID;
			wcl( wFeedURL );
			var req = request( wFeedURL );
			req.on( "error" , function ( error ) { console.log(error); resolve(); return; } );
			req.on( "response" , function ( res ) {
				if ( res.statusCode !== 200 ) { /*reject( res.statusCode ); */  resolve(); return; }
				else { this.pipe( feedparser ); }
			});
			feedparser.on( "error" , function ( error ) { console.log( error ); } );
			feedparser.on( "readable" , function () { var item; while ( item = this.read() ) { wResults.push( item ); } } );
			feedparser.on( "end" , () => {
				var parsed = PARSE_STANDARD_FOLLOWER_XML( wResults , channelID );
				parsed = FILTER_OLD_VIDEOS_BASED_ON_TIME( parsed );
				resolve( parsed );
			});
		}
		catch( error ) { console.log( error ); resolve(); }
	});
}

function STANDARD_FOLLOWERS_GET_LATEST() {
	return new Promise( async function( resolve , reject ) {
		try { 
			var current_followers = await RU.getFullSet( RC.FOLLOWERS );
			if ( current_followers ) {
				if ( current_followers.length > 0 ) {
					var latest = await map( current_followers , userId => STANDARD_FOLLOWERS_FETCH_XML( userId ) );
				}
			}
			var all_new = null;
			if ( current_followers && latest ) {
				if ( current_followers.length === latest.length ) {
					all_new = [].concat.apply( [] , latest );
					all_new = all_new.sort( function() { return 0.5 - Math.random(); });
					var new_que_ids = all_new.map( x => x[ "id" ] );
					new_que_ids = await require( "./generic.js" ).filterCommon( new_que_ids );
					const wNewTotal = new_que_ids.length;
					const current_que_length = await RU.getListLength( RC.QUE );
					//console.log( "Current QUE Length === " + current_que_length.toString() );
					//console.log( "New Additions Total === " + wNewTotal.toString() );
					const space_available = ( 100 - ( current_que_length + wNewTotal ) );
					//console.log( "Space Available === " + space_available.toString() );
					if ( space_available < 0 ) {
						const space_needed = ( 0 - space_available );
						//console.log( "We need to clear " + space_needed.toString() + " slots in que" );
						var wToDeleteIDS = [];
						for ( var i = 0; i < space_needed; ++i ) {
							var xTMP = await RU.listRPOP( RC.QUE );
							wToDeleteIDS.push( xTMP );
						}
						var wToDeleteKeysMulti = wToDeleteIDS.map( x => [ "del" , RC.LATEST + "." + x ] );
						//console.log( "We need to remove these **old** videos" );
						//console.log( wToDeleteKeysMulti );
						await RU.setMulti( wToDeleteKeysMulti );
						//console.log( "supposedly done deleting keys" );
					}
					//console.log( "about to add new ids to QUE" );
					await RU.setListFromArrayBeginning( RC.QUE , new_que_ids );
					//console.log( "done adding to QUE" );
					for ( var i = 0; i < all_new.length; ++i ) {
						var xR_Key = RC.LATEST + "." + all_new[ i ][ "id" ];
						if ( !await RU.exists( xR_Key ) ) {
							await RU.setHashMulti( xR_Key ,
								"title" , all_new[ i ][ "title" ] ,
								"pubdate" , all_new[ i ][ "pubdate" ] ,
								"completed" , all_new[ i ][ "completed" ] ,
								"skipped" , all_new[ i ][ "skipped" ] ,
								"current_time" , all_new[ i ][ "current_time" ] ,
								"remaining_time" , all_new[ i ][ "remaining_time" ] ,
								"duration" , all_new[ i ][ "duration" ] ,
							);
						}			
					}
				}
			}
			resolve( all_new );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.update = STANDARD_FOLLOWERS_GET_LATEST;

function GET_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			const que = await RU.getFullList( RC.QUE );
			resolve( que );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getQue = GET_QUE;

function GET_FOLLOWERS() {
	return new Promise( async function( resolve , reject ) {
		try {
			const followers = await RU.getFullSet( RC.FOLLOWERS );
			resolve( followers );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getFollowers = GET_FOLLOWERS;

function ADD_FOLLOWER( wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.sadd( RC.FOLLOWERS , wChannelID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.addFollower = ADD_FOLLOWER;

function REMOVE_FOLLOWER( wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.srem( RC.FOLLOWERS , wChannelID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.removeFollower = REMOVE_FOLLOWER;

function GET_BLACKLIST() {
	return new Promise( async function( resolve , reject ) {
		try {
			const blacklist = await RU.getFullSet( RC.BLACKLIST );
			resolve( blacklist );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getBlacklist = GET_BLACKLIST;

function BLACKLIST_VID( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.sadd( RC.BLACKLIST , wVideoID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.blacklistVID = BLACKLIST_VID;

function REMOVE_BLACKLIST_VID( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.srem( RC.BLACKLIST , wVideoID );			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.removeBlacklistVID = REMOVE_BLACKLIST_VID;

function DELETE_VIDEO( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.delKey( RC.LATEST + "." + wVideoID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.deleteVideo = DELETE_VIDEO;


function GET_VIDEO_INFO( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const x1 = await RU.hashGetAll( RC.LATEST + "." + wVideoID );
			console.log( x1 );
			resolve( x1 );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getVideoInfo = GET_VIDEO_INFO;


function UPDATE_VIDEO_INFO( wVideoID , wKey , wValue ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await redis.hset( RC.LATEST + "." + wVideoID , wKey , wValue );			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.updateVideoInfo = UPDATE_VIDEO_INFO;



function GET_NEXT_VIDEO() {
	return new Promise( async function( resolve , reject ) {
		try {

			//var finalVideo = finalMode = null;
			// Precedance Order Unless Otherwise Segregated into Sub-States
			// 1.) Check inside redis-Personal-Store for custom youtube.com/playlists
			// var finalVideo = await RU.popRandomSetMembers( RC.CURRATED.QUE , 1 );
			// if ( finalVideo.length > 0 ) { finalMode = "QUE"; finalVideo = finalVideo[0]; }
			// // 2.) If none exist , build a mini playlist of Standard Followers Latest Videos this Month
			// else {
			// 	console.log( "no videos are left in QUE" );
			// 	finalMode = "STANDARD";
			// 	finalVideo = await RU.popRandomSetMembers( RC.STANDARD.QUE , 1 );
			// 	if ( finalVideo.length < 1 ) { console.log( "this seems impossible , but we don't have any standard youtube videos anywhere" ); resolve(); return; }
			// 	else { finalVideo = finalVideo[0]; }
			// }
			// console.log( finalVideo );
			// console.log( finalMode );
			// // WutFace https://stackoverflow.com/questions/17060672/ttl-for-a-set-member
			// await RU.setMulti( [ 
			// 	[ "sadd" , RC.ALREADY_WATCHED , finalVideo ] ,
			// 	[ "set" , RC.NOW_PLAYING_ID , finalVideo ] , 
			// 	[ "set" , RC.NOW_PLAYING_MODE , finalMode ] 
			// ]);

			var finalVideo = await RU.listRPOP( RC.QUE , 1 );
			if ( !finalVideo ) { console.log( "this seems impossible , but we don't have any standard youtube videos anywhere" ); resolve( "empty" ); return; }
			resolve( finalVideo );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getNextVideo = GET_NEXT_VIDEO;