//var wEmitter = new (require('events').EventEmitter);

const xdo_GETID = require( "./xdotoolWrapper.js" ).getWindowIDFromName;
const xdo_SET_FULL = require( "./xdotoolWrapper.js" ).setFullScreenWithFKey;

require("shelljs/global");
const net = require("net");
const fs = require("fs");
const spawn = require('child_process').spawn;
const path = require("path");
const colors = require("colors");
const rimraf = require("rimraf");

//const TMP_DIR_PATH = path.join( __dirname , "TMP2" );
var   TMP_DIR_PATH = null;
const SET_RANDOM_TMP_DIR = function() { TMP_DIR_PATH = "TMP_" + Math.random().toString(36).slice(2, 8); TMP_DIR_PATH = path.join( __dirname , TMP_DIR_PATH ) };
function REMOVE_TMP_DIR() { 
	return new Promise( function( resolve , reject ) { 
		try { 
			console.log("trying to remove TMP_DIR = " + TMP_DIR_PATH );
			rimraf( TMP_DIR_PATH , function () { 
				resolve("done"); 
			}); 
		} 
		catch( error ) { reject( error ); } 
	}); 
};
const CREATE_TMP_DIR = async function() { if ( fs.existsSync( TMP_DIR_PATH ) ){ await REMOVE_TMP_DIR(); fs.mkdirSync( TMP_DIR_PATH ); } else { fs.mkdirSync( TMP_DIR_PATH ); } };
//var  StreamlinkLauncher_FP = path.join( TMP_DIR_PATH , "streamlinkLauncher.js" );
var   StreamlinkLauncher_FP = null;
const SET_STREAMLINK_LAUNCHER_FP = function() { StreamlinkLauncher_FP = path.join( TMP_DIR_PATH , "streamlinkLauncher.js" ); };
//const MPV_SOCKET_FP = path.join( TMP_DIR_PATH , "mpv.sock" );
var   MPV_SOCKET_FP = null;
const SET_MPV_SOCKET_FP = function() { MPV_SOCKET_FP = path.join( TMP_DIR_PATH , "mpv.sock" ); };


const wcl = function( wSTR ) { console.log( colors.black.bgCyan( "[STREAMLINK_MAN] --> " + wSTR ) ); };
const sleep = function( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); };

function createTMP_DIR() {
	return new Promise( async function( resolve , reject ) {
		try {
			await REMOVE_TMP_DIR();
			CREATE_TMP_DIR();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});f
}


// https://mpv.io/manual/master/#property-list
// https://mpv.io/manual/master/#list-of-input-commands

// https://mpv.io/manual/master/#json-ipc
// https://mpv.io/manual/master/#commands
var wMPVSocketClient = null;
var wMPVSocketListenInterval = null;
var wPAUSED = true;
var wLAST_EVENT = null;
var wSTATUS = null;
var wELAPSED_TIME = null;
var wMPV_WID = null;
async function startSocketListeners() {
	
	console.log("inside startSocketListeners() aka mpv.sock .connect()");
	//await sleep( 10000 );

	async function load_ON_DATA_HANDLER() {
		wMPVSocketClient.on( "data" , function( wData ) {
			var wSTR = wData;
			try { wData = JSON.parse( wData ); }
			catch( error ) { wData = false; }
			//console.log( wData );
			if ( wData ) {
				if ( wData.event ) { wLAST_EVENT = wData.event }
				wSTATUS = wData.error;
				wELAPSED_TIME = wData.data;
				if ( !wPAUSED && parseInt( wELAPSED_TIME ) > 1 ) { wPAUSED = true; }
			}
			wcl( wLAST_EVENT + " === " + wSTATUS + " === " + wELAPSED_TIME ); 
		});
		await sleep( 3000 );
		startMPVStatusListener();
		wFullScreen();
	}

	wMPVSocketClient = net.createConnection( MPV_SOCKET_FP );
	wMPVSocketClient.on( "connect" , function() { wcl( "CONNECTED TO UNIX-SOCKET !!!!" ); load_ON_DATA_HANDLER(); } );
	wMPVSocketClient.on( "end" , function() { clearInterval( wMPVSocketListenInterval ); wcl( "DISCONNECTED FROM UNIX-SOCKET !!!!" ); } );
	
}

async function startMPVStatusListener() { wMPVSocketListenInterval = setInterval( function() { wGetStatus(); } , 3000 );  }

async function LAUNCH_STREAM_LINK_MPV( wURL , wQuality , wPlayerOptions ) {

	SET_RANDOM_TMP_DIR();
	await CREATE_TMP_DIR();
	await sleep( 1000 );
	SET_STREAMLINK_LAUNCHER_FP();
	SET_MPV_SOCKET_FP();

	await sleep( 3000 );
	//exec( "pkill -9 mpv" , { silent: true , async: false } );
	//await sleep( 300 );
	//exec( "pkill -9 streamlink" , { silent: true , async: false } );
	//await sleep( 300 );

	var SL_CMD = `streamlink --hls-segment-threads=4 --hls-live-edge=3 --ringbuffer-size=196M ${wURL} ${wQuality}`;
	SL_CMD = SL_CMD + " --verbose-player --player-no-close";
	wPlayerOptions = wPlayerOptions || "";
	SL_CMD = SL_CMD + " -p 'mpv --input-unix-socket=" + MPV_SOCKET_FP + " " + wPlayerOptions + "'";
	console.log( "\n" + SL_CMD );
	
	var WRITE_STR = "var cp = require(\"child_process\"); cp.exec( \""+ SL_CMD +"\" ); setTimeout( function() { process.exit(0); } , 10000 );";
	console.log( "\n" + WRITE_STR );
	fs.writeFileSync( StreamlinkLauncher_FP , WRITE_STR );
	
	await sleep ( 1000 );
	var x1 = spawn( "node" , [ StreamlinkLauncher_FP ], {
	    stdio: 'ignore',
	    detached: true
	}); // child._channel.unref()
	
	await sleep ( 10000 );
	x1.unref();

	await sleep( 40000 );
	startSocketListeners();

}


function wQuit() {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "inside wQuit from StreamLinkManager.js" );
			console.log( "Current mpv.sock PATH = " + MPV_SOCKET_FP );
			
			try { wPROC_QUIT(); console.log( "sent ['quit' , '1'] to --> mpv.sock" ); }
			catch( err ) { /*console.log(err); */ }
			await sleep( 1000 );
			
			try { fs.unlinkSync( MPV_SOCKET_FP ); console.log( "mpv.sock unlinked" ); }
			catch( err ) { /*console.log(err); */ }	

			
			// DO NOT ER EVER CALL UNLESS YOU MPV TO NOT CLOSE SOCKET CORRECTLY
			// https://github.com/streamlink/streamlink/commit/c38d020086079b7807e80ead4e91db1e5f1d84ec
			//wMPVSocketClient.destroy(); 
			
			await sleep( 300 );
			await REMOVE_TMP_DIR();
			console.log( "TMP_DIR_PATH removed" );
			
			await sleep( 3000 );			
			exec( "pkill -9 mpv" , { silent: true , async: false } );
			exec( "pkill -9 streamlink" , { silent: true , async: false } );

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}
function wFullScreen() { wMPV_WID = xdo_GETID( "mpv" ); xdo_SET_FULL( wMPV_WID ); }
function wGetStatus() { wMPVSocketClient.write( '{ "command": ["get_property", "playback-time"] }\r\n' ); }
function wPROC_QUIT() { wMPVSocketClient.write( '{ "command": ["quit", "1"] }\r\n' ); }

module.exports.openLink = LAUNCH_STREAM_LINK_MPV;
module.exports.quit = wQuit;
module.exports.fullscreen = wFullScreen;
module.exports.getCurrentTime = wGetStatus;