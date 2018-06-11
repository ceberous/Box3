const wEmitter = require( "../../main.js" ).wEmitter;

const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE;

function GET_NEXT_VIDEO() {
	return new Promise( async function( resolve , reject ) {
		try {
			var finalVideo = finalMode = null;

			// Precedance Order Unless Otherwise Segregated into Sub-States
			// 1.) Check inside redis-Personal-Store for custom youtube.com/playlists
			var finalVideo = await RU.popRandomSetMembers( RC.CURRATED.MAIN_LIST , 1 );
			if ( finalVideo.length > 0 ) { finalMode = "MAIN_LIST"; finalVideo = finalVideo[0]; }
			// 2.) If none exist , build a mini playlist of Standard Followers Latest Videos this Month
			else {
				console.log( "no videos are left in MAIN_LIST" );
				finalMode = "STANDARD";
				finalVideo = await RU.popRandomSetMembers( RC.STANDARD.LATEST , 1 );
				if ( finalVideo.length < 1 ) { console.log( "this seems impossible , but we don't have any standard youtube videos anywhere" ); resolve(); return; }
				else { finalVideo = finalVideo[0]; }
			}
			console.log( finalVideo );
			console.log( finalMode );
			// WutFace https://stackoverflow.com/questions/17060672/ttl-for-a-set-member
			await RU.setMulti( [ 
				[ "sadd" , RC.ALREADY_WATCHED , finalVideo ] ,
				[ "set" , RC.NOW_PLAYING_KEY , finalVideo ] , 
				[ "set" , RC.NOW_PLAYING_MODE , finalMode ] 
			]);			
			resolve( finalVideo );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			//await require( "../youtubeManager.js" ).updateStandard();
			var final_vid = await GET_NEXT_VIDEO();
			await require( "../../main.js" ).setStagedFFClientTask( { message: "YTStandardForeground" , playlist: [ final_vid ]  } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeStandard" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "pause" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../firefoxManager.js" ).terminateFFWithClient();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			var final_vid = await GET_NEXT_VIDEO();
			wEmitter.emit( "sendFFClientMessage" , "next" , final_vid );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() { // ehhhh needs fixed
	return new Promise( async function( resolve , reject ) {
		try {
			var final_vid = await GET_NEXT_VIDEO();
			wEmitter.emit( "sendFFClientMessage" , "next" , final_vid );
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