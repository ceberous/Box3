const path	= require( "path" );
const colors	= require( "colors" );
function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }

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
	require( "./discordManager.js" ).log( ( now_time + " === " + BTN_MAP[ wButtonNum ][ "name" ] ) );
}

async function wPressButtonMaster( wButtonNum , wOptions , wMasterClose ) {
	wcl( "wPressButtonMaster( " + wButtonNum.toString() + " )" );
	if ( wBTN_I > 20 || wBTN_I < 0 ) { return "out of range"; }
	wOptions = wOptions || BTN_MAP[ wButtonNum ][ "options" ];
	wSendButtonPressNotification( wButtonNum );
	var wBTN_I = parseInt( wButtonNum );
	if ( wBTN_I === 6 ) {
		if ( CURRENT_STATE ) {
			if ( CURRENT_STATE !== null ) {
				wcl( "stopping CURRENT_STATE" ); 
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
		}
		else {
			launching_fp = path.join( __dirname , "STATES" ,  BTN_MAP[ wButtonNum ][ "state" ] + ".js" );
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
				wcl( "stopping CURRENT_STATE" ); 
				await CURRENT_STATE.stop(); 
				await wSleep( 1000 );
			}
		}
		require( "./utils/cecClientManager.js" ).activate();		
		wcl( "LAUNCHING STATE--->" );
		wcl( launching_fp );
		try { delete require.cache[ CURRENT_STATE ]; }
		catch ( e ) {}
		CURRENT_STATE = null;
		await wSleep( 1000 );
		CURRENT_STATE = require( launching_fp );
		cached_launching_fp = launching_fp;
		if ( wOptions.mode ) { cached_mode = wOptions.mode; }
		await CURRENT_STATE.start( wOptions );
	}
	else { if ( CURRENT_STATE ) { wcl( "STATE ACTION --> " + BTN_MAP[ wButtonNum ][ "label" ] + "()" ); CURRENT_STATE[ BTN_MAP[ wButtonNum ][ "label" ] ](); } }
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
	wcl( "Initializing stuff" );
	await require( "./localMediaManager.js" ).initialize();
	await require( "./YOUTUBE/standard.js" ).update();
	wcl( "we are done with Initialization" );
})();