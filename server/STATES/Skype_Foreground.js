// Apparently as of Today , 18NOV2017 , the old skype version I am using
// completely no longer works. 
// Somehow this --> https://github.com/tomorgan/SkypeWebSDKSamples/blob/gh-pages/AV/5-MakingVideoCalls/index.htm
// https://www.pcmag.com/article2/0,2817,2388678,00.asp
// http://code.skypewebsdk.com/
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/objectmodel
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/gettingstarted#sectionSection2
// https://msdn.microsoft.com/Skype/WebSDK/docs/GettingStarted
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/skypewebsdk
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/getapientrysignin
// https://github.com/OfficeDev/skype-docs
// https://www.thoughtstuff.co.uk/skype-web-sdk
// https://github.com/OfficeDev/skype-web-sdk-samples
// or this --> https://vsee.com/
// or this --> https://tokbox.com/
// or this --> http://peerjs.com/
// or this --> https://gist.github.com/kalkov/1744211
// or this --> https://media.twiliocdn.com/sdk/js/video/releases/1.6.0/docs/
// https://www.twilio.com/docs/api/video/javascript-v1-getting-started
// or this --> https://trueconf.com/downloads/linux.html
// or this --> https://chime.aws/
// or this --> http://www.rhubcom.com/v5/web-conferencing.html

// or this --> https://webrtchacks.com/whats-in-a-webrtc-javascript-library/
// https://docs.google.com/document/d/1idl_NYQhllFEFqkGQOLv8KBK8M3EVzyvxnKkHl4SuM8/edit#

// or this --> http://doc-kurento.readthedocs.io/en/stable/tutorials/node/tutorial-helloworld.html

// or this --> https://vidyo.io/
// https://www.vidyo.com/video-conference-systems/desktop-video-calling/vidyoconnect-pricing
// https://developer.vidyo.io/login-widget
// https://developer.vidyo.io/api-reference/4-1-17-5
// https://developer.vidyo.io/documentation/4-1-17-5/getting-started
// https://vidyo.io/how-to-videos/

// or this --> https://github.com/jitsi/jitsi-meet/blob/master/doc/api.md
// https://meet.jit.si/external_api.js
// https://github.com/jitsi/luajwt
// ^^^^ how the fuck do I use JWT ??? why am I so retarded ???
// https://github.com/saghul/jitsi-meet-api

// https://www.zoiper.com/
// http://www.counterpath.com/x-lite/
// http://www.fring.com/

// https://zoom.us/pricing
// https://developer.zoom.us/

// http://ekiga.org/
// https://ubuntuforums.org/archive/index.php/t-309218.html

// https://www.spiritdsp.com/

// https://hubl.in/
// https://github.com/linagora/hublin

// https://github.com/RocketChat/Rocket.Chat

// https://docs.ring.cx/dev/compiling_and_installing/daemon.html
// https://github.com/sevaivanov/ring-api
// https://github.com/savoirfairelinux/ring-daemon
// https://github.com/sevaivanov/ring-for-the-web

// https://tox.chat/
// https://github.com/TokTok/c-toxcore
// https://toxme.io/
// https://wiki.tox.chat/developers/client_examples/echo_bot
// https://github.com/qTox/qTox/blob/master/INSTALL.md#linux
// https://github.com/qTox/qTox/issues/633

// http://www.linphone.org/
// https://askubuntu.com/questions/866131/what-are-the-sip-connection-parameters-for-an-ekiga-net-account
// http://www.linphone.org/technical-corner/linphone/downloads
// http://flatpak.org/getting.html
// https://wiki.linphone.org/xwiki/wiki/public/view/Linphone/Linphone%20and%20Raspberry%20Pi/

// https://github.com/peers/peerjs/
// https://github.com/nttcom/peerjs/tree/master/examples
// https://github.com/nttcom/peerjs/blob/master/examples/videochat/index.html

// https://github.com/feross/simple-peer

// https://www.twilio.com/webrtc
// https://github.com/twilio/video-quickstart-js

// https://github.com/jeremija/peer-calls

// http://moose-team.github.io/friends/
// http://pushertc.herokuapp.com/
// https://blog.carbonfive.com/2014/10/16/webrtc-made-simple/

// https://github.com/feross/lxjs-chat

const wSkypeNames = require("../../personal.js").skypeNames;
function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var name = wSkypeNames[ wOptions.personal_number ];
			await require( "../skypeManager.js" ).startCall( name );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( function( resolve , reject ) {
		try {
			require( "../skypeManager.js" ).endCall();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.stop = wStop;