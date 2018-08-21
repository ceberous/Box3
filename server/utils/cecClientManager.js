require( "shelljs/global" );
module.exports.activate =  function() {
	exec( "echo 'on 0' | cec-client -s -d 1" , { silent:true , async: false } );
	setTimeout( function() {
		exec( "echo 'as' | cec-client -s -d 1" , { silent:true , async: false } );
	} , 2000 );
	setTimeout( function() {
		exec( "echo 'as' | cec-client -s -d 1" , { silent:true , async: false } );
            setTimeout( function() {
				exec( "export DISPLAY=:0.0; xrandr --output eDP1 --off --output HDMI1 --primary --mode 1920x1080" , { silent: true , async: false } );
           	} , 1000 );
	} , 3000 );	
};
module.exports.turnOff = function() {
	exec( "echo 'standby 0' | cec-client -s -d 1" , { silent:true , async: false } );
};