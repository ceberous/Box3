const RU = require( "../redis_Utils.js" );
const mopidy = require( "../../mopidyManager.js" ).mopidy;
//const resetRandom = require( "../../mopidyManager.js" ).resetRandom;
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

const R_BASE = "MOPIDY.";
const R_CACHE_BASE = R_BASE + "CACHE.";
const R_LAST_UPDATE_TIME = R_CACHE_BASE + "LAST_UPDATE_TIME";
const R_BUTTON_GENRES_BASE = R_BASE + "BUTTON_GENRES.";
const R_BUTTON_CLASSIC = R_BUTTON_GENRES_BASE + "CLASSIC";
const R_BUTTON_EDM = R_BUTTON_GENRES_BASE + "EDM";
function GET_PLAYLISTS() {
	return new Promise( async function( resolve , reject ) {
		try {

			var BTN_CLASSICS = await RU.getFullSet( R_BUTTON_CLASSIC );
			var BTN_EDM = await RU.getFullSet( R_BUTTON_EDM );

			mopidy.playlists.getPlaylists().then( async function( playlists ) {

				var R_MULTI = [];
				var R_MULTI2 = [];
				for ( var i = 0; i < playlists.length; ++i ) {

					var wKey = playlists[i].uri.split( "gmusic:playlist:" )[1];

					if ( wKey === "promoted" || wKey === "IFL" || wKey === "[Radio Streams]" || wKey === undefined ) { continue; }
					console.log( wKey + " === " + playlists[ i ].name );

					// Check to See if we have already giving a "special" button-mapped label for the genre
					// aka "edm" or "classical" or etc...
					var wGenre = "unknown";
					if ( BTN_CLASSICS.indexOf( wKey ) === 1 ) { wGenre = "classic"; }
					else if ( BTN_EDM.indexOf( wKey ) === 1 ) { wGenre = "edm"; }
					wGenre = wGenre.toUpperCase();

					var R_C_K_BASE = R_CACHE_BASE + wGenre;

					var R_CK1 = R_C_K_BASE + ".PLAYLISTS";
					R_MULTI.push( [ "hset" , R_CK1 , wKey , JSON.stringify( playlists[i] ) ] );

					const R_CK2 = R_C_K_BASE + ".TRACKS";
					for ( var j = 0; j < playlists[i].tracks.length; ++j ) {
						var id = playlists[ i ].tracks[ j ].uri.split( "gmusic:track:" )[1];
						R_MULTI2.push( [ "sadd" , R_CK2 , JSON.stringify( playlists[ i ].tracks[ j ] ) ] );
					}

				}

				timeNow = new Date().getTime();
				console.log( "Time.Now === " + timeNow.toString() );
				R_MULTI.push( [ "set" , R_LAST_UPDATE_TIME , timeNow ] );
				
				await RU.setMulti( R_MULTI );
				console.log( "finished setting multi-1" );
				await sleep( 1000 );

				await RU.setMulti( R_MULTI2 );
				console.log( "finished setting multi-2" );

				resolve( "done updating MOPIDY redis cache" );

			})
			.catch( function( wError ) {
				console.log( "ERROR --> " + wError );
				reject();
			});			
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


// Addd in Different "relax" lables later to be manually started via web-panel
const HOUR = 3600000;
const DAY = 86400000;
function UPDATE_CACHE() {
	return new Promise( async function( resolve , reject ) {
		try {

			var timeNow = new Date().getTime();
			console.log( "TIME.NOW = " + timeNow.toString() );
			var lastUpdatedTime = await RU.getKey( R_LAST_UPDATE_TIME );
			console.log( "lastUpdatedTime = " + lastUpdatedTime );
			var wDiff = HOUR;
			if ( !lastUpdatedTime ) { lastUpdatedTime = "NEVER"; }
			else if ( lastUpdatedTime === null || lastUpdatedTime === undefined ) { lastUpdatedTime = "NEVER"; }
			else { wDiff = ( timeNow - parseInt( lastUpdatedTime ) ); }
			console.log( "DIFF = " + wDiff.toString() );
			console.log( ( HOUR - wDiff ).toString() +  " SECONDS REMAINING UNTIL CACHE NEEDS UPDATED" );
			
			if ( wDiff < HOUR ) { return resolve( "Already Updated Cache This Hour" ); }

			var ek = await RU.getKeysFromPattern( "MOPIDY.CACHE*" );
			//FORCED-CLEANSING
			if ( ek.length > 0 ) {
				// ek = ek.map( x => [ "del" , x  ] );
				for ( var i = 0; i < ek.length; ++i ) {
					ek[ i ] = [ "del" , ek[ i ] ];
				}
				await RU.setMulti( ek );
				await sleep( 1000 );
				console.log( "done cleansing instance" );
			}
			
			console.log( "LAST_UPDATE_TIME = " + lastUpdatedTime.toString() );
			await GET_PLAYLISTS();

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function UPDATE_PLAYLIST_GENRE() {
	return new Promise( function( resolve , reject ) {
		try {
			// wcl( "UPDATING --> " + wPlaylistID + " <-- FROM " + wOldGenre + " TO --> " + wNewGenre );
			// LIB_CACHE[ "playlists" ][ wNewGenre ][ wPlaylistID ] = LIB_CACHE[ "playlists" ][ wOldGenre ][ wPlaylistID ];
			// delete LIB_CACHE[ "playlists" ][ wOldGenre ][ wPlaylistID ];
			// WRITE_LIBRARY_CACHE();
			resolve("success");
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await sleep( 1000 );
			console.log( await UPDATE_CACHE() );
			console.log( "LIBRARY-INITIALIZED" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;
module.exports.updateCache = UPDATE_CACHE;
module.exports.updatePlaylistGenre = UPDATE_PLAYLIST_GENRE;