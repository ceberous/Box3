const wEmitter = require('../main.js').wEmitter;
const wPressButtonMaster = require("./clientManager.js").pressButtonMaster;
const fs = require("fs");
const path = require("path");
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder('utf8');
const spawn = require("child_process").spawn;
require("shelljs/global");

const RU = require( "./utils/redis_Utils.js" );
const RC = require( "./CONSTANTS/redis.js" ).BUTTONS;

var CLogPrefix = "[BUTTON_MAN] --> ";
var CLogColorConfig = [ "yellow" , "bgBlack" ];
const CLog = require( "./utils/generic.js" ).clog;
const CELog = require( "./utils/generic.js" ).celog;
function CLog1( wSTR ) { CLog( wSTR , CLogColorConfig , CLogPrefix ); }
function CELog1( wSTR ) { CELog( wSTR , CLogColorConfig , CLogPrefix ); }


// https://blog.petrockblock.com/controlblock/
// http://www.cuddleburrito.com/blog/2015/5/31/connecting-raspberry-pi-arcade-buttons-to-gpio
// http://www.cuddleburrito.com/blog/2016/7/20/kodi-support-for-gpio-arcade-buttons-on-raspberry-pi
// http://www.cuddleburrito.com/blog/2016/5/18/adding-rigidity-and-strength-to-the-frame
// http://www.cuddleburrito.com/blog/2016/5/30/quick-electronics-frame-by-resin-filling-3d-prints
// https://github.com/adafruit/Adafruit-Retrogame

// https://www.linuxquestions.org/questions/linux-software-2/a-guide-to-set-nomachine-nx-3-5-x-up-on-debian-wheezy-and-possibly-others-917816/
// http://www.debugpoint.com/2014/12/nomachine-a-remote-desktop-client-for-ubuntu/

// https://www.nomachine.com/forums/topic/nomachine-behind-nat
// https://www.nomachine.com/AR11L00827
// https://wiki.x2go.org/doku.php/doc:newtox2go

// https://www.reddit.com/r/NoMachine/comments/5z19yh/nomachine_over_wan_with_2_factor_authentication/?st=ja81xwvk&sh=c7f142c1
// https://www.reddit.com/r/NoMachine/comments/5xxybf/nomachine_and_ssh/?st=ja81xzng&sh=fab7f1ab

// https://wiki.x2go.org/doku.php/doc:installation:x2goserver

const usbDeviceID = "usb-DragonRise_Inc._Generic_USB_Joystick-event-joystick";
const findEventPath = 'ls -la /dev/input/by-id';
function getUSBDeviceEventPath() {

	var findEventPathCMD = exec( findEventPath , { silent:true , async: false } );
	
	if ( findEventPathCMD.stderr.length > 1 ) { CELog1( "ERROR --> " + findEventPathCMD.stderr  ); }

	findEventPathCMD = findEventPathCMD.stdout.split("\n");

	for (var i = 0; i < findEventPathCMD.length; ++i) {
		
		var wT = findEventPathCMD[i].split(" ");
		if ( wT[wT.length-3] === usbDeviceID ) {
			var wEvent = wT[wT.length-1].split("../");
			var wEventPath = 'eventPath = "/dev/input/' + wEvent[1] + '"';
			CLog1( wEventPath );
			fs.writeFileSync( path.join( __dirname , "py_scripts" , "usbDevicePath.py" ) , wEventPath );
			return true;
		}
		
	}

	return false;

}

function cleanseButtonENV() {

	function isButtonScriptOpen() {

		var wPIDS = [];
		const wCMD1 = "ps aux | grep python";
		var findButton = exec( wCMD1 , { silent:true , async: false });
		if ( findButton.stderr.length > 1 || findButton.stdout.length < 1 ) { CELog1( findButton.stderr.trim() ); return -1; }

		var wOutput = findButton.stdout.split("\n");
		for ( var i = 0; i < wOutput.length; ++i ) {
			var wOut2 = wOutput[i].split(" ");
			var wOut3 = wOut2[ wOut2.length - 1 ].split("/"); 
			if ( wOut3[ wOut3.length - 1 ] === "buttonWatcher.py" ) {
				for ( var j = 0; j < 8; ++j ) {
					var wTest = wOut2[j].trim();
					if ( wTest === " " ) { continue; }
					wTest = parseInt( wTest );
					if ( isNaN(wTest) ) { continue; }
					if ( wTest < 300 ) { continue; }
					CLog1( "wTest = " + wTest.toString() +  " PID: " + wOut2[ j ] + " = " + wOut3[ wOut3.length - 1 ] );
					wPIDS.push( wOut2[j] );
				}
				
			}
		}

		return wPIDS;

	}

	var openResult = isButtonScriptOpen();
	if ( openResult === -1 ) {
		CELog1("failed to find script");
	}
	else {
		var wCMD2 = "sudo kill -9 ";
		for ( var i = 0; i < openResult.length; ++i ) {
			var wKillCMD = wCMD2 + openResult[i];
			exec( wKillCMD , { silent: true , async: false } );
			CLog1( wKillCMD );
		}
	}

}


if ( !getUSBDeviceEventPath() ) { /*throw new Error( "[BUTTON_MAN] --> Cannot Find USB-Buttton Controller" );*/ return; }
cleanseButtonENV();

const buttonScript = path.join( __dirname , "py_scripts" , "buttonWatcher.py" );
var ButtonManager = spawn( "python" , [ buttonScript ] );
CLog1( "@@PID=" + ButtonManager.pid );

var lastPressed = new Date().getTime();
var timeNow;
var handleButtonInput = function(wInput) {
	wInput = wInput.toString();
	console.log(wInput);

	timeNow = new Date().getTime();
	if ( ( timeNow - lastPressed ) < 3000 ) { CLog1("pressed too soon"); return; }
	lastPressed = timeNow;

	var wE = "button" + wInput + "Press";
	//wEmitter.emit( wE );
	wInput = parseInt( wInput );
	wPressButtonMaster( wInput );
	console.log( "did we just call button press master ?" );
};

async function stopScript() {
	var wCMD = "sudo kill -9 " + ButtonManager.pid.toString();
	exec( wCMD , { silent: true , async: false } );
	await RU.setKey( RC.STATUS , "OFFLINE" );
}
module.exports.stop = stopScript;

ButtonManager.stdout.on( "data" , function( data ) {
	var message = decoder.write( data );
	message = message.trim();
	handleButtonInput( message );
});


ButtonManager.stderr.on( "data" , function(data) {
	var message = decoder.write(data);
	message = message.trim();
	CELog1( "[buttonWatcher.py] --> ERROR -->".green  );
	CELog1( message );
	stopScript();
	//wEmitter.emit( "properShutdown" );
	//setTimeout( ()=> { process.exit(1); } , 2000 );
});

module.exports.pressButton = function( wNum ) {
	handleButtonInput( wNum );
};


RU.setKey( RC.STATUS , "ONLINE" );