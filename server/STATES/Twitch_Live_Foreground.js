const RU = require( "../utils/redis_Utils.js" );
const wEmitter = require( "../../main.js" ).wEmitter;

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME = "TWITCH_LIVE_FOREGROUND";
function wStart( wUser ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var current_live = [];
			if ( wUser ) { current_live.push( wUser ); }
			else {
				current_live = await require( "../utils/twitchAPI_Utils.js" ).updateLiveUsers();
				console.log( "Current Live Twitch Users = " );
				console.log( current_live );
			}
			if ( current_live.length > 0 ) {
				var current_state = await RU.getKey( R_STATE );
				//await require( "../utils/generic.js" ).setStagedFFClientTask( { message: "TwitchLiveForeground" , playlist: current_live } );
				//await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/twitchLive" );
				const wURL = "https://twitch.tv/" + current_live[ 0 ];
				console.log( wURL );
				await require( "../firefoxManager.js" ).openTwitchURL( wURL );
				await RU.setMulti( [ [ "set" , R_STATE , R_STATE_NAME ] , [ "set" , R_PREVIOUS , current_state ] ] );
			}
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
			await require( "../firefoxManager.js" ).exitTwitch(); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wNext( wNextChannelName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			// if ( wNextChannelName ) {
			// 	wEmitter.emit( "sendFFClientMessage" , "twitchLiveNewChannel" , wNextChannelName );
			// }
			// else {
			// 	wEmitter.emit( "sendFFClientMessage" , "next" );
			// }
			await wStart( wNextChannelName );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wPrevious( wNextChannelName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( wNextChannelName ) {
				wEmitter.emit( "sendFFClientMessage" , "twitchLiveNewChannel" , wNextChannelName );
			}
			else {
				wEmitter.emit( "sendFFClientMessage" , "previous" );
			}
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