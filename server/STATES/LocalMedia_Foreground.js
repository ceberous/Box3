const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).LOCAL_MEDIA;

function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wOptions = wOptions || {
				genre: "TVShows" ,
				advance_show: "true" , 
				specific_show: "false" ,
				specific_episode: "false" ,
			};
			await RU.setMulti( [
				[ "set" , "LAST_SS.ACTIVE_STATE" , "LOCAL_MEDIA" ] ,
				[ "set" , RC.CONFIG.GENRE , wOptions.genre ] ,
				[ "set" , RC.CONFIG.ADVANCE_SHOW , wOptions.advance_show ] ,
				[ "set" , RC.CONFIG.SPECIFIC_SHOW , wOptions.specific_show ] ,
				[ "set" , RC.CONFIG.SPECIFIC_EPISODE , wOptions.specific_episode ] ,
			]);
			await require( "../localMediaManager.js" ).play( wOptions );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function wPause() { 
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).pause(); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function wResume() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).resume();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).stop();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.setKey( RC.CONFIG.ADVANCE_SHOW , "false" );
			await require( "../localMediaManager.js" ).next();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).previous();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.resume = wResume;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;