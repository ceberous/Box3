require( "shelljs/global" );
const FS = require( "fs" );
const exfs = require("extfs");
const PATH = require( "path" );
const colors	= require( "colors" );
function wcl( wSTR ) { console.log( colors.magenta.bgBlack( "[HARD_DRIVE_UTIL] --> " + wSTR ) ); }
const wSleep = require( "../generic.js" ).wSleep;

function FIND_USB_STORAGE_PATH_FROM_UUID( wUUID ) {
	function getPath() {
		var findMountPointCMD = "findmnt -rn -S UUID=" + wUUID + " -o TARGET";
		var findMountPoint = exec( findMountPointCMD , { silent:true , async: false } );
		if ( findMountPoint.stderr ) { console.log("error finding USB Hard Drive"); process.exit(1); }
		return findMountPoint.stdout.trim();
	}	
	return new Promise( function( resolve , reject ) {
		try {
			var findEventPathCMD = exec( "sudo blkid" , { silent: true , async: false } );
			if ( findEventPathCMD.stderr ) { wcl("error finding USB Hard Drive"); process.exit(1); }

			var wOUT = findEventPathCMD.stdout.split("\n");
			for ( var i = 0; i < wOUT.length; ++i ) {
				
				var xSplit = wOUT[i].split(" ");
				var x1 = xSplit[1];
				if ( x1 === undefined ) { continue; }
				var x2 = x1.split( "UUID=" )[1];
				if ( !x2 ) { x2 = xSplit[2].split("UUID=")[1];  }
				x2 = x2.substring( 1 , ( x2.length - 1 ) );
				if ( x2 !== wUUID ) { continue; }

				var q1 = getPath();
				
				if ( q1 === "" ) {

					console.log( "USB Drive Plugged IN , but unmounted" );
					console.log( "Mounting ...." );

					var wUSER = exec( "whoami" , { silent:true , async: false } );
					if ( wUSER.stderr ) { console.log("error finding USB Hard Drive"); process.exit(1); }
					wUSER = wUSER.stdout.trim();

					var wPath = path.join( "/" , "media" , wUSER , wUUID )

					var wMKDIR = exec( "sudo mkdir -p " + wPath , { silent: true , async: false } );
					if ( wMKDIR.stderr ) { console.log("error creating USB Hard Drive Media Path"); process.exit(1); }

					var mountCMD = "sudo mount -U " + wUUID +" --target " + wPath;
					console.log(mountCMD);
					var wMount = exec( mountCMD , { silent: true , async: false } );
					if ( wMount.stderr ) { console.log("error Mounting USB Hard Drive"); process.exit(1); }

					q1 = getPath();
					if ( q1 === "" ) { console.log("Still Can't Mount HardDrive Despite all Efforts"); process.exit(1); }

				}
				q1 = q1 + "/";
				resolve( q1 );
			}
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


var sd = null;
var fr = {};
function safeReadDirSync(r){var n={};try{n=FS.readdirSync(r)}catch(c){if("EACCES"==c.code)return null;throw c}return n}
// FROM --> https://github.com/mihneadb/node-directory-tree/blob/master/lib/directory-tree.js
function directoryTree_Stage1(e,r,n){var t,i=PATH.basename(e),a={name:i};try{t=FS.statSync(e)}catch(u){return null}if(t.isFile()){PATH.extname(e).toLowerCase()}else{if(!t.isDirectory())return null;var l=safeReadDirSync(e);if(null===l)return null;a.children=l.map(function(t){return directoryTree_Stage1(PATH.join(e,t),r,n)}).filter(function(e){return!!e})}return a}
function directoryTree_Stage2(){for(var e=0;e<sd.children.length;++e){fr[sd.children[e].name]={};for(var d=0;d<sd.children[e].children.length;++d)if(fr[sd.children[e].name][sd.children[e].children[d].name]=[],sd.children[e].children[d].children)for(var a=0;a<sd.children[e].children[d].children.length;++a){var r=[];if(sd.children[e].children[d].children[a].children)for(var n=0;n<sd.children[e].children[d].children[a].children.length;++n)r.push(sd.children[e].children[d].children[a].children[n].name);fr[sd.children[e].name][sd.children[e].children[d].name].push(r)}}}


async function BUILD_HD_REF( wMountPoint ) {
	sd = directoryTree_Stage1( wMountPoint );
	directoryTree_Stage2();
	return fr;
}

module.exports.findAndMountUSB_From_UUID = FIND_USB_STORAGE_PATH_FROM_UUID;
module.exports.buildHardDriveReference = BUILD_HD_REF;

//const redis = require( "../redisManager.js" ).redis;
const RU = require( "../redis_Utils.js" );
const RC = require( "../../CONSTANTS/redis.js" ).LOCAL_MEDIA;


function REBUILD_REDIS_MOUNT_POINT_REFERENCE( wMountPoint ) {
	return new Promise( async function( resolve , reject ) {
		try {
			// Scan Mount_Point
			const x1 = await BUILD_HD_REF( wMountPoint );
			console.log( x1 );
			// Store Info into Redis ... why
			for ( var wGenre in x1 ) {
				var x1Shows = Object.keys( x1[ wGenre ] );
				if ( x1Shows.length < 1 ) { continue; }
				const LSS_SK_B = RC.BASE + wGenre + ".META.";
				const LSS_SK_U = LSS_SK_B + "UNEQ";
				const LSS_SK_T = LSS_SK_B + "TOTAL";
				const LSS_SK_C = LSS_SK_B + "CURRENT_INDEX";
				await RU.setMulti( [ [ "set" , LSS_SK_T , x1Shows.length ] ,  [ "set" , LSS_SK_C , 0 ] ]);
				//redis.rpush.apply( [ LSS_SK_U ].concat( x1Shows ) );
				await RU.setListFromArray( LSS_SK_U , x1Shows );
				for ( var wShow in x1[ wGenre ] ) { // Each Show in Genre
					const wShow_R_KEY = RC.HD_BASE + wGenre + ".FP." + wShow;
					for ( var j = 0; j < x1[ wGenre ][ wShow ].length; ++j ) {
						const wSeason_R_KEY = wShow_R_KEY + "." + j.toString();
						if ( x1[ wGenre ][ wShow ][ j ].length > 0 ) { // <-- Has Episodes Stored in Season Folders
							//redis.rpush.apply( [ wSeason_R_KEY ].concat( x1[ wGenre ][ wShow ][ j ] ) );
							await RU.setListFromArray( wSeason_R_KEY , x1[ wGenre ][ wShow ][ j ] );
						}
					}
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REINITIALIZE_MOUNT_POINT() {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Lookup mount point to see if valid , else build reference
			var wLiveMountPoint = await RU.getKey( RC.MOUNT_POINT );
			if ( !wLiveMountPoint ) {
				wcl( "No Media Reference Found , Trying to Rebuild from --> " );
				const MOUNT_CONFIG = await RU.getKeyDeJSON( "CONFIG.MOINT_POINT" );
				if ( MOUNT_CONFIG[ "UUID" ] ) {
					wcl( "UUID: " + MOUNT_CONFIG[ "UUID" ] );
					wLiveMountPoint = await FIND_USB_STORAGE_PATH_FROM_UUID( MOUNT_CONFIG[ "UUID" ] );
					wLiveMountPoint = wLiveMountPoint + "MEDIA_MANAGER/";
				}
				else if ( MOUNT_CONFIG[ "LOCAL_PATH" ] ) {
					wcl( "LOCAL_PATH: " + MOUNT_CONFIG[ "LOCAL_PATH" ] );
					wLiveMountPoint = MOUNT_CONFIG[ "LOCAL_PATH" ];
				}
				else { wcl( "We Were Not Told Where to Find any Local Media" ); resolve( "no_local_media" ); return; }
				const dirExists = FS.existsSync( wLiveMountPoint );
				if ( !dirExists ) { wcl( "Local Media Folder Doesn't Exist" ); resolve( "no_local_media" ); return; }
				const isEmpty = await exfs.isEmpty( wLiveMountPoint );
				if ( isEmpty ) { wcl( "Local Media Folder is Empty" ); resolve( "no_local_media" ); return; }
				// Cleanse and Prepare Mount_Point
				await RU.deleteMultiplePatterns( [ ( RC.BASE + "*" ) , "HARD_DRIVE.*" , "LAST_SS.LOCAL_MEDIA.*" ] );
				//await wSleep( 2000 );
				await REBUILD_REDIS_MOUNT_POINT_REFERENCE( wLiveMountPoint );
				await RU.setKey( RC.MOUNT_POINT , wLiveMountPoint );
			}
			resolve( wLiveMountPoint );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.reinitializeMountPoint = REINITIALIZE_MOUNT_POINT;