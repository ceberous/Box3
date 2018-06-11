const RU = require( "../utils/redis_Utils.js" );

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME = "PEER_CALL_FOREGROUND";


function recieveCall( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			//{ alertEmails: [] , recievedCall: true , url: wExtendedCapture } 
			if ( wOptions.url ) {
				var current_state = await RU.getKey( R_STATE );
				await require( "../../main.js" ).setStagedFFClientTask( { message: "PeerCall" , url:  wOptions.url } );
				await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/peerCall" );
				await RU.setMulti( [ [ "set" , R_STATE , R_STATE_NAME ] , [ "set" , R_PREVIOUS , current_state ] ] );
			}
			if ( wOptions.alertEmails ) {
				for ( var i = 0; i < wOptions.alertEmails.length; ++i ) {
					await require( "../emailManager.js" ).sendEmail( wFull_Call_URL  , "HALEY_IS_CALLING_YOU" , wOptions.alertEmails[ i ] )
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function generateRandomCallURL() {
	//cc318b3d-9511-4a43-9a9c-526c6b4d1328
	function gRL( wLength ) {
		let str = "";
		while( str.length < wLength ) str += Math.random().toString(36).substr(2);
		return str.substr( 0 , wLength );
	}
	return gRL( 8 ) + "-" + gRL( 4 ) + "-" + gRL( 4 ) + gRL( 4 ) + "-" + gRL( 12 );
}

function placeCall( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var wCall_URL = generateRandomCallURL();
			var wFull_Call_URL = "https://peercalls.com/call/" + wCall_URL;
			var current_state = await RU.getKey( R_STATE );
			await require( "../../main.js" ).setStagedFFClientTask( { message: "PeerCall" , url: wCall_URL } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/peerCall" );
			await RU.setMulti( [ [ "set" , R_STATE , R_STATE_NAME ] , [ "set" , R_PREVIOUS , current_state ] ] );

			for ( var i = 0; i < wOptions.alertEmails.length; ++i ) {
				await require( "../emailManager.js" ).sendEmail( wFull_Call_URL  , "HALEY_IS_CALLING_YOU" , wOptions.alertEmails[ i ] )
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( wOptions );
			if ( wOptions.recievedCall ) {
				await recieveCall( wOptions );
			}
			else {
				await placeCall( wOptions );
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {

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

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;