const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require( "cors" );
const ejs = require("ejs");


const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 6969;

// View Engine Setup
app.set( "views" , path.join( __dirname , "../../client" , "views" ) );
app.set( "view engine" , 'ejs' );
app.engine( 'html' , require('ejs').renderFile );

// Set Static Folder
app.use( express.static( path.join( __dirname , "../../client"  ) ) );

// Setup Middleware
//app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );


// Cross-Origin Stuff
// app.use( cors() );
// 
// 

const whitelist = [ "http://localhost:6969/youtubeAuth" ,  "https://accounts.google.com" , "https://google.com" ];
const corsOptions = {
  origin: "*" ,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE" ,
  preflightContinue: true ,
  optionsSuccessStatus: 204 ,

}


// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// Main-Routes
app.get( "/" , function( req , res , next ) {
	res.render( 'index.html' );
});

const specialRoutes = require( "./ROUTES/specialRTR.js" );
app.use( "/special/" , specialRoutes );

const adminPanelRoutes = require( "./ROUTES/adminPanelRTR.js" );
app.use( "/admin/v1/" , adminPanelRoutes );
app.get( "/admin" , function( req , res , next ) {
	res.render( 'adminPanel.html' );
});
const buttonsRoutes = require( "./ROUTES/buttonsRTR.js" );
app.use('/buttonpress/' , buttonsRoutes );

// Youtube-Routes
app.get( "/youtube" , function( req , res , next ) {
	res.render( "youtube.html" );
});
app.get( "/youtubeAuth" , cors( corsOptions ) , function( req , res , next ) {
	res.render( "youtubeAuth.html" );
});
app.get( "/youtubeLiveBackground" , function( req , res , next ) {
	res.render( "youtubeLiveBackground.html" );
});
const youtubeRoutes = require( "./ROUTES/youtubeRTR.js" );
app.use( "/youtube/" , youtubeRoutes );

// Twitch-Routes
app.get( "/twitchLive" , function( req , res , next ) {
	res.render( "twitchLive.html" );
});
const twitchRoutes = require( "./ROUTES/twitchRTR.js" );
app.use( "/twitch/" , twitchRoutes );

app.use( "/peerCall" , function( req , res , next ) {
	res.render( "peerCall.html" );
});

app.use( "/instagram" , function( req , res , next ) {
	res.render( "instagram.html" );
});

module.exports = app;