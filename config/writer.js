const fs = require( "fs" );
const path = require( "path" );


const GENERIC = {
	MEDIA_MOUNT_POINT: {
		//UUID: "2864E38A64E358D8" ,
		//LOCAL_PATH: "/home/morpheous/TMP2/EMULATED_MOUNT_PATH" ,
		LOCAL_PATH: "/home/morpheous/TMP2/EMULATED_MOUNT_POINT/MEDIA_MANAGER/" ,
		//UUID: "B40C6DD40C6D9262" , // Toshiba 1tb
	}
};

const BUTTONS = {
		// Physical Button Map
		0: { name: "Youtube Live Background" ,  state: "Youtube" , options: { mode: "LIVE" , position: "BACKGROUND" } } ,
		1: { name: "UNKNOWN Music with Youtube Live in the Background" , session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" } } ,
		2: { name: "UNKNOWN Music with Youtube Live in the Background" , session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" }  } ,
		3: { name: "Watch Live Twitch Followers or Youtube Standard Videos if All Followers Are Offline" , session: "Twitch_IF_Live_ELSE_YT_Standard_Foreground" , options: {} } ,
		4: { name: "Call Discord Person-1" , state: "Discord_Call_Foreground" , options: { users: [ "DISCORD.CALLE1" ] } } ,
		5: { name: "Call Discord Person-2" , state: "Discord_Call_Foreground" , options: { users: [ "DISCORD.CALLE2" ] } } ,
		6: { name: "Stop" , label: "stop" } ,
		7: { name: "Pause" , label: "pause" } ,
		8: { name: "Previous" , label: "previous" } ,
		9: { name: "Next" , label: "next" } ,
		10: { name: "Watch a Movie" , state: "LocalMedia_Movie_Foreground" , options: {} } ,
		11: { name: "Odyssey with Youtube Live in the Background" , session: "LocalMedia_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
		12: { name: "Watch a TV Show" , state: "LocalMedia_Foreground" , options: { genre: "TVShows" , advance_show: "true" , specific_show: "false" , specific_episode: "false" } } ,

		// Extras
		13: { name: "Watch Youtube Currated Videos , then start Odyseey and Youtube Live in the Background" , session: "YT_Currated_THEN_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
		14: { name: "Watch Youtube Followers Videos" , state: "Youtube" , options: { mode: "STANDARD" , position: "FOREGROUND" } } ,
		15: { name: "Watch Youtube Currated Videos" , state: "Youtube" , options: { mode: "CURRATED" , position: "FOREGROUND" } } ,
		16: { name: "Watch Youtube Relaxing Videos" , state: "Youtube" , options: { mode: "RELAX" , position: "FOREGROUND" } } ,
		17: { name: "Watch Youtube Single Video" , state: "Youtube" , options: { mode: "SINGLE" , position: "FOREGROUND" } } ,
		18: { name: "Watch Youtube List of Videos" , state: "Youtube" , options: { mode: "LIST" , position: "FOREGROUND" } } ,
		19: { name: "Watch Official Youtube Playlist ID" , state: "Youtube" , options: { mode: "PLAYLIST_OFFICIAL" , position: "FOREGROUND" ,  playlist_id: "PLcW8xNfZoh7cxWFftCwzHJA3foHba1SzF" } } ,
		20: { name: "Look at Instagram Followers Photos" , state: "Instagram_Background" , options: {} } ,
};

const REDIS = {
	CONNECTION: {
		HOST: "localhost" ,

		// Purple0
		PORT: "6379" ,
		DATABASE_NUM: 0 ,
		
		// Here
		// PORT: "6379" , 
		// DATABASE_NUM: 3 ,
	}
};

const SCHEDULES = {

	STATE_TRANSITIONS: {
		arriveHome: {
			startPattern: "01 16 * * 1,2,3,5" ,
			endPattern: "01 18 * * 1,2,3,5" ,
			state: 13,
			stateOptions: null ,
			startConditions: { "STATUS.LOCAL_MEDIA": "ONLINE" , "CONFIG.ARRIVED_HOME": "false" } ,
			stopConditions: null ,
		} ,
	} ,

	// Paths Must be **relative** to scheduleManager.js
	UPDATES: {
		gmusicPlaylistCache: {
			startPattern: "01 */3 * * *" , // every 3 hours
			startConditions: { "STATUS.MOPIDY": "ONLINE" , "MOPIDY.STATE": "STOPPED" } ,
			functionPath: [ "utils" , "mopidy" ,"libraryManager.js" ] ,
			functionName: "updateCache" ,
		} ,
		// youtubeStandardList: {
		// 	startPattern: "01 */9 * * *" , // every 9 hours
		// 	startCondeitions: {} ,
		// 	functionPath: [ "/YOUTUBE/standard.js" ] ,
		// 	functionName: "update" ,
		// } ,
	}

};

const YOUTUBE = {
	LIVE: {
		FOLLOWERS: [
			{
				name : "" ,
				id: "UCnM5iMGiKsZg-iOlIO2ZkdQ"
			} ,
			{
				name : "" ,
				id: "UCakgsb0w7QB0VHdnCc-OVEA"
			} ,
			{
				name : "" ,
				id: "UCZvXaNYIcapCEcaJe_2cP7A"
			} ,
			{
				name : "" ,
				id: "UCUPn5IEQugMf_JeNJOV9p2A"
			} ,			

		] ,
		BLACKLIST: [ "N5UUv-tgyDg" , "9zMpeUh6DXs" , "bNc7rGEBrMA" , "Mk9gQcHueeE" , "uyTAj1sbThg" , "cdKLSA2ke24" , "SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , "nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ] ,
	} ,
	STANDARD: {
		FOLLOWERS: [
			{
				name : "" ,
				id: "UCk0UErv9b4Hn5ucNNjqD1UQ"
			} ,
			{
				name : "" ,
				id: "UCKbVtAdWFNw5K7u2MZMLKIw"
			} ,		
		] ,
		BLACKLIST: [] ,
	}
};

const INSTAGRAM = [
	"ceberous"
];


const CONFIG_FILE_MAP = {
	GENERIC: path.join( __dirname , "generic.json" ) ,
	BUTTONS: path.join( __dirname , "buttons.json" ) ,
	REDIS: path.join( __dirname , "redis.json" ) ,
	SCHEDULES: path.join( __dirname , "schedules.json" ) ,
	YOUTUBE: path.join( __dirname , "youtube.json" ) ,
	INSTAGRAM: path.join( __dirname , "instagram.json" ) ,
};

const CONFIG_FILE_VAR_MAP = {
	GENERIC: GENERIC ,
	BUTTONS: BUTTONS ,
	REDIS: REDIS ,
	SCHEDULES: SCHEDULES ,
	YOUTUBE: YOUTUBE ,
	INSTAGRAM: INSTAGRAM ,
};


function UPDATE_HAND_WRITTEN_CONFIG() {
	for ( var file in CONFIG_FILE_MAP ) {
		fs.writeFileSync( CONFIG_FILE_MAP[ file ] , JSON.stringify( CONFIG_FILE_VAR_MAP[ file ] , null , 4 ) );
	}
}
module.exports.updateHandWrittenConfig  = UPDATE_HAND_WRITTEN_CONFIG;

if ( !module.parent ) {
	UPDATE_HAND_WRITTEN_CONFIG();
}

function GET_CONFIG_FILE( wConfigName ) {
	if ( !CONFIG_FILE_VAR_MAP[ wConfigName ] ) { return "No Config File By That Name"; }
	var config_file = null;
	try { config_file = require( CONFIG_FILE_MAP[ wConfigName ] ); }
	catch( e ) { 
		config_file = CONFIG_FILE_VAR_MAP[ wConfigName ];
		UPDATE_CONFIG_FILE( wConfigName , config_file );
	}
	return config_file ;
}
module.exports.getConfigFile = GET_CONFIG_FILE;

function UPDATE_CONFIG_FILE( wConfigName , wConfig ) {
	if ( !CONFIG_FILE_VAR_MAP[ wConfigName ] ) { return "No Config File By That Name"; }
	fs.writeFileSync( CONFIG_FILE_MAP[ wConfigName ] , JSON.stringify( wConfig , null , 4 ) );
}
module.exports.updateConfigFile = UPDATE_CONFIG_FILE;