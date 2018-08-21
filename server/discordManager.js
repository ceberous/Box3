// https://qeled.github.io/discordie/#/docs/GettingStarted.md?_k=n7hmct
// https://qeled.github.io/discordie/#/docs/IDirectMessageChannel?_k=658zxz

// https://support.discordapp.com/hc/en-us/articles/225977308--Windows-Discord-Hotkeys

const Eris = require( "eris" );
var discordBot = null;
var discordCreds = null;

function POST_ID( wMessage , wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordBot ) { resolve(); return; }
			await discordBot.createMessage( wChannelID , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}
module.exports.postID = POST_ID;

function POST_NOW_PLAYING( wMessage ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordBot ) { resolve(); return; }
			await discordBot.createMessage( discordCreds.channels.now_playing , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.nowPlaying = POST_NOW_PLAYING;

function POST_LOG( wMessage ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordBot ) { resolve(); return; }
			await discordBot.createMessage( discordCreds.channels.log , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.log = POST_LOG;

function POST_ERROR( wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordBot ) { resolve(); return; }
			if ( !wStatus ) { resolve(); return; }
			if ( typeof wStatus !== "string" ) {
				try { wStatus = wStatus.toString(); }
				catch( e ) { wStatus = e; }
			}
			await discordBot.createMessage( discordCreds.channels.error , wStatus );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.error = POST_ERROR;

function SHUTDOWN() {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.disconnect();			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.shutdown = SHUTDOWN;

function GetButtonInfo() {
	wChannelID = wChannelID || discordCreds.channels.log;
	try { delete require.cache[ "../config/buttons.json" ]; }
	catch ( e ) {}
	var state_names = require( "../config/buttons.json" );
	var reply_string = "";
	for ( var state in state_names ) {
		reply_string = reply_string + "!btn " + state + " === " + state_names[ state ][ "name" ] + "\n";
	}
	return reply_string;
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			discordCreds = require( "../personal.js" ).discord;
			//discordBot = new Eris( discordCreds.token );
			discordBot = new Eris.CommandClient( discordCreds.token , {} , {
				description: "MediaBrowser Controller",
				owner: discordCreds.bot_id ,
				prefix: "!"
			});

			// https://github.com/abalabahaha/eris/blob/master/lib/command/CommandClient.js#L301

			// discordBot.on( "messageCreate" , async ( msg ) => {
				
			// 	if ( msg[ "author" ][ "id" ] === discordCreds.bot_id ) { return; }
			// 	// Restrict to Only now_playing channel
			// 	//if ( msg.channel.id !== discordCreds.channels.now_playing ) { return; }

			// });

			// Buttons
			// ========================================================================================
			// ========================================================================================
				var buttonsCommand = discordBot.registerCommand( "button" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "3" );
					}
					return;
				}, {
					description: "Run Numeric Button State",
					fullDescription: "Run Numeric Button State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "btn" , "button" );

				var stopCommand = discordBot.registerCommand( "stop" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "6" );
					}
					return;
				}, {
					description: "Stop",
					fullDescription: "Stop",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "quit" , "stop" );

				var pauseCommand = discordBot.registerCommand( "pause" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "7" );
					}
					return;
				}, {
					description: "Pause",
					fullDescription: "Pause",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				var previousCommand = discordBot.registerCommand( "previous" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "8" );
					}
					return;
				}, {
					description: "Previous",
					fullDescription: "Previous",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});	

				var nextCommand = discordBot.registerCommand( "next" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "9" );
					}
					return;
				}, {
					description: "Next",
					fullDescription: "Next",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
			// ========================================================================================
			// Buttons=================================================================================

			// Common State Names
			// ========================================================================================
			// ========================================================================================
				var relaxCommand = discordBot.registerCommand( "relax" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "16" );
					}
					return;
				}, {
					description: "Start Relaxing Youtube Videos" ,
					fullDescription: "Start Relaxing Youtube Videos" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "relaxing" , "relax" );

				var odyseeyCommand = discordBot.registerCommand( "odyseey" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "11" );
					}
					return;
				}, {
					description: "Start Adventures in Odyseey with YT Live Background" ,
					fullDescription: "Start Adventures in Odyseey with YT Live Background" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "od" , "odyseey" );
				discordBot.registerCommandAlias( "aio" , "odyseey" );

				var musicCommand = discordBot.registerCommand( "music" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "1" );
					}
					return;
				}, {
					description: "Play Mopidy Music" ,
					fullDescription: "Play Mopidy Music" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "mopidy" , "music" );

				musicCommand.registerSubcommand( "edm" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "2" );
					}
					return;
				}, {
					description: "Play Mopdiy EDM Music",
					fullDescription: "Play Mopdiy EDM Music",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				musicCommand.registerSubcommand( "relax" , ( msg , args ) => {
					if( args.length === 0 ) {
						//require( "./clientManager.js" ).pressButtonMaster( "2" );
						return "Not Setup Yet";
					}
					return;
				}, {
					description: "Play Mopdiy Relaxing Music",
					fullDescription: "Play Mopdiy Relaxing Music",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});				
				
			// ========================================================================================
			// Common State Names======================================================================

			
			// Youtube
			// ========================================================================================
			// ========================================================================================
				var youtubeCommand = discordBot.registerCommand( "youtube" , ( msg , args ) => {
					if( args.length === 0 ) {
						// Start Currated As Default
						require( "./clientManager.js" ).pressButtonMaster( "15" );
						return;
					}
					var final_options = { position: "FOREGROUND" };
					if ( args[ 0].indexOf( "watch?v=" ) !== -1 ) {
						final_options.mode = "SINGLE";
						final_options.single_id = args[ 0 ].split( "watch?v=" )[ 1 ];
					}
					else if ( args[ 0 ].indexOf( "playlist?list=" ) !== -1 ) {
						final_options.mode = "PLAYLIST_OFFICIAL";
						final_options.playlist_id = args[ 0 ].split( "playlist?list=" )[ 1 ];
					}
					else if ( args[ 0 ].indexOf( "youtu.be/" ) !== -1 ) {
						final_options.mode = "SINGLE";
						final_options.single_id = args[ 0 ].split( "youtu.be/" )[ 1 ];
					}						
					else {
						if ( args[ 0 ].length > 15 ) {
							final_options.mode = "PLAYLIST_OFFICIAL";
							final_options.playlist_id = args[ 0 ];
						}
						else {
							final_options.mode = "SINGLE";
							final_options.single_id = args[ 0 ];
						}
					}
					require( "./clientManager.js" ).pressButtonMaster( "17" , final_options );				
					return;
				}, {
					description: "Start Youtube State",
					fullDescription: "Start Youtube State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "yt" , "youtube" );

				youtubeCommand.registerSubcommand( "followers" , async ( msg , args ) => {
					if( args.length === 0 ) {
						const followers = await require( "./YOUTUBE/youtubeAPI_Utils.js" ).getFollowers();
						if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
						return "failed";
					}
					return;
				}, {
					description: "Get Youtube Followers",
					fullDescription: "Get Youtube Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "follow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}, {
					description: "Follow YouTube Channel",
					fullDescription: "Follow YouTube Channel",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "unfollow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Username Sent";
					}
					return;
				}, {
					description: "Unfollow YouTube Channel",
					fullDescription: "Unfollow YouTube Channel",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "unblacklist" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Video Sent";
					}
					return "Not Setup";
				}, {
					description: "UnBlacklist YouTube Video",
					fullDescription: "UnBlacklist YouTube Video",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "blacklist" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "No Video Sent";
					}
					return "Not Setup";
				}, {
					description: "Blacklist YouTube Video",
					fullDescription: "Blacklist YouTube Video",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});				

				youtubeCommand.registerSubcommand( "import" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "try: !yt import <currated,relax> <video_id,playlist_id>";
					}
					if ( args[ 0 ] === "currated" ) {
						if ( args[ 1 ] ===  "playlist" ) {
							await require( "./YOUTUBE/currated.js" ).importFromPlaylistID( args[ 2 ] );;
						}
						else {
							for ( var i = 1; i < args.length; ++i ) {
								await require( "./YOUTUBE/currated.js" ).addToQue( args[ i ] );
							}
						}
					}
					else if ( args[ 0 ] === "relax" || args[ 0 ] === "relaxing" ) {
						if ( args[ 1 ] ===  "playlist" ) {
							await require( "./YOUTUBE/relax.js" ).importFromPlaylistID( args[ 2 ] );
						}
						else {
							for ( var i = 1; i < args.length; ++i ) {
								await require( "./YOUTUBE/relax.js" ).addToQue( args[ i ] );
							}
						}
					}
					return;
				}, {
					description: "Import Stuff to Local DB",
					fullDescription: "Import Stuff to Local DB",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				youtubeCommand.registerSubcommandAlias( "add" , "import" );

				youtubeCommand.registerSubcommand( "info" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "try: !yt import <currated,relax> <video_id,playlist_id>";
					}
					if ( args[ 1 ] === "standard" ) {
						if ( args[ 2 ] ) {
							const wVideo = await require( "./YOUTUBE/standard.js" ).getVideoInfo( args[ 2 ] )
							return "YouTube Video Info: [ " + args[ 2 ] + " ]: \n" + 
								"\ttitle == " + wVideo[ "title" ] + "\n" +
								"\tpubdate == " + wVideo[ "pubdate" ] + "\n" +
								"\tcompleted == " + wVideo[ "completed" ] + "\n" +
								"\tskipped == " + wVideo[ "skipped" ] + "\n" +
								"\tcurrent_time == " + wVideo[ "current_time" ] + "\n" +
								"\tremaining_time == " + wVideo[ "remaining_time" ] + "\n" +
								"\tduration == " + wVideo[ "duration" ] + "\n";
						}
					}
					return;
				}, {
					description: "Get Video Info",
					fullDescription: "Get Video Info",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "que" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "try: !yt que <standard,currated,relax>";
					}
					const manager_path = "./YOUTUBE/" + args[ 0 ] + ".js";
					const que = await require( manager_path ).getQue();
					if ( que ) {
						if ( que.length > 0 ) {
							return( "YouTube '" + args[ 0 ] + "' Que: \n" + que.join( " , " ) );
						}
					}
					return "Empty";
				}, {
					description: "Get Youtube Section Que",
					fullDescription: "Get Youtube Section Que",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "live" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "0" );
					}
					return;
				}, {
					description: "Start Youtube Live State",
					fullDescription: "Start Youtube Live State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				youtubeCommand.registerSubcommandAlias( "background" , "live" );

				youtubeCommand.registerSubcommand( "standard" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "14" );
					}
					return;
				}, {
					description: "Start Youtube Standard State",
					fullDescription: "Start Youtube Standard State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "currated" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "15" );
					}
					return;
				}, {
					description: "Start Youtube Currated State",
					fullDescription: "Start Youtube Currated State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				youtubeCommand.registerSubcommand( "relax" , async ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "16" );
					}
					return;
				}, {
					description: "Start Youtube Relaxing State",
					fullDescription: "Start Youtube Relaxing State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				youtubeCommand.registerSubcommandAlias( "relaxing" , "relax" );
			// ========================================================================================
			// Youtube=================================================================================

			// Twitch
			// ========================================================================================
			// ========================================================================================
				var twitchCommand = discordBot.registerCommand( "twitch" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "3" );
					}
					return;
				}, {
					description: "Start Twitch State",
					fullDescription: "Start Twitch State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "follow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( "./utils/twitchAPI_Utils.js" ).followUserName( args[ 0 ] );
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return;
				}, {
					description: "Follow Twitch User",
					fullDescription: "Follow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "unfollow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( "./utils/twitchAPI_Utils.js" ).unfollowUserName( args[ 0 ] );
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return;
				}, {
					description: "Follow Twitch User",
					fullDescription: "Follow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "live" , async ( msg , args ) => {
					const live_twitch = await require( "./utils/twitchAPI_Utils.js" ).getLiveUsers();
					if ( live_twitch ) { if ( live_twitch.length > 0 ) { return live_twitch.join( " , " ); } }
					return "None";
				}, {
					description: "Get Live Twitch Followers",
					fullDescription: "Get Live Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "followers" , async ( msg , args ) => {
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					if ( followers ) { if ( followers.length > 0 ) { return followers.join( " , " ); } }
					return "None";		
				}, {
					description: "Get Twitch Followers",
					fullDescription: "Get Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});			
				twitchCommand.registerSubcommandAlias( "following" , "followers" );
			// ========================================================================================
			// Twitch==================================================================================	


			// Misc
			// ========================================================================================
			// ========================================================================================
				var optionsCommand = discordBot.registerCommand( "options" , ( msg , args ) => {
					if( args.length === 0 ) {				
						return GetButtonInfo();
					}
				}, {
					description: "Get Available States" ,
					fullDescription: "Get Available States" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "cmds" , "options" );
				discordBot.registerCommandAlias( "commands" , "options" );

				var execCommand = discordBot.registerCommand( "exec" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return;
					}
					const cmd = args.join(" ");
					const output = await require( "./utils/generic.js" ).osCommand( cmd );
					return output;
				}, {
					description: "Run Command on OS",
					fullDescription: "Run Command on OS",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "run" , "exec" );
				discordBot.registerCommandAlias( "os" , "exec" );

				var restartCommand = discordBot.registerCommand( "restart" , async ( msg , args ) => {
					if( args.length === 0 ) {
						const output = await require( "./utils/generic.js" ).osCommand( "pm2 restart all" );
						if ( output ) {
							return output;
						}
					}
					return;
				}, {
					description: "Restart PM2 App",
					fullDescription: "Restart PM2 App",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				var timeCommand = discordBot.registerCommand( "time" , ( msg , args ) => {
					return require( "./utils/generic.js" ).time();
				}, {
				description: "Get Current Server Time",
					fullDescription: "Get Current Server Time",
					usage: "<text>"
				});

				var tvPowerCommand = discordBot.registerCommand( "tvpower" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./utils/cecClientManager.js" ).activate();
					}
					return;
				}, {
					description: "Push TV Power Button",
					fullDescription: "Push TV Power Button",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				discordBot.registerCommandAlias( "tv" , "tvpower" );

				var urlFullScreenCommand = discordBot.registerCommand( "url" , ( msg , args ) => {
					if( args.length === 1 ) {
						require( "./firefoxManager.js" ).terminateFFWithClient();
						const url = args.join(" ");
						console.log( "Opening URL --> " + url );
						require( "./utils/generic.js" ).osCommand( "/usr/local/bin/openURLFullScreen " + url );
					}
					return;
				}, {
					description: "Open URL Full Screen",
					fullDescription: "Open URL Full Screen",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
			// ========================================================================================
			// Misc====================================================================================

			await discordBot.connect();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.intitialize = INITIALIZE;