const request = require( "request" );
const puppeteer = require( "puppeteer" );
// const RU = require( "./redis_Utils.js" );

const YT_Personal = require( "../../personal.js" ).youtube;
var ENUMERATING_ID = null;
var FINAL_RESULTS = [];
var FINAL_PARSED = [];

// const R_YT_STD_CURRATED = "YOUT_TUBE.STANDARD.CURRATED.PLAYLISTS.";
// function storeIntoRedis() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			var wKey = R_YT_STD_CURRATED + ENUMERATING_ID;
// 			await RU.delKey( wKey );
// 			var ids = FINAL_PARSED.map( x => x[ "videoId" ] );
// 			await RU.setSetFromArray( wKey ,  ids );
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

function filterJSONResults( wResults ) {
	return new Promise( async function( resolve , reject ) {
		try {

			// Stop Guard to Build Up Full Playlist. 
			if ( FINAL_RESULTS[ FINAL_RESULTS.length - 1 ][ "nextPageToken" ] ) { 
				await getPlaylistJSON( FINAL_RESULTS[ FINAL_RESULTS.length - 1 ][ "nextPageToken" ] ); 
			}
			
			for ( var i = 0; i < FINAL_RESULTS.length; ++i ) {
				if ( FINAL_RESULTS[ i ][ "items" ] ) {
					for ( var j = 0; j < FINAL_RESULTS[ i ][ "items" ].length; ++j ) {
						FINAL_PARSED.push({
							publishedAt: FINAL_RESULTS[ i ][ "items" ][ j ][ "snippet" ][ "publishedAt" ] ,
							title: FINAL_RESULTS[ i ][ "items" ][ j ][ "snippet" ][ "title" ] ,
							videoId: FINAL_RESULTS[ i ][ "items" ][ j ][ "contentDetails" ][ "videoId" ]
						});
					}
				}
			}

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const URL_P1 = "https://www.googleapis.com/youtube/v3/playlistItems?playlistId=";
const URL_P2 = "&maxResults=50&part=snippet%2CcontentDetails&key=" + YT_Personal.data_api_key;
const URL_P3 = "&pageToken=";
function getPlaylistJSON( wPageToken ) {
	return new Promise( function( resolve , reject ) {
		try {
			var wURL = null;
			if ( wPageToken ) { wURL = URL_P1 + ENUMERATING_ID + URL_P2 + URL_P3 + wPageToken; }
			else { wURL = URL_P1 + ENUMERATING_ID + URL_P2; }
			console.log( wURL );
			request( wURL , async function ( err , response , body ) {
				if ( err ) { console.log( err ); reject( err ); return; }
				if ( !body ) { resolve( "no data ???" ); return; }
				if ( body === null ) { resolve( "no data ???" ); return; }
				body = JSON.parse( body );
				FINAL_RESULTS.push( body );
				body = await filterJSONResults();
				resolve( body );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.getPlaylist = function( wPlaylistID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			ENUMERATING_ID = null;
			FINAL_RESULTS = [];
			FINAL_PARSED = [];	
			ENUMERATING_ID = wPlaylistID || "PLcW8xNfZoh7ew0Eru-09bjr-l60IBYYgq";
			await getPlaylistJSON();
			//await storeIntoRedis();
			ENUMERATING_ID = null;
			FINAL_RESULTS = null;
			resolve( FINAL_PARSED );
			//FINAL_PARSED = null;
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
};

var browser = null;
function PUPPETEER_GET_AUTH_TOKEN( wURL ) {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( wURL );
			const page = await browser.newPage();
			await page.setViewport( { width: 1200 , height: 700 } );
			//await page.setJavaScriptEnabled( false );
			await page.goto( wURL , { /* timeout: ( 15 * 1000 ) ,*/ waitUntil: "networkidle0" } );
			// await page.waitFor( 6000 );
			// var token = await page.evaluate( () => {
			// 	var p_tags = document.querySelectorAll( "p" );
			// 	var f_token = null;
			// 	for ( var i = 0; i < p_tags.length; ++i ) {
			// 		if ( p_tags[ i ] ) {
			// 			var data_item = p_tags[ i ].getAttribute( "data-email" );
			// 			if ( data_item ) {
			// 				if ( data_item === YT_Personal.email ) {

			// 				}
			// 			}
			// 		}
			// 	}
			// 	return Promise.resolve( window.SDM.pm.doi );
			// });
			// if ( token !== undefined ) { console.log( "\t--> " + token ); resolve( token ); return; }
			await page.waitFor( 2000 );
			await page.mainFrame().waitForSelector( 'p[data-email="' + YT_Personal.email + '"]' );
			//var wBody = await page.content();
			page.click( 'p[data-email="' + YT_Personal.email + '"]' );
			//await page.waitFor( 2000 );
			resolve( "failed" );
		}
		catch( error ) { console.log( error ); resolve( "fail" ); }
	});
}

const GET_FOLLOWERS_URL = `https://www.googleapis.com/youtube/v3/subscriptions?channelId=${YT_Personal.channel_id}&part=snippet%2CcontentDetails&key=${YT_Personal.data_api_key}`;
//const followers_options = { message: "YTGetAuthToken" , client_id: YT_Personal.client_id };
var AUTH_B1 = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http%3A%2F%2Flocalhost%3A6969%2FyoutubeAuth&response_type=token&client_id=";
AUTH_B1 = AUTH_B1 + YT_Personal.client_id;
function GET_FOLLOWERS() {
	return new Promise( async function( resolve , reject ) {
		try {

			// console.log( AUTH_B1 );
			//await require( "../firefoxManager.js" ).openURL( AUTH_B1 );

			// Puppetter Get Link --> http://localhost:6969/youtubeAuth

			// puppeteer.launch().then(async browser => {
			//   const page = await browser.newPage();
			//   let currentURL;
			//   page.mainFrame()
			//     .waitForSelector( 'p[data-email="' + YT_Personal.email + '"]' )
			//     .then(() => page.click( 'p[data-email="' + YT_Personal.email + '"]' ) );
			//   for (currentURL of [ AUTH_B1 ])
			//     await page.goto(currentURL);
			//   await browser.close();
			// });

			browser = await puppeteer.launch({ headless: true , /* slowMo: 2000 */  });
			const token = await PUPPETEER_GET_AUTH_TOKEN( AUTH_B1 );
			await browser.close();
			console.log( token );

			// Then , 
			// console.log( GET_FOLLOWERS_URL );
			// request( GET_FOLLOWERS_URL , async function ( err , response , body ) {
			// 	if ( err ) { console.log( err ); reject( err ); return; }
			// 	body = JSON.parse( body );
			// 	resolve( body );
			// });			
			resolve([]);
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getFollowers = GET_FOLLOWERS;