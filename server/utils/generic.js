const request = require( "request" );
require( "shelljs/global" );
const StatusKeys = require( "../CONSTANTS/redis.js" ).STATUS;

function W_SLEEP( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.wSleep = W_SLEEP;

const MonthNames = [ "JAN" , "FEB" , "MAR" , "APR" , "MAY" , "JUN" , "JUL" , "AUG" , "SEP" , "OCT" , "NOV" , "DEC" ];
function GET_NOW_TIME() {
	const today = new Date();
	
	var day = today.getDate();
	if ( parseInt( day ) < 10 ) { day = "0" + day; }
	const month = MonthNames[ today.getMonth() ];
	const year = today.getFullYear();

	var hours = today.getHours();
	if ( parseInt( hours ) < 10 ) { hours = "0" + hours; }
	var minutes = today.getMinutes();
	if ( parseInt( minutes ) < 10 ) { minutes = "0" + minutes; }	
	
	return day + month + year + " @ " + hours + ":" + minutes;
}
module.exports.time = GET_NOW_TIME;

function FIX_PATH_SPACE( wFP ) {
	var fixSpace = new RegExp( " " , "g" );
	wFP = wFP.replace( fixSpace , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}
module.exports.fixPathSpace = FIX_PATH_SPACE;

function GET_DURATION( wFP ) {
	try {
		wFP = FIX_PATH_SPACE( wFP );
		var z1 = "ffprobe -v error -show_format -i " + wFP;
		var x1 = exec( z1 , { silent: true , async: false } );
		if ( x1.stderr ) { return( x1.stderr ); }
		var wMatched = x1.stdout.match( /duration="?(\d*\.\d*)"?/ );
		var f1 = Math.floor( wMatched[1] );
		return f1;
	}
	catch( error ) { console.log( error ); }
}
module.exports.getDuration = GET_DURATION;

function SET_STAGED_FF_CLIENT_TASK( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const STAGED_FF_CLIENT_TASK = JSON.stringify( wOptions );
			await require( "./redis_Utils.js" ).setKey( "STAGED_FF_TASK" , STAGED_FF_CLIENT_TASK );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.setStagedFFClientTask = SET_STAGED_FF_CLIENT_TASK;

function GET_STAGED_FF_CLIENT_TASK( wDontParse ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var STAGED_FF_CLIENT_TASK = await require( "./redis_Utils.js" ).getKey( "STAGED_FF_TASK" );
			if ( !wDontParse ) { STAGED_FF_CLIENT_TASK = JSON.parse( STAGED_FF_CLIENT_TASK ); }
			resolve( STAGED_FF_CLIENT_TASK );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getStagedFFClientTask = GET_STAGED_FF_CLIENT_TASK;

function GET_STATUS_REPORT() {
	return new Promise( async function( resolve , reject ) {
		try {
			const wStatusReport = await require( "./redis_Utils.js" ).getMultiKeys( ...StatusKeys );
			console.log( "\n\nSTATUS REPORT ====\n" );
			console.log( wStatusReport )
			resolve( wStatusReport );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getStatusReport = GET_STATUS_REPORT;


function CHECK_STATUS( wComponent ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var isComponentLive = await require( "./redis_Utils.js" ).getKey( "STATUS." + wComponent );
			var answer = false;
			if ( isComponentLive ) {
				if ( isComponentLive === "ONLINE" ) { answer = true; }
			}
			resolve( answer );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.checkStatus = CHECK_STATUS;

function SET_STATUS( wComponent , wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "./redis_Utils.js" ).setKey( "STATUS." + wComponent , wStatus );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.setStatus = SET_STATUS;


function REBOOT_ROUTER() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wURL = "http://192.168.0.1/goform/login";
			var wBody = "loginUsername=admin&loginPassword=admin";
			console.log( wURL );
			request.post({
			  headers: { "content-type": "application/x-www-form-urlencoded" },
			  url:     wURL ,
			  body:    wBody ,
			}, function( error, response, body){
				console.log( body );
			  	var w1URL = "http://192.168.0.1/goform/RgSecurity";
				var w1Body = "UserId=&OldPassword=&Password=&PasswordReEnter=&ResRebootYes=0x01&RestoreFactoryNo=0x00&RgRouterBridgeMode=1";
				console.log( w1URL );
				request.post({
				  headers: { "content-type" : "application/x-www-form-urlencoded" },
				  url:     w1URL ,
				  body:    w1Body ,
				}, function( w1error, w1response, w1body){
				  console.log( w1body );
				  resolve();
				});

			});	

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.rebootRouter = REBOOT_ROUTER;


function RESTART_PM2() {
	return new Promise( function( resolve , reject ) {
		try {
			exec( "pm2 restartAll" , { silent: true , async: false } );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.restartPM2 = RESTART_PM2;


function OS_COMMAND( wTask ) {
	return new Promise( function( resolve , reject ) {
		try {
			var result = null;
			var x1 = exec( wTask , { silent: true , async: false } );
			if ( x1.stderr ) { result = x1.stderr }
			else { result = x1.stdout.trim() }
			resolve( result );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.osCommand = OS_COMMAND;

function CLOSE_EVERYTHING() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../mopidyManager.js" ).shutdown();
			await require( "../localMediaManager.js" ).shutdown();
			await require( "../discordManager.js" ).shutdown();
			setTimeout( ()=> {
				exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
				exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
				resolve();
			} , 2000 );	
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.closeEverything = CLOSE_EVERYTHING;


function CLOSE_COMMON() {
	return new Promise( async function( resolve , reject ) {
		try {
			exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
			exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
			resolve()
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.closeCommon = CLOSE_COMMON;