const request = require( "request" );

function xLoginAndReboot() {
	return new Promise( async function( resolve , reject ) {
		try {
			
			var wURL = "http://192.168.0.1/goform/login";
			var wBody = "loginUsername=admin&loginPassword=admin";
			console.log( wURL );
			request.post({
			  headers: {'content-type' : 'application/x-www-form-urlencoded'},
			  url:     wURL ,
			  body:    wBody ,
			}, function( error, response, body){
				console.log(body);
			  	var w1URL = "http://192.168.0.1/goform/RgSecurity";
				var w1Body = "UserId=&OldPassword=&Password=&PasswordReEnter=&ResRebootYes=0x01&RestoreFactoryNo=0x00&RgRouterBridgeMode=1";
				console.log( w1URL );
				request.post({
				  headers: {'content-type' : 'application/x-www-form-urlencoded'},
				  url:     w1URL ,
				  body:    w1Body ,
				}, function( w1error, w1response, w1body){
				  console.log( w1body );
				  resolve();
				});

			});	

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports = xLoginAndReboot;
// (async function(){
// 	await xLoginAndReboot();
// })();