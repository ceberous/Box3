const mopidy = require( "../../mopidyManager.js" ).mopidy;

function CLEAR_LIST() {
	return new Promise( function( resolve , reject ) {
		try { mopidy.tracklist.clear().then( function( result ) { resolve( "success" ); } ); }
		catch( error ) { console.log( error ); reject( error ); } 
	});
}

function LOAD_LIST( wTrackList ) {
	return new Promise( function( resolve , reject ) {
		try { mopidy.tracklist.add( { tracks: wTrackList } ).then( function( result ) { resolve( "success" ); } ); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;
module.exports.loadList = LOAD_LIST;
module.exports.clearList = CLEAR_LIST;