
function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wGenre = wOptions.genre || "UNKNOWN";
			require( "../STATES/YT_Live_Background.js" ).start();
			await require( "../STATES/Mopidy_Background_Genre.js" ).start( wGenre );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/Mopidy_Background_Genre.js" ).pause();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/Mopidy_Background_Genre.js" ).next();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/Mopidy_Background_Genre.js" ).previous();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../STATES/Mopidy_Background_Genre.js" ).stop();
			await require( "../STATES/YT_Live_Background.js" ).stop();
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