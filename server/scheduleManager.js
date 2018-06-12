const path = require("path");
const schedule = require( "node-schedule" );
const RU = require( "./utils/redis_Utils.js" );

const wButtonMaster = require( "./clientManager.js" ).pressButtonMaster;

var CLogPrefix = "[SCHEDULE_MAN] --> ";
var CLogColorConfig = [ "yellow" , "bgGreen" ];
const CLog = require( "./utils/generic.js" ).clog;
function CLog1( wSTR ) { CLog( wSTR , CLogColorConfig , CLogPrefix ); }


var SCHEDULE = STATE_TRANSITIONS = UPDATE_JOBS = null;
var ACTIVE_SCHEDULES = [];

// Initialize State Transition Schedules
( async ()=> {

	CLog1( "syncing schedules" );
	SCHEDULE = require( "../config/schedules.json" );
	STATE_TRANSITIONS = SCHEDULE.STATE_TRANSITIONS;
	UPDATE_JOBS = SCHEDULE.UPDATES;

	CLog1( "setting up state transition schedules" );
	for ( var job in STATE_TRANSITIONS ) {
		
		if ( STATE_TRANSITIONS[ job ][ "startPattern" ] ) {
			ACTIVE_SCHEDULES.push({ name: job , pid: schedule.scheduleJob( STATE_TRANSITIONS[ job ][ "startPattern" ] , async function() { 
				var AllConditionsMet = true;
				if ( STATE_TRANSITIONS[ job ][ "startConditions" ] ) {
					if ( Object.keys( STATE_TRANSITIONS[ job ][ "startConditions" ] ).length > 0 ) {
						var wConditions = Object.keys( STATE_TRANSITIONS[ job ][ "startConditions" ] );
						var answers = await RU.getMultiKeys( ...wConditions );
						console.log( answers );
						if ( answers ) {
							for ( var i = 0; i < answers.length; ++i ) {
								if ( answers[ i ] !== STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] ) {
									AllConditionsMet = false;
									CLog1( answers[ i ] + " !== " + STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] );
								}
							}
						}
					}
				}
				if ( AllConditionsMet ) {
					CLog1( "starting scheduled job --> " + job );
					wButtonMaster( STATE_TRANSITIONS[ job ][ "state" ] , STATE_TRANSITIONS[ job ][ "stateOptions" ] );
				}
				else {
					CLog1( "conditions not met for --> " + job );
				}
			})});
		}

		if ( STATE_TRANSITIONS[ job ][ "stopPattern" ] ) {
			ACTIVE_SCHEDULES.push({ name: job , pid: schedule.scheduleJob( STATE_TRANSITIONS[ job ][ "stopPattern" ] , async function() {
				var AllConditionsMet = true;
				if ( STATE_TRANSITIONS[ job ][ "stopConditions" ] ) {
					if ( Object.keys( STATE_TRANSITIONS[ job ][ "stopConditions" ] ).length > 0 ) {
						var wConditions = Object.keys( STATE_TRANSITIONS[ job ][ "stopConditions" ] );
						var answers = await RU.getMultiKeys( ...wConditions );						
						if ( answers ) {
							for ( var i = 0; i < answers.length; ++i ) {
								if ( answers[ i ] !== STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] ) {
									AllConditionsMet = false;
									CLog1( answers[ i ] + " !== " + STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] );
								}
							}
						}
					}
				}
				if ( AllConditionsMet ) {
					wButtonMaster( 6 );
				}
				else { 
					CLog1( "conditions not met for --> " + job );
				}
			})});
		}
	}
})();

// Initialize Update Functions
( async ()=> {
	CLog1( "setting up update function schedules" );
	for ( var job in UPDATE_JOBS ) {
		if ( UPDATE_JOBS[ job ][ "startPattern" ] ) {
			ACTIVE_SCHEDULES.push({ name: job , pid: schedule.scheduleJob( UPDATE_JOBS[ job ][ "startPattern" ] , async function() {
				var AllConditionsMet = true;
				if ( UPDATE_JOBS[ job ][ "startConditions" ] ) {
					if ( Object.keys( UPDATE_JOBS[ job ][ "startConditions" ] ).length > 0 ) {
						var wConditions = Object.keys( UPDATE_JOBS[ job ][ "startConditions" ] );
						var answers = await RU.getMultiKeys( ...wConditions );
						console.log( answers );
						if ( answers ) {
							for ( var i = 0; i < answers.length; ++i ) {
								if ( answers[ i ] !== UPDATE_JOBS[ job ][ "startConditions" ][ wConditions[ i ] ] ) {
									AllConditionsMet = false;
									CLog1( answers[ i ] + " !== " + UPDATE_JOBS[ job ][ "startConditions" ][ wConditions[ i ] ] );
								}
							}
						}
					}
				}
				if ( AllConditionsMet ) {
					// run update function()
					const B_PATH = path.join( __dirname , ...UPDATE_JOBS[ job ][ "functionPath" ] );
					if ( UPDATE_JOBS[ job ][ "functionName" ] ) {
						require( B_PATH )[ UPDATE_JOBS[ job ][ "functionName" ] ]();
					}
					else {
						require( B_PATH )();
					}
					CLog1( "Running Scheduled FN --> " + B_PATH + " --> " + functionName );
				}
				else {
					CLog1( "conditions not met for --> " + job );
				}
			})});
		}
	}
	//console.log( ACTIVE_SCHEDULES );
})();

function ADD_SCHEDULED_JOB() {
	return new Promise( function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REMOVE_SCHEDULED_JOB() {
	return new Promise( function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.addScheduledJob = ADD_SCHEDULED_JOB;
module.exports.removeScheduledJob = REMOVE_SCHEDULED_JOB;