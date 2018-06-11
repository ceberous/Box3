const Slack = require( "slack" );
var bot = null;
const wToken = require( "../personal.js" ).slack.access_token;


function POST_MESSAGE( wMessage , wChannel ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wMessage ) { resolve(); return; }
			if ( !wChannel ) { resolve(); return; }
			await bot.chat.postMessage( { token: wToken , channel: wChannel , text: wMessage  } );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.post = POST_MESSAGE;

function POST_SLACK_ERROR( wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wStatus ) { resolve(); return; }
			if ( typeof wStatus !== "string" ) {
				try { wStatus = wStatus.toString(); }
				catch( e ) { wStatus = e; }
			}
			await POST_MESSAGE( wStatus , "#mbox-err" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.postError = POST_SLACK_ERROR;

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			bot = await new Slack( { wToken } );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;