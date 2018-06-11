const RU = require( "../redis_Utils.js" );
const mopidy = require( "../../mopidyManager.js" ).mopidy;
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
const R_KEY_BASE = "MOPIDY.CACHE."
const R_LAST_SS_BASE = "LAST_SS.MOPIDY.";
const R_CONTINOUS_PLAY = R_LAST_SS_BASE + "CONTINUOUS_PLAY";
module.exports.restart =  function() {
	return new Promise( async function( resolve , reject ) {
		try {

			var now_playing_button_genre = await RU.getKey( R_CONTINOUS_PLAY );
			if ( now_playing_button_genre === null ) { now_playing_button_genre = "UNKNOWN"; }
			console.log( "RESTARTING LIVE RANDOM GENRE LIST -- " + now_playing_button_genre );
			
			const R_K1 = R_KEY_BASE + now_playing_button_genre;
			var random_list = await RU.popRandomSetMembers( R_K1 , 25 );
			random_list = random_list.map( x => JSON.parse( x ) );
			// for ( var i = 0; i < random_list.length; ++i ) {
			// 	random_list[ i ] = JSON.parse( random_list[ i ] );
			// }
			await require( "./tracklistManager.js" ).clearList();
			await require( "./tracklistManager.js" ).loadList( random_list );
			await require( "./playbackManager.js" ).play();
			await sleep( 2000 );
			await require( "./playbackManager.js" ).getState();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
};