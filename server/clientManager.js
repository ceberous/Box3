const path	= require( "path" );
var CLogPrefix = "[CLIENT_MAN] --> ";
var CLogColorConfig = [ "black" , "bgWhite" ];
const CLog = require( "./utils/generic.js" ).clog;
function CLog1( wSTR ) { CLog( wSTR , CLogColorConfig , CLogPrefix ); }


const wSleep = require( "./utils/generic.js" ).wSleep;

const RU 	= require( "./utils/redis_Utils.js" );

var cached_launching_fp = null;
var cached_mode = null;
var CURRENT_STATE = null;
var BTN_MAP = require( "../config/buttons.json" );

const R_ARRIVE_HOME = "CONFIG.ARRIVED_HOME";
async function wSendButtonPressNotification( wButtonNum ) {
	const now_time = require( "./utils/generic.js" ).time();
	const dNow = new Date();
	var dHours = dNow.getHours();	
	if ( parseInt( dHours ) === 15 ) {
		const already_home = await RU.getKey( R_ARRIVE_HOME );
		if ( already_home !== null ){
			if ( already_home === "false" ) {
				await RU.setKey( R_ARRIVE_HOME , "true" );
			}
		}
	}
	//require( "./discordManager.js" ).log( ( now_time + " === " + BTN_MAP[ wButtonNum ][ "name" ] ) );
}

async function wPressButtonMaster( wButtonNum , wOptions , wMasterClose ) {
	CLog1( "wPressButtonMaster( " + wButtonNum.toString() + " )" );
	if ( wBTN_I > 20 || wBTN_I < 0 ) { return "out of range"; }
	wOptions = wOptions || BTN_MAP[ wButtonNum ][ "options" ];
	wSendButtonPressNotification( wButtonNum );
	var wBTN_I = parseInt( wButtonNum );
	if ( wBTN_I === 6 ) {
		if ( CURRENT_STATE ) {
			if ( CURRENT_STATE !== null ) {
				CLog1( "stopping CURRENT_STATE" ); 
				await CURRENT_STATE.stop();
				try { delete require.cache[ CURRENT_STATE ]; }
				catch ( e ) {}			
				CURRENT_STATE = null;
				await wSleep( 500 );
			}
		}
		if ( wMasterClose ) { await require( "./utils/generic.js" ).closeEverything(); }
		else { await require( "./utils/generic.js" ).closeCommon(); }
		return;
	}
	var launching_fp = null;
	if ( BTN_MAP[ wButtonNum ][ "state" ] || BTN_MAP[ wButtonNum ][ "session" ] ) {
		if ( BTN_MAP[ wButtonNum ][ "session" ] ) {
			launching_fp = path.join( __dirname , "SESSIONS" ,  BTN_MAP[ wButtonNum ][ "session" ] + ".js" );
			CLog1( "LAUNCHING SESSION ---> " + BTN_MAP[ wButtonNum ][ "session" ] );
		}
		else {
			launching_fp = path.join( __dirname , "STATES" ,  BTN_MAP[ wButtonNum ][ "state" ] + ".js" );
			CLog1( "LAUNCHING STATE ---> " + BTN_MAP[ wButtonNum ][ "state" ] );
		}
		if ( launching_fp === cached_launching_fp ) {
			if ( wOptions ) {
				if ( wOptions.mode ) {
					if ( wOptions.mode === cached_mode ) { return; }
				}
				else { return; }
			}
			else { return; }
		}
		if ( CURRENT_STATE ) {
			if ( CURRENT_STATE !== null ) {
				CLog1( "stopping CURRENT_STATE --> " + CURRENT_STATE );
				await CURRENT_STATE.stop(); 
				await wSleep( 1000 );
			}
		}
		require( "./utils/cecClientManager.js" ).activate();	
		try { delete require.cache[ CURRENT_STATE ]; }
		catch ( e ) {}
		CURRENT_STATE = null;
		await wSleep( 1000 );
		CURRENT_STATE = require( launching_fp );
		cached_launching_fp = launching_fp;
		if ( wOptions.mode ) { cached_mode = wOptions.mode; }
		await CURRENT_STATE.start( wOptions );
	}
	else { if ( CURRENT_STATE ) { CLog1( "STATE ACTION --> " + BTN_MAP[ wButtonNum ][ "label" ] + "()" ); CURRENT_STATE[ BTN_MAP[ wButtonNum ][ "label" ] ](); } }
}
module.exports.pressButtonMaster = wPressButtonMaster;


// MODULES
// ======================================================================
// ======================================================================
const BTN_MAN 			= require( "./buttonManager.js" );
const MOPIDY_MAN 		= require( "./mopidyManager.js" );
const SCHEDULE_MAN 		= require( "./scheduleManager.js" );
// ======================================================================
// ======================================================================

( async ()=> {
	CLog1( "Initializing stuff" );
	await require( "./discordManager.js" ).intitialize();
	await wSleep( 2000 );
	CLog1( "LOADED Discord-Client" );		
	await require( "./localMediaManager.js" ).initialize();
	await require( "./YOUTUBE/standard.js" ).update();
	CLog1( "we are done with Initialization" );
})();