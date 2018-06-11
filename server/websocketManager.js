const ip = require("ip");
const fs = require("fs");
const path = require( "path" );

const colors = require("colors");
function wcl( wSTR ) { console.log( colors.rainbow( "[WebSocket] --> " + wSTR ) ); }

function BROADCAST_TO_ALL_CLIENTS( wsClient , wMessage , wOptions ) {
	wsClient.clients.forEach( function each( ws ) { 
		ws.send( JSON.stringify( { message: wMessage , options: wOptions } ) ); 
	});
}
module.exports.broadcast = BROADCAST_TO_ALL_CLIENTS;

function ON_CONNECTION( wSocket , wReq ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const ip = wReq.connection.remoteAddress;
			wcl( "New WebSocket Client Connected @@@ " + ip );
			const STAGED_FF_CLIENT_TASK = await require( "./utils/generic.js" ).getStagedFFClientTask();
			await require( "../main.js" ).sendStagedWebSocketMessage();
			wSocket.on( "message" ,  function( message ) {
				try { message = JSON.parse( message ); }
				catch( e ) { var a = message; message = {"message": a}; }
				switch( message.message ) {
					case "pong":
						//console.log( "inside pong()" );
						this.isAlive = true;
						break;
					case "youtubeReadyForFullScreenGlitch":
						require( "./firefoxManager.js" ).youtubeFullScreen();
						break;
					case "twitchReadyForFullScreenGlitch":
						require( "./firefoxManager.js" ).twitchFullScreen();
						break;
					case "YTStandardVideoOver":
						//clientManager.pressButtonMaster( 9 ); // next
						require( "./YOUTUBE/generic.js" ).recordVideoWatched( message.id );
						break;
					case "YTCurratedVideoOver":
						clientManager.pressButtonMaster( 9 ); // next
						break;
					case "YTRelaxingVideoOver":
						clientManager.pressButtonMaster( 9 ); // next
						break;										
					case "youtubeNowPlayingID":
						require( "./discordManager.js" ).nowPlaying( message.url );
						break;
					case "youtubeAuthHash":
						console.log( message );
						break;
					case "InstagramMediaOver":
						require( "./instagramManager.js" ).updateWatchedMedia( message.options )
						break;
					default:
						break;
				}
			});
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.onConnection = ON_CONNECTION;

function INITIALIZE( wPort ) {
	return new Promise( function( resolve , reject ) {
		try {
			const localIP = ip.address();
			const wSIP = 'var socketServerAddress = "' + localIP + '"; var socketPORT = "' + wPort + '";';	
			fs.writeFileSync( path.join( __dirname , ".." , "client" , "js" , "webSocketServerAddress.js" ) , wSIP );	
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;

// // May not be necessary , because clients seem to be automatically deleteed in simple testing
// wss_interval = setInterval( function ping() {
// 	wss.clients.forEach( function each( ws ) {
// 		if ( ws.isAlive === false ) { wcl( "terminating client" ); return ws.terminate(); }
// 		ws.isAlive = false;
// 		ws.send( JSON.stringify( { message: "ping" } ) );
// 	});
// } , 30000 );