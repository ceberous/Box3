function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.rebootRouter = function( req , res ) { 
	require( "../../utils/generic.js" ).rebootRouter();
	sendJSONResponse( res , 200 , { message: "Rebooted Router" } ); 
};

module.exports.restartPM2 = function( req , res ) {
	require( "../../utils/generic.js" ).restartPM2();
	sendJSONResponse( res , 200 , { message: "pm2 restartAll" } ); 
};

module.exports.tvPower = function( req , res ) {
	require( "../../utils/cecClientManager.js" ).activate();
	sendJSONResponse( res , 200 , { message: "Toggling TV Power" } ); 
};

module.exports.osCommand = async function( req , res ) {
	const wResult = await require( "../../utils/generic.js" ).osCommand( req.params.task );
	sendJSONResponse( res , 200 , { message: "exec( " + req.params.task + " )" , result: wResult } ); 
};