const RU = require( "../utils/redis_Utils.js" );

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME_GENERAL = "TWITCH_IF_LIVE_ELSE_YT_STD_FOREGROUND";
const R_STATE_NAME_TWITCH = "TWITCH_LIVE";
const R_STATE_NAME_YOUTUBE = "YOUTUBE_STANDARD";
const R_TWITCH_LIVE_TASK_PARITY = R_BASE + "TWITCH.LIVE_TASK_PARITY";

function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var CURRENT_MAN_NAME = null;
var CUR_MAN = null;
var ACTIVE_TWITCH_USER_NAME = null;

var CHECK_LIVE_INT = null;

function RESTART_AS_YOUTUBE() {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "No Live Users , Starting Youtube-Standard" );
			clearInterval( CHECK_LIVE_INT );
			if ( CUR_MAN ) { await CUR_MAN.stop(); }
			CUR_MAN = null;
			CURRENT_MAN_NAME = "youtube";
			await RU.setKey( R_TWITCH_LIVE_USERS_INDEX , 0 );
			await RU.setKey( R_STATE , R_STATE_NAME_YOUTUBE );
			try { delete require.cache[ CURRENT_MAN_NAME ]; }
			catch ( e ) {}
			CUR_MAN = null;
			CUR_MAN = require( "../STATES/Youtube.js" );
			await CUR_MAN.start( { mode: "CURRATED" , position: "FOREGROUND" } );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function LIVE_CHECK_INT() {
	return new Promise( async function( resolve , reject ) {
		try {

			var current_live = await require( "../utils/twitchAPI_Utils.js" ).updateLiveUsers( true );
			console.log( "Current Live Twitch Users = " );
			console.log( current_live );

			// Check Every 2 minutes that their are still live users
			// Start youtube standard if their are 0
			if ( current_live.length === 0 ) {
				clearInterval( CHECK_LIVE_INT );
				await RESTART_AS_YOUTUBE();
			}
			else if ( current_live.indexOf( ACTIVE_TWITCH_USER_NAME ) === -1 ) {
				await wNext();
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


const R_TWITCH_LIVE_USERS = "TWITCH.LIVE_USERS";
const R_TWITCH_LIVE_USERS_INDEX = "TWITCH.LIVE_USERS_INDEX";
const R_TWITCH_LIVE_USERS_SESSION = "TWITCH.LIVE_SESSION";
function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {

			//await require( "../utils/twitchAPI_Utils.js" ).followUserName( "lost_in_house" );
			//await wsleep( 1000 );

			var current_state = await RU.getKey( R_STATE );
			var wMulti = [ [ "set" , R_PREVIOUS , current_state ] ];
			var current_live = [];

			// If There are live twitch users , select the first one
			// else , start youtube standard
			var resetOverride = false;
			var c_index = await RU.getKey( R_TWITCH_LIVE_USERS_INDEX );
			console.log( "c_index === " + c_index );
			c_index = parseInt( c_index );
			if ( c_index !== 0 ) { resetOverride = true; }
			
			current_live = await require( "../utils/twitchAPI_Utils.js" ).updateLiveUsers( resetOverride );
			if ( current_live.length > 0 ) {
				
				ACTIVE_TWITCH_USER_NAME = await RU.getFromListByIndex( R_TWITCH_LIVE_USERS , c_index );
				console.log( "Starting Twitch User --> " + ACTIVE_TWITCH_USER_NAME );
				if ( ACTIVE_TWITCH_USER_NAME === null ) { await RESTART_AS_YOUTUBE(); }
				else {
					wMulti.push( [ "set" , R_STATE , R_STATE_NAME_TWITCH ] );
					CURRENT_MAN_NAME = "twitch";
					CUR_MAN = require( "../STATES/Twitch_Live_Foreground.js" );
					await CUR_MAN.start( ACTIVE_TWITCH_USER_NAME );
					CHECK_LIVE_INT = setInterval( LIVE_CHECK_INT , 60000 );
					//if ( c_index === 0 ) { await RU.incrementInteger( R_TWITCH_LIVE_USERS_INDEX ); }
				}
			}
			else { await RESTART_AS_YOUTUBE(); }

			await RU.setMulti( wMulti );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			await CUR_MAN.pause();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.setKey( R_TWITCH_LIVE_USERS_INDEX , 0 );
			await CUR_MAN.stop();
			if ( CHECK_LIVE_INT ) { clearInterval( CHECK_LIVE_INT ); }
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( CURRENT_MAN_NAME === "twitch" ) {
				await RU.incrementInteger( R_TWITCH_LIVE_USERS_INDEX );
				await wsleep( 1000 );
				var c_index = await RU.getKey( R_TWITCH_LIVE_USERS_INDEX );
				console.log( "c_index === " + c_index );
				ACTIVE_TWITCH_USER_NAME = await RU.getFromListByIndex( R_TWITCH_LIVE_USERS , c_index );
				if ( ACTIVE_TWITCH_USER_NAME !== null ) {
					await CUR_MAN.next( ACTIVE_TWITCH_USER_NAME );
				}
				else {
					await RESTART_AS_YOUTUBE();
				}
			}
			else {
				await CUR_MAN.next();
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( CURRENT_MAN_NAME === "twitch" ) {
				var c_index = await RU.getKey( R_TWITCH_LIVE_USERS_INDEX );
				console.log( "c_index === " + c_index );
				c_index = parseInt( c_index );
				if ( c_index === 0 ) { await RESTART_AS_YOUTUBE(); resolve(); return; }
				else {
					await RU.decrementInteger( R_TWITCH_LIVE_USERS_INDEX );
					c_index = await RU.getKey( R_TWITCH_LIVE_USERS_INDEX );
					ACTIVE_TWITCH_USER_NAME = await RU.getFromListByIndex( R_TWITCH_LIVE_USERS , c_index );
					await CUR_MAN.previous( ACTIVE_TWITCH_USER_NAME );
				}
				
			}
			else {
				await CUR_MAN.previous();
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
