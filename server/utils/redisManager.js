const REDIS = require("redis");
function LOAD_REDIS() {
	return new Promise( async function( resolve , reject ) {
		try {
			const R_INIT_CONFIG = require( "../../config/redis.json" );
			redis = await REDIS.createClient({ 
				host: R_INIT_CONFIG[ "CONNECTION" ][ "HOST" ] ,
				port: R_INIT_CONFIG[ "CONNECTION" ][ "PORT" ] ,
				db: R_INIT_CONFIG[ "CONNECTION" ][ "DATABASE_NUM" ] ,
				retry_strategy: function ( options ) {
			        if ( options.error && options.error.code === "ECONNREFUSED" ) {
			            // End reconnecting on a specific error and flush all commands with
			            // a individual error
			            return new Error( "The server refused the connection" );
			        }
			        if ( options.total_retry_time > 1000 * 60 * 60 ) {
			            // End reconnecting after a specific timeout and flush all commands
			            // with a individual error
			            return new Error( "Retry time exhausted" );
			        }
			        if ( options.attempt > 20 ) {
			            // End reconnecting with built in error
			            return undefined;
			        }
			        // reconnect after
			        return Math.min( options.attempt * 100 , 3000 );
			    }
			});
			module.exports.redis = redis;
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.loadRedis = LOAD_REDIS;