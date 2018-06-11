// https://github.com/totemstech/instagram-node
// https://github.com/althonos/InstaLooter
// https://www.instaphotodownloader.com/
// https://igeturl.com/

// https://github.com/akv2/MaxImage
// https://github.com/blueimp/Gallery#demo

// https://www.npmjs.com/package/twitter-pic-downloader


// https://www.instagram.com/nfl/?__a=1

const { map } = require( "p-iteration" );
const request = require("request");
const resolver = require("resolver");
//const cheerio = require("cheerio");
const RU = require( "./utils/redis_Utils.js" );
const RC = require( "./CONSTANTS/redis.js" ).INSTAGRAM;

function RESOLVE_SHORT_LINK( wURL ) {
	return new Promise( function( resolve , reject ) {
		try {
			resolver.resolve( wURL , function( err , url , filename , contentType ) {
				resolve( url );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const URL_3 = "https://igeturl.com/get.php";
// or .... http://www.getlinkinfo.com
function GET_REAL_VIDEO_URL_TERRIBLE_METHOD( wCode ) {
	return new Promise( function( resolve , reject ) {
		try {
			const xURL = URL_1 + "p/" + wCode;
			const xF_Body = "url=" + encodeURIComponent( xURL ) + "%2F";
			request.post({
				headers: { 
					"content-type" : "application/x-www-form-urlencoded" ,
					"origin": "https://igeturl.com" ,
					"accept": "application/json" ,
					"referer": "https://igeturl.com/" ,
					"connection": "keep-alive" ,
				} , 
				url: URL_3 ,
				body: xF_Body 
			} , async function ( err , response , body ) {
				if ( err ) { console.log( err ); reject( err ); return; }
				body = JSON.parse( body );
				if ( body[ "message" ] ) {
					body = await RESOLVE_SHORT_LINK( body[ "message" ] );
				}
				resolve( body );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function GET_REAL_VIDEO_URL( wCode ) {
	return new Promise( function( resolve , reject ) {
		try {
			var wResults = [];
			var wURL = URL_1 + "p/" + wCode;
			console.log( wURL );
			request( wURL , async function ( err , response , body ) {
				if ( err ) { console.log( err ); reject( err ); return; }
				try { var $ = cheerio.load( body ); }
				catch(err) { reject( "cheerio load failed" ); return; }
				$( "<video></video>" ).each( function () {
					var wID = $( this ).attr( "src" );
					console.log( wID );
					wResults.push( wID );
				});
				resolve( wResults[0] );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function FILTER_USER_JSON( wBody ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var wFinalResults = [];
			if ( wBody[ "user" ] ) {
				if ( wBody[ "user" ][ "media" ] ) {
					if ( wBody[ "user" ][ "media" ][ "nodes" ] ) {
						for ( var i = 0; i < wBody[ "user" ][ "media" ][ "nodes" ].length; ++i ) {
							const wCode = wBody[ "user" ][ "media" ][ "nodes" ][ i ][ "code" ];
							const isVideo = wBody[ "user" ][ "media" ][ "nodes" ][ i ][ "is_video" ];
							var src_url = null;
							if ( isVideo ) {
								src_url = await GET_REAL_VIDEO_URL_TERRIBLE_METHOD( wCode );
							}
							else {
								src_url = wBody[ "user" ][ "media" ][ "nodes" ][ i ][ "display_src" ];
							}
							wFinalResults.push({
								code: wCode ,
								is_video: isVideo ,
								date: wBody[ "user" ][ "media" ][ "nodes" ][ i ][ "date" ] ,
								display_src: src_url ,
							});
						}
					}
				}
			}
			resolve( wFinalResults );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const URL_1 = "https://www.instagram.com/";
const URL_2 = "?__a=1";
function SEARCH_FOLLOWER( wUserName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var wURL = URL_1 + wUserName + URL_2;
			console.log( wURL );
			request( wURL , async function ( err , response , body ) {
				if ( err ) { console.log( err ); reject( err ); return; }
				body = JSON.parse( body );
				body = await FILTER_USER_JSON( body );
				resolve( body );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function UPDATE_LATEST_FOLLOWER_MEDIA() {
	return new Promise( async function( resolve , reject ) {
		try {
			const current_followers = await RU.getFullSet( RC.FOLLOWERS );
			var latest = null;
			if ( current_followers ) {
				if ( current_followers.length > 0 ) {
					latest = await map( current_followers , userId => SEARCH_FOLLOWER( userId ) );				
				}
			}
			latest = [].concat.apply( [] , latest );

			var latest_codes = latest.map( x => x.code );
			const already_watched = await RU.getFullList( RC.ALREADY_WATCHED );
			var skipped = null;
			if ( already_watched ) {
				if ( already_watched.length > 0 ) {
					skipped = latest_codes.filter( function( val ) { return already_watched.indexOf( val ) !== -1; } );
				}
			}
			if ( skipped !== null ) {
				latest = latest.filter( function( val ) { return skipped.indexOf( val[ "code" ] ) === -1; } );
				latest_codes = latest.map( x => x.code );
			}
			var wMulti = [];
			for ( var i = 0; i < latest.length; ++i ) {
				wMulti.push( latest[ i ][ "code" ] , latest[ i ][ "display_src" ] );
			}

			if ( wMulti.length > 0 ) {
				wMulti = wMulti.filter( function( x ) { return x === undefined || x === "undefined" } );
				await RU.setHashMulti( RC.MEDIA , wMulti );
			}

			//latest = latest.map( function( x ) { return { code: x["code"] , url: x["display_src"] }; } );
			resolve( latest );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function UPDATE_WATCHED_MEDIA( wCode_ID ) {
	return new Promise( function( resolve , reject ) {
		try {
			// https://redis.io/commands/ltrim
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.updateLatestFollowerMedia = UPDATE_LATEST_FOLLOWER_MEDIA;
module.exports.updateWatchedMedia = UPDATE_WATCHED_MEDIA;

// ( async ()=> {
// 	await RU.selectDatabase( 3 ); // testing
// 	var final_results = await SEARCH_FOLLOWER( "ceberous" );
// 	console.log( final_results );
// })();