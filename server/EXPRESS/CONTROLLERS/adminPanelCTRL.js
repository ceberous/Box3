var colors = require("colors");

var wEmitter = require('../../../main.js').wEmitter;
//var wGet_Last_SS = require( "../../clientManager.js" ).get_Last_SS;

var wMopidyGetCachedPlaylists 	= require( "../../mopidyManager.js" ).getCachedPlaylists;
var wMopidyPause 				= require( "../../mopidyManager.js" ).pause;
var wMopidyResume 				= require( "../../mopidyManager.js" ).resume;
var wMopidyStop 				= require( "../../mopidyManager.js" ).stop;
var wMopidyPreviousSong 		= require( "../../mopidyManager.js" ).previousSong;
var wMopidyNextSong 			= require( "../../mopidyManager.js" ).nextSong;
var wMopidyStartPlaylist 		= require( "../../mopidyManager.js" ).loadPlaylistID;
var wMopidyStartNewTask 		= require( "../../mopidyManager.js" ).startNewTask;
var wMopidyUpdatePlaylistGenre 	= require( "../../mopidyManager.js" ).updatePlaylistGenre;

function wcl( wSTR ) { console.log( colors.white.bgBlue( "[CLIENT_CTRL] --> " + wSTR ) ); }

function sendJSONResponse( res , status , content ) {
    if ( status ) { res.status( status ); }
    res.json( content );
}

module.exports.getStatus = function( req , res ) {
	//var wOBJ = wGet_Last_SS();
	var wOBJ = wGet_Last_SS();
	wcl( "we are in getStatus" );
	console.log( wOBJ );
	sendJSONResponse( res , 200 , wOBJ );
};

module.exports.getMopidyPlaylists = function( req , res ) {
	var wOBJ = { playlists: wMopidyGetCachedPlaylists() };
	sendJSONResponse( res , 200 , wOBJ );
};

module.exports.mopidyPause = function( req , res ) {
	wMopidyPause();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyResume = function( req , res ) {
	wMopidyResume();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyStop = function( req , res ) {
	wMopidyStop();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyPreviousSong = function( req , res ) {
	wMopidyPreviousSong();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyNextSong = function( req , res ) {
	wMopidyNextSong();
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyStartPlaylist = function( req , res ) {
	wMopidyStartPlaylist( req.params.genre , req.params.playlistID );
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyStartNewTask = function( req , res ) {
	wMopidyStartNewTask( req.params.task );
	sendJSONResponse( res , 200 , "" );
};

module.exports.mopidyUpdatePlaylistGenre = async function( req , res ) {
	var wR = await wMopidyUpdatePlaylistGenre( req.params.playlistID , req.params.oldGenre , req.params.newGenre );
	sendJSONResponse( res , 200 , { result: wR } );
};

module.exports.getSavedVideoModel = function( req , res ) {
	sendJSONResponse( res , 200 , { status: "we were here" } );
};