const wPressButtonMaster = require( "../../clientManager.js" ).pressButtonMaster;
const ButtonNames = require( "../../../config/buttons.json" );

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.press0 = function( req , res ) { wPressButtonMaster( 0 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 0 ].name } ); }
module.exports.press1 = function( req , res ) { wPressButtonMaster( 1 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 1 ].name } ); }
module.exports.press2 = function( req , res ) { wPressButtonMaster( 2 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 2 ].name } ); }
module.exports.press3 = function( req , res ) { wPressButtonMaster( 3 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 3 ].name } ); }
module.exports.press4 = function( req , res ) { wPressButtonMaster( 4 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 4 ].name } ); }
module.exports.press5 = function( req , res ) { wPressButtonMaster( 5 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 5 ].name } ); }
module.exports.press6 = function( req , res ) { wPressButtonMaster( 6 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 6 ].name } ); }
module.exports.press7 = function( req , res ) { wPressButtonMaster( 7 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 7 ].name } ); }
module.exports.press8 = function( req , res ) { wPressButtonMaster( 8 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 8 ].name } ); }
module.exports.press9 = function( req , res ) { wPressButtonMaster( 9 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 9 ].name } ); }
module.exports.press10 = function( req , res ) { wPressButtonMaster( 10 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 10 ].name } ); }
module.exports.press11 = function( req , res ) { wPressButtonMaster( 11 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 11 ].name } ); }
module.exports.press12 = function( req , res ) { wPressButtonMaster( 12 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 12 ].name } ); }
module.exports.press13 = function( req , res ) { wPressButtonMaster( 13 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 13 ].name } ); }
module.exports.press14 = function( req , res ) { wPressButtonMaster( 14 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 14 ].name } ); }
module.exports.press15 = function( req , res ) { wPressButtonMaster( 15 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 15 ].name } ); }
module.exports.press16 = function( req , res ) { wPressButtonMaster( 16 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 16 ].name } ); }
module.exports.press17 = function( req , res ) { wPressButtonMaster( 17 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 17 ].name } ); }
module.exports.press18 = function( req , res ) { wPressButtonMaster( 18 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 18 ].name } ); }
module.exports.press19 = function( req , res ) { wPressButtonMaster( 19 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 19 ].name } ); }
module.exports.press20 = function( req , res ) { wPressButtonMaster( 20 ); sendJSONResponse( res , 200 , { buttonPress: ButtonNames[ 20 ].name } ); }