const colors	= require( "colors" );
function wcl( wSTR ) { console.log( colors.magenta.bgBlack( "[LOCAL_MEDIA_MAN] --> calculate() --> " + wSTR ) ); }
const RU = require( "../redis_Utils.js" );
const RC = require( "../../CONSTANTS/redis.js" ).LOCAL_MEDIA;
const GetLiveConfig = require( "./generic.js" ).getLiveConfig;
const GetLastPlayedInGenre = require( "./generic.js" ).getLastPlayedInGenre;
const GetLastPlayedGlobal = require( "./generic.js" ).getLastPlayedGlobal;
const GetDuration 	= require( "../generic.js" ).getDuration;

function GET_GENRE_FRESH( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Select The 1st Show from The List of UNEQ
			const R_FirstShow = RC.BASE + wOptions.genre + ".META.UNEQ";
			const showName = await RU.getFromListByIndex( R_FirstShow , 0 );
			// 2.) Select the 1st Episode
			const R_FirstEpisodeFP = RC.HD_BASE + wOptions.genre + ".FP." + showName + ".0";
			const firstEpisode = await RU.getFromListByIndex( R_FirstEpisodeFP , 0 );

			const firstEpFullPath = wOptions.mount_point + wOptions.genre + "/" + showName + "/01/" + firstEpisode;
			
			const wDuration = GetDuration( firstEpFullPath );
			const wThreePercent = Math.floor( ( wDuration - ( wDuration * 0.025 ) ) );			
			resolve({ 
				genre: wOptions.genre , uneq_idx: 0 , show_name: showName ,
				season_idx: 0 , episode_idx: 0 , fp: firstEpFullPath ,
				completed: false , cur_time: 0 , remaining_time: wDuration ,
				three_percent: wThreePercent , duration: wDuration
			});
			return;
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function PREVIOUS( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {

			// Preliminary Setup //
			// ==================================================================================================================//
			// ==================================================================================================================//
			// [ RC.CONFIG.GENRE , RC.CONFIG.ADVANCE_SHOW , RC.CONFIG.SPECIFIC_SHOW , RC.CONFIG.SPECIFIC_EPISODE , RC.MOUNT_POINT ]
			if ( !wOptions ) { wOptions = await GetLiveConfig(); }
			//wcl( "next() --> LiveConfig = " );
			//console.log( wOptions );

			// Check if Genre Fresh
			var lastPlayed = await GetLastPlayedGlobal();
			if ( !lastPlayed ) { //console.log( "genre is FRESH !!" );
				var FinalNowPlaying = await GET_GENRE_FRESH( wOptions );
				const x1 = JSON.stringify( FinalNowPlaying );
				await RU.setMulti( [ [ "set" , RC.LAST_SS.NOW_PLAYING[ wOptions.genre ] , x1 ] ,  [ "set" , RC.LAST_SS.NOW_PLAYING_GLOBAL , x1 ] ]);
				resolve( FinalNowPlaying );
				return;
			}
			//if ( !lastPlayed.completed ) { resolve( lastPlayed ); return; }
			// ==================================================================================================================//
			// ==================================================================================================================//


			const R_P_Base = "HARD_DRIVE." + lastPlayed.genre + ".";

			var FinalUNEQ_IDX = lastPlayed.uneq_idx;
			var FinalShowName = lastPlayed.show_name;
			var FinalEpisodeIDX = lastPlayed.episode_idx;
			var FinalSeasonIDX = lastPlayed.season_idx;
			var FinalFilePath = "";
			var FinalRemainingTime = FinalCurrentTime = FinalThreePercent = FinalDuration = 0;

			FinalEpisodeIDX = ( FinalEpisodeIDX - 1 );
			const R_Previous_Base = R_P_Base + "FP." + FinalShowName;
			const R_Previous_EP = R_Previous_Base + "." + FinalSeasonIDX;
			var previousEpisode = await RU.getFromListByIndex( R_Previous_EP , FinalEpisodeIDX );
			//console.log( "next episode === " + previousEpisode );

			if ( previousEpisode === null ) { // IF Advanced Past Total-Episodes in Season Boundry
				
				//console.log( "inside episode reset" );
				FinalSeasonIDX = ( FinalSeasonIDX - 1 );
				if ( FinalSeasonIDX === -1 ) { // We Precceded Past Season '0' , and we need to set to last season , last episode
					FinalSeasonIDX = await RU.getKeysFromPattern( R_Previous_Base + ".*" );
					FinalSeasonIDX = ( FinalSeasonIDX.length - 1 );
				}
				const R_Previous_Season = R_Previous_Base + "." + FinalSeasonIDX;
				FinalEpisodeIDX = await RU.getListLength( R_Previous_Season );
				FinalEpisodeIDX = ( FinalEpisodeIDX - 1 );

				FinalFilePath = await RU.getFromListByIndex( R_Previous_Season , F_Episode_IDX );

			}
			else { FinalFilePath = previousEpisode; }

			// Adjust Final-Full-File-Path from Redis "set" language
			const xb1 = wOptions.mount_point + lastPlayed.genre + "/" + FinalShowName;
			const xb2 = ( FinalSeasonIDX + 1 ).toString();
			if ( FinalSeasonIDX < 10 ) { FinalFilePath = xb1 + "/0" + xb2 + "/" + FinalFilePath; }
			else { FinalFilePath = xb1 + "/" + xb2 + "/" + FinalFilePath; }

			// Populate Duration and Three-Percent Values
			FinalDuration = FinalRemainingTime =  GetDuration( FinalFilePath );
			FinalThreePercent = Math.floor( ( FinalDuration - ( FinalDuration * 0.025 ) ) );

			var FinalOBJ = {
				genre: lastPlayed.genre ,
				uneq_idx: FinalUNEQ_IDX ,
				show_name: FinalShowName ,
				season_idx: FinalSeasonIDX ,
				episode_idx: FinalEpisodeIDX ,
				fp: FinalFilePath ,
				completed: false ,
				remaining_time: FinalRemainingTime ,
				three_percent: FinalThreePercent ,
				duration: FinalDuration ,
				cur_time: 0
			};
			wcl( "previous() --> previous episode === " );
			console.log( FinalOBJ );
			const x1 = JSON.stringify( FinalOBJ );
			await RU.setMulti( [ [ "set" , RC.LAST_SS.NOW_PLAYING[ FinalOBJ.genre ] , x1 ] ,  [ "set" , RC.LAST_SS.NOW_PLAYING_GLOBAL , x1 ] ]);

			resolve( FinalOBJ );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.previous = PREVIOUS;

function SKIP() {
	return new Promise( async function( resolve , reject ) {
		try {
			wcl( "skip()" );
			var lastPlayed = await GetLastPlayedGlobal();
			if ( !lastPlayed ) { resolve(); return; }
			lastPlayed.completed = true;
			lastPlayed = JSON.stringify( lastPlayed );
			await RU.setKey( RC.LAST_SS.NOW_PLAYING_GLOBAL , lastPlayed );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.skip = SKIP;

function NEXT( wOptions , wSkipping ) {
	return new Promise( async function( resolve , reject ) {
		try {
						// Preliminary Setup //
			// ==================================================================================================================//
			// ==================================================================================================================//
			// [ RC.CONFIG.GENRE , RC.CONFIG.ADVANCE_SHOW , RC.CONFIG.SPECIFIC_SHOW , RC.CONFIG.SPECIFIC_EPISODE , RC.MOUNT_POINT ]
			if ( !wOptions ) { wOptions = await GetLiveConfig(); }
			//wcl( "next() --> LiveConfig = " );
			//console.log( wOptions );

			// Check if Genre Fresh
			var lastPlayed = await GetLastPlayedGlobal();
			if ( !lastPlayed ) { //console.log( "genre is FRESH !!" );
				var FinalNowPlaying = await GET_GENRE_FRESH( wOptions );
				const x1 = JSON.stringify( FinalNowPlaying );
				await RU.setMulti( [ [ "set" , RC.LAST_SS.NOW_PLAYING[ wOptions.genre ] , x1 ] ,  [ "set" , RC.LAST_SS.NOW_PLAYING_GLOBAL , x1 ] ]);
				resolve( FinalNowPlaying );
				return;
			}
			if ( !lastPlayed.completed ) { resolve( lastPlayed ); return; }
			// ==================================================================================================================//
			// ==================================================================================================================//


			// Else , Calculate **Next** based on wOptions
			//wcl( "next() --> LastPlayed = " );
			//console.log( lastPlayed );

			const R_FinalBase = "HARD_DRIVE." + lastPlayed.genre + ".";
			var FinalUNEQ_IDX = lastPlayed.uneq_idx;
			var FinalShowName = lastPlayed.show_name;
			var FinalEpisodeIDX = lastPlayed.episode_idx;
			var FinalSeasonIDX = lastPlayed.season_idx;
			var FinalFilePath = undefined;
			var FinalFilePathSet = false;
			var FinalRemainingTime = FinalCurrentTime = FinalThreePercent = FinalDuration = 0;

			// Apply Live Options
			// ===================================================================================//
			if ( wOptions.specific_show === true ) {
				FinalShowName = wOptions.specific_show;
				//wcl( "next() --> specificShow() --> FinalShowName === " + FinalShowName );
			}
			else if ( wOptions.advance_show === true ) {
				const x1 = await require( "./generic.js" ).advanceNextShow( FinalUNEQ_IDX );
				FinalUNEQ_IDX = x1[ 0 ];
				FinalShowName = x1[ 1 ];
				//wcl( "next() --> advanceShow() --> FinalShowName === " + FinalShowName );
				// Check if Show Already Has a Previous Position
				// This is the only point of double saving the **nowPlaying** obj into G_R_NP_ShowName_Backup
				const R_PreviouslyWatched = "LAST_SS.LOCAL_MEDIA." + lastPlayed.genre + "." + FinalShowName;
				var previouslyWatched = await RU.getKey( R_PreviouslyWatched );
				if ( previouslyWatched !== null ) {
					lastPlayed = JSON.parse( previouslyWatched );
					if ( !lastPlayed.completed ) { resolve( lastPlayed ); return; }
					FinalEpisodeIDX = lastPlayed.episode_idx;
					FinalShowName = lastPlayed.show_name;
					//wcl( "next() --> advanceShow() --> FinalShowName === " + FinalShowName );
					FinalSeasonIDX = lastPlayed.season_idx;					
					FinalEpisodeIDX = lastPlayed.episode_idx;
				}
			}
			// ===================================================================================//
			// ===================================================================================//
 	

 			// Calculate Next Episode , and adjust to next season ,
			FinalEpisodeIDX = ( FinalEpisodeIDX + 1 );
			const R_Next_EP = R_FinalBase + "FP." + FinalShowName + "." + FinalSeasonIDX;
			var nextEpisode = await RU.getFromListByIndex( R_Next_EP , FinalEpisodeIDX );

			if ( nextEpisode === null ) { // IF Advanced Past Total-Episodes in Season Boundry
				wcl( "next() --> episodeReset()" );
				FinalEpisodeIDX = 0;
				FinalSeasonIDX = ( FinalSeasonIDX + 1 );
				var R_Next_Season = R_FinalBase + "FP." + FinalShowName + "." + FinalSeasonIDX;
				const intermediaryNext_Episode = await RU.getFromListByIndex( R_Next_Season , 0 );
				if ( intermediaryNext_Episode === null ) { // IF Advanced Past Total-Seasons in Show Boundry
					wcl( "next() --> seasonReset()" );
					FinalSeasonIDX = 0;
					R_Next_Season = R_FinalBase + "FP." + FinalShowName + "." + FinalSeasonIDX;
					FinalFilePath = await RU.getFromListByIndex( R_Next_Season , 0 );
				}
				else { FinalFilePath = intermediaryNext_Episode; }
			}
			else { FinalFilePath = nextEpisode; }
			
			// Adjust Final-Full-File-Path from Redis "set" language
			const xb1 = wOptions.mount_point + lastPlayed.genre + "/" + FinalShowName;
			const xb2 = ( FinalSeasonIDX + 1 ).toString();
			if ( FinalSeasonIDX < 10 ) { FinalFilePath = xb1 + "/0" + xb2 + "/" + FinalFilePath; }
			else { FinalFilePath = xb1 + "/" + xb2 + "/" + FinalFilePath; }

			// Populate Duration and Three-Percent Values
			FinalDuration = FinalRemainingTime =  GetDuration( FinalFilePath );
			FinalThreePercent = Math.floor( ( FinalDuration - ( FinalDuration * 0.025 ) ) );

			var FinalOBJ = {
				genre: lastPlayed.genre ,
				uneq_idx: FinalUNEQ_IDX ,
				show_name: FinalShowName ,
				season_idx: FinalSeasonIDX ,
				episode_idx: FinalEpisodeIDX ,
				fp: FinalFilePath ,
				completed: false ,
				remaining_time: FinalRemainingTime ,
				three_percent: FinalThreePercent ,
				duration: FinalDuration ,
				cur_time: 0
			};
			wcl( "next() --> next episode === " );
			console.log( FinalOBJ );
			const x1 = JSON.stringify( FinalOBJ );
			await RU.setMulti( [ [ "set" , RC.LAST_SS.NOW_PLAYING[ FinalOBJ.genre ] , x1 ] ,  [ "set" , RC.LAST_SS.NOW_PLAYING_GLOBAL , x1 ] ]);

			resolve( FinalOBJ );
			
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;