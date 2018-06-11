const colors = require("colors");
const FeedParser = require("feedparser");
const request = require("request");
const cheerio = require("cheerio");
const path = require("path");

const { map } = require( "p-iteration" );

const wEmitter	= require("../main.js").wEmitter;

const RU = require( "./utils/redis_Utils.js" );
const RC = require( "./CONSTANTS/redis.js" ).YOU_TUBE;

function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_MAN] --> " + wSTR ) ); }
const wSleep = require( "./utils/generic.js" ).wSleep;


function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {

			//await enumerateLiveFollowers();
			await enumerateStandardFollowers();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function enumerateLiveFollowers() {
	var current_followers = current_blacklist = [];
	function searchFollower( wChannelID ) {
		return new Promise( function( resolve , reject ) {
			try {
				var wURL = null;
				if ( wChannelID.substring( 0 , 2 ) === "UC" ) { wURL = "https://www.youtube.com/channel/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				else { wURL = "https://www.youtube.com/user/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				wcl( wURL );

				var wResults = [];
				request( wURL , function ( err , response , body ) {
					if ( err ) { console.log( err ); reject( err ); return; }
					try { var $ = cheerio.load( body ); }
					catch(err) { reject( "cheerio load failed" ); return; }
					$( ".yt-lockup-title > a" ).each( function () {
						var wID = $( this ).attr( "href" );
						wID = wID.substring( wID.length - 11 , wID.length );
						//wResults.push( { title: $( this ).text() , id: wID } );
						wResults.push( wID );
					});
					resolve( wResults );
				});

			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	}
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.delKey( RC.LIVE.LATEST );

			current_followers = await RU.getFullSet( RC.LIVE.FOLLOWERS );
			current_blacklist = await RU.getFullSet( RC.LIVE.BLACKLIST );
			
			var live_videos = await map( current_followers , userId => searchFollower( userId ) );

			live_videos = [].concat.apply( [] , live_videos );
			live_videos = live_videos.filter( function( val ) { return current_blacklist.indexOf( val ) === -1; } );
			
			await RU.setSetFromArray( RC.LIVE.LATEST , live_videos );
			resolve( live_videos );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const wMonth = 2629800;
const wWeek = 604800;
const wDay = 86400;
const ytXML_Base = "https://www.youtube.com/feeds/videos.xml?channel_id=";
function enumerateStandardFollowers() {
	var current_followers = current_blacklist = [];
	var final_results = {};
	var final_ids = [];
	// https://github.com/ceberous/MediaBrowser/blob/master/server/videoManager.js
	// from view-source:https://www.youtube.com/user/$USER_NAME/about
	// data-channel-external-id=
	// FEED_MAN
	function fetchFollowerXML( channelID ) {
		return new Promise( function( resolve , reject ) {
			try {
				if ( !final_results[ channelID ] ) { final_results[ channelID ] = {}; }
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
				feedparser.on( "end" , parseResults );
				function parseResults() {
					if ( wResults ) {
						for ( var i = 0; i < wResults.length; ++i ) {
							var xID = wResults[i]["yt:videoid"]["#"];
							if ( !final_results[ channelID ][ xID ] ) {
								var t1 = new Date( wResults[ i ].pubdate );
								var t2 = Math.round( t1.getTime() / 1000 );
								final_ids.push( xID );
								final_results[ channelID ][ xID ] = {
									title: wResults[i].title ,
									pubdate: t2 ,
									completed: false ,
									skipped: false ,
									current_time: 0 ,
									remaining_time: 0 ,
									duration: 0 ,
								};
							}
						}
					}
					resolve();
				}
			}
			catch( error ) { console.log( error ); resolve(); }
		});
	}
	function filterOldVideos( wTimeLimit ) {
		var n1 = new Date();
		var n2 = Math.round( n1.getTime() / 1000 );
		for ( var wCID in final_results ) {
			for ( var wVID in final_results[ wCID ] ) {
				var x1 = final_results[ wCID ][ wVID ][ "pubdate" ];
				if ( ( n2 - x1 ) > wTimeLimit ) {
					try{ delete final_results[ wCID ][ wVID ]; }
					catch( err ) { console.log( err ); }
				}
			}
		}
	}	
	return new Promise( async function( resolve , reject ) {
		try {

			// Gather Data
			current_followers = await RU.getFullSet( RC.STANDARD.FOLLOWERS );
			current_blacklist = await RU.getFullSet( RC.STANDARD.BLACKLIST );
			if ( current_followers ) {
				await map( current_followers , userId => fetchFollowerXML( userId ) );
				if ( current_blacklist ) {
					filterOldVideos( wMonth );
				}
			}

			final_ids = final_ids.filter( function( val ) { return current_blacklist.indexOf( val ) === -1; } );
			await RU.setSetFromArray( RC.STANDARD.LATEST , final_ids );
			await RU.setDifferenceStore( RC.PLACEHOLDER , RC.STANDARD.LATEST , RC.ALREADY_WATCHED );
			await RU.setStoreUnion( RC.UNWATCHED , RC.PLACEHOLDER , RC.UNWATCHED )
			await RU.delKey( RC.PLACEHOLDER );

			// If you wanted a detailed hash for some reason
			//var wMultis = [];
			//var wVidKeys = {}; // <-- for sunionstore
			// for ( var follower in final_results ) {
			// 	var wR_Key_B0 = RC.STANDARD.LATEST + "." + follower;
			// 	var wR_Key_Base = wR_Key_B0 + ".VIDEO.";
			// 	//if ( !wVidKeys[ follower ] ) { wVidKeys[ follower ] = []; } // <--- for sunionstore
			// 	for ( var video_id in final_results[ follower ] ) {
			// 		var wR_VID = wR_Key_Base + video_id;
			// 		//wVidKeys[ follower ].push( wR_VID ); // <-- for sunionstore
			// 		var wHashArray = [ "hmset" , wR_VID ];
			// 		for ( var iprop in final_results[ follower ][ video_id ] ) {
			// 			wHashArray.push( iprop , final_results[ follower ][ video_id ][ iprop ] );
			// 		}
			// 		wMultis.push( wHashArray );
			// 	}
			// }
			// console.log( wMultis );
			// await RU.setMulti( wMultis );
			

			// ============================================================================================================================
			// This is from experimentation with sunionstore , 
			// where the fuck is hunionstore ???
			// *****Leaving here as an example for sunionstore*****
			// ============================================================================================================================
			// await wSleep( 1000 );
			// var final_vid_keys = [];
			// for ( follower in wVidKeys ) {
			// 	var wR_Key_B0 = R_YT_STANDARD_FOLLOWERS + follower + ".UNEQ";
			// 	final_vid_keys.push( [ "SUNIONSTORE" , wR_Key_B0 ] );
			// 	final_vid_keys[ final_vid_keys.length - 1 ] = final_vid_keys[ final_vid_keys.length - 1 ].concat( wVidKeys[ follower ] );
			// }
			// console.log( final_vid_keys );
			// Array.prototype.push.apply( wMultis , final_vid_keys );
			// await RU.setMulti( final_vid_keys );
			// ============================================================================================================================

			resolve( final_ids );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.initialize = INITIALIZE;
module.exports.updateLive = enumerateLiveFollowers;
module.exports.updateStandard = enumerateStandardFollowers;