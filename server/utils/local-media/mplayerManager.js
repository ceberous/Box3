const path = require("path");
const spawn = require("child_process").spawn;
const colors = require("colors");
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
function wcl( wSTR ) { console.log( colors.black.bgMagenta( "[MPLAYER_MAN] --> " + wSTR ) ); }

function fixPathSpace(wFP) {
	var fixSpace = new RegExp( " " , "g" );
	wFP = wFP.replace( fixSpace , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}
var wEmitter = require( "../../../main.js" ).wEmitter;

const mplayerWrapperScript_FP = path.join( __dirname , "mplayerWrapper.js" );
var wPROC = null;
var wPROC_STATUS = null;
var wPROC_DURATION = null;
var wPROC_TIME = null;

var EMIT_OVER_EVENT = true;
function cleanupChildPROC() {
	try{wPROC.unref();}
	catch(e){}
	if ( EMIT_OVER_EVENT ) { wEmitter.emit( "MPlayerOVER" , wPROC_TIME ); }
	wcl( "Media is Over !!!" );
}
function wPlayFilePath( wFP ) {
	return new Promise( async function( resolve , reject ) {
		try {
			EMIT_OVER_EVENT = true;
			
			process.env.mplayerFP = fixPathSpace( wFP );
			wcl( process.env.mplayerFP );

			var wOptions = {
				stdio: [ "pipe" , 1 , 2 , "ipc" ], // === 2 way communication
				//stdio: [ null , null , 2 , "ipc" ], // === 1 way , from child to parent only
				env: process.env
			}; 

			wPROC = spawn( "node" , [ mplayerWrapperScript_FP ] , wOptions );
			wPROC.on( "message" , function( wMessage ) {
				if ( wMessage.ended ) { if ( wMessage.ended === "UNREF_ME" ) { wPROC_TIME = Math.floor( wMessage.time ); cleanupChildPROC();  } }
				if ( wMessage.status ) { /* console.log( wMessage.status ); */  wPROC_STATUS = wMessage.status; wPROC_DURATION = Math.floor( wMessage.status.duration ); }
				if ( wMessage.time ) { var x1 = Math.floor( wMessage.time ); wPROC_TIME = ( x1 >= 1 ) ? x1 : wPROC_TIME; }
			});
			// Disable Subtitles **hack**
			await sleep( 1000 );
			require( "../xdotoolWrapper.js" ).pressKeyboardKey( "v" ); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wQuit() { if ( wPROC !== null ) { wPROC.send( "quit" ); wPROC = null; return wPROC_TIME;  } }
function wPause() { if ( wPROC !== null ) { wPROC.send( "pause" ); return wPROC_TIME; } }
function wStop( wIgnoreOverEvent ) { if ( wPROC !== null ) {
	if ( wIgnoreOverEvent ) { IGNORE_OVER_EVENT = true; console.log( "\nignore event === true\n" ); }
	try { wPROC.send( "stop" ); }
	catch(e){ /*console.log(e);*/ }
	wPROC = null; 
	return wPROC_TIME;
}}
function wSilentStop() {
	EMIT_OVER_EVENT = false;
	try { wPROC.send( "stop" ); }
	catch(e){ /*console.log(e);*/ }
	wPROC = null; 
	return wPROC_TIME;
}
function wSeekSeconds( wSeconds ) { if ( wPROC !== null ) { wcl( "Seeking --> " + wSeconds.toString() ); wPROC.send( "seekSeconds/" + wSeconds.toString() ); } }
function wSeekPercent( wPercent ) { if ( wPROC !== null ) { wPROC.send( "seekPercent/" + wPercent.toString() ); } }
function wHideSubtitles() { if ( wPROC !== null ) { wPROC.send( "hideSubtitles" ); } }
function wFullScreen() { if ( wPROC !== null ) { wPROC.send( "fullscreen" ); } }
function wGetCurrentTime() { return wPROC_TIME; }
function wGetDuration() { return wPROC_DURATION; }


module.exports.playFilePath = wPlayFilePath;
module.exports.quit = wQuit;
module.exports.pause = wPause;
//module.exports.stop = wStop;
module.exports.silentStop = wSilentStop;
module.exports.seekSeconds = wSeekSeconds;
module.exports.seekPercent = wSeekPercent;
module.exports.hideSubtitles = wHideSubtitles;
module.exports.fullscreen = wFullScreen;
module.exports.getCurrentTime = wGetCurrentTime;
module.exports.getDuration = wGetDuration;