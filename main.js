process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});
require("shelljs/global");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const wEmitter = new (require("events").EventEmitter);
module.exports.wEmitter = wEmitter;

const port = process.env.PORT || 6969;
const ip = require("ip");

const WebSocket = require( "ws" );

var CLogPrefix = "[MAIN] --> ";
var CLogColorConfig = [ "green" , "bgBlack" ];
function wcl( wSTR ) { console.log( colors.green.bgBlack( CLogPrefix + wSTR ) ); }
const CLog = require( "./server/utils/generic.js" ).clog;
function CLog1( wSTR ) { CLog( wSTR , CLogColorConfig , CLogPrefix ); }

const wsleep = require( "./server/utils/generic.js" ).wSleep;

// Need to Switch Client Stuff to this -->
// https://bulma.io/documentation/overview/start/
// https://github.com/jaredhanson/connect-ensure-login
// https://scotch.io/tutorials/easy-node-authentication-google
// https://github.com/jaredhanson/passport-google-oauth2
// https://stackoverflow.com/questions/15016551/node-js-express-passport-cookie-expiration#15127998

// sudo leafpad /etc/xdg/lxsession/LXDE/autostart
// xrandr -q
// @xrandr --auto --output HDMI1 --primary --mode 1920x1080+0+0 --right-of eDP1
// @xrandr --auto --output eDP1 --primary --mode 1366x768+0+0 --left-of HDMI1

var INIT_CONFIG = app = redis = wsManger = localIP = wSIP = server = wss = STAGED_FF_CLIENT_TASK = wss_interval = clientManager = null;

function SEND_STAGED_WS_MESSAGE() {
	return new Promise( async function( resolve , reject ) {
		try {
			var STAGED_FF_CLIENT_TASK = await require( "./server/utils/generic.js" ).getStagedFFClientTask( true );
			CLog1( "Sending Staged FF Client Task to Websocket Clients = " + STAGED_FF_CLIENT_TASK );
			wss.clients.forEach( function each( ws ) {
				ws.send( STAGED_FF_CLIENT_TASK );
			});
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

( async ()=> {
	
	wcl( "starting" );

	require( "./config/writer.js" );
	await require( "./server/utils/generic.js" ).wSleep( 500 );	
	await require( "./server/utils/redisManager.js" ).loadRedis();
	wcl( "LOADED Redis-Client" );
	await require( "./server/utils/generic.js" ).wSleep( 2000 );
	await require( "./server/utils/config.js" ).saveConfigToRedis();

	app = require( "./server/EXPRESS/expressAPP.js" );
	server = require( "http" ).createServer( app );
	wss = new WebSocket.Server({ server });

	await require( "./server/discordManager.js" ).intitialize();
	await require( "./server/utils/generic.js" ).wSleep( 2000 );
	wcl( "LOADED Discord-Client" );	

	clientManager = await require("./server/clientManager.js");
	wcl( "LOADED ClientManager" );

	await require( "./server/websocketManager.js" ).initialize( port );
	wss.on( "connection" , require( "./server/websocketManager.js" ).onConnection ); 
	wEmitter.on( "sendFFClientMessage" , async function( wMessage , wOptions ) {
		await require( "./server/websocketManager.js" ).broadcast( wss , wMessage , wOptions )
	});
	module.exports.sendStagedWebSocketMessage = SEND_STAGED_WS_MESSAGE;
	
	wcl( "LOADED FF-Client Web-Socket Stuff" );

	server.listen( port , async function() {
		const localIP = ip.address();
		wcl( "\tServer Started on :" );
		wcl( "\thttp://" + localIP + ":" + port );
		wcl( "\t\t or" );
		wcl( "\thttp://localhost:" + port );
	});

	process.on( "unhandledRejection" , async function( reason , p ) {
	    await require( "./server/discordManager.js" ).error( reason );
	});
	process.on( "uncaughtException" , async function( err ) {
	    await require( "./server/discordManager.js" ).error( err );
	});

	process.on( "SIGINT" , async function () {
		//wEmitter.emit( "closeEverything" );
		await clientManager.pressButtonMaster( 6 , {} , true );
		process.exit(1);
	});

	await require( "./server/utils/generic.js" ).getStatusReport();
	await require( "./server/utils/generic.js" ).wSleep( 2000 );
	CLog1( "Server Online" );

})();