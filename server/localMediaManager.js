var CLogPrefix = "[LOCAL_MEDIA_MAN] --> ";
var CLogColorConfig = [ "magenta" , "bgBlack" ];
const CLog = require( "./utils/generic.js" ).clog;
function CLog1( wSTR ) { CLog( wSTR , CLogColorConfig , CLogPrefix ); }

const wEmitter		= require( "../main.js" ).wEmitter;
//const wEmitter = new (require("events").EventEmitter); // testing only
//module.exports.wEmitter = wEmitter;
const wSleep 		= require( "./utils/generic.js" ).wSleep;
const UpdateLastPlayedTime = require( "./utils/local-media/generic.js" ).updateLastPlayedTime;

const RU = require( "./utils/redis_Utils.js" );
const RC = require( "./CONSTANTS/redis.js" ).LOCAL_MEDIA;

const MPLAYER_MAN = require( "./utils/local-media/mplayerManager.js" );


var G_NOW_PLAYING = G_R_Live_Genre_NP = G_R_NP_ShowName_Backup = null;

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Load Mount Point
			const GLOBAL_INSTANCE_MOUNT_POINT = await require( "./utils/local-media/hardDrive.js" ).reinitializeMountPoint();
			if ( !GLOBAL_INSTANCE_MOUNT_POINT ) { resolve( "no local media" ); return; }
			CLog1( "Live Mount Point === " + GLOBAL_INSTANCE_MOUNT_POINT );

			wEmitter.on( "MPlayerOVER" , async function( wResults ) {
				await UpdateLastPlayedTime( wResults );
				await wSleep( 1000 );
				// Continue if Config Says were Still Active
				const wAS = await RU.getKey( "LAST_SS.ACTIVE_STATE" );
				if ( wAS ) { 
					if ( wAS === "LOCAL_MEDIA" ) { PLAY(); }
					else { CLog1( "WE WERE TOLD TO QUIT" ); }
				}
				else { CLog1( "WE WERE TOLD TO QUIT" ); }
			});
			await RU.setKey( RC.STATUS , "ONLINE" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;

function LOCAL_MPLAY_WRAP( wFilePath , wCurrentTime ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wFilePath ) { resolve(); return; }
			CLog1( "\nSTARTING --> MPLAYER" );
			await MPLAYER_MAN.playFilePath( wFilePath );
			if ( wCurrentTime ) {
				if ( wCurrentTime > 1 ) {
					await wSleep( 1000 );
					MPLAYER_MAN.seekSeconds( wCurrentTime );
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function PLAY( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			CLog1( "play()" );
			const FinalNowPlaying = await require( "./utils/local-media/calculate.js" ).next( wOptions );
			await LOCAL_MPLAY_WRAP( FinalNowPlaying.fp , FinalNowPlaying.cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.play = PLAY;

function PAUSE( wOptions ) {
	return new Promise( function( resolve , reject ) {
		try {
			CLog1( "pause()" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.pause = PAUSE;

function RESUME( wOptions ) {
	return new Promise( function( resolve , reject ) {
		try {
			CLog1( "resume()" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.resume = RESUME;

function STOP( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			CLog1( "stop()" );
			const cur_time = MPLAYER_MAN.silentStop();
			await UpdateLastPlayedTime( cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.stop = STOP;

function NEXT( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			CLog1( "next()" );
			await STOP();
			await require( "./utils/local-media/calculate.js" ).skip();
			await PLAY();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;

function PREVIOUS( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			CLog1( "previous()" );
			await STOP();
			const previous = await require( "./utils/local-media/calculate.js" ).previous();
			await LOCAL_MPLAY_WRAP( previous.fp , previous.cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.previous	= PREVIOUS;

function SHUTDOWN_ALL() {
	return new Promise( async function( resolve , reject ) {
		try {
			await STOP();
			await wSleep( 3000 );			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.shutdown = SHUTDOWN_ALL;






// 								TESTING
// ===============================================================================================
// ===============================================================================================
// process.on( "unhandledRejection" , async function( reason , p ) {
//     console.error( reason, "Unhandled Rejection at Promise" , p );
//     console.trace();
//     //require( "./slackManager.js" ).postError( reason );
//     //await STOP();
// });
// process.on( "uncaughtException" , async function( err ) {
//     console.error( err , "Uncaught Exception thrown" );
//     console.trace();
//     //require( "./slackManager.js" ).postError( err );
//     //await STOP();
// });

// process.on( "SIGINT" , async function () {
// 	CLog1( "Shutting Down" );
// 	await STOP();
// 	await wSleep( 1000 );
// 	process.exit( 1 );
// });

// ( async ()=> {

// 	// testing only , otherwize , we get redis already from main.js
// 	await require( "./utils/redisManager.js" ).loadRedis();
// 	redis = require( "./utils/redisManager.js" ).redis;
// 	CLog1( "LOADED Redis-Client" );
// 	await require( "./slackManager.js" ).initialize();
// 	CLog1( "LOADED Slack-Client" );	
// 	// testing only

// 	await INITIALIZE();
// 	await PLAY();
// 	await wSleep( 10000 );
// 	//await NEXT();
// 	await PREVIOUS();
// 	//await require( "./slackManager.js" ).post( "online" , "media_box" );
// })();
// ===============================================================================================
// ===============================================================================================
// 								TESTING