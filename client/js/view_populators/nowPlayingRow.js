function nowPlayingRowViewUpdate( xWLS ) {

	console.log( "are we even here ?" );
	console.log( wLS );

	console.log( xWLS );
	if ( xWLS ) { wLS = xWLS; }
	if ( wLS === null || !wLS.CURRENT_ACTION ) { return; }
	$("#nowPlayingTitle").text( wLS.CURRENT_ACTION )

	switch( wLS.CURRENT_ACTION ) {

		case "MopidyYTLiveBackground":
			if ( wLS[ "Mopidy" ][ "nowPlaying" ] ) {
				$("#audioNowPlayingStatus").text( "Track = " + wLS[ "Mopidy" ][ "nowPlaying" ].name );
				$("#audioNowPlayingStatus2").text( "Artist = " + wLS[ "Mopidy" ][ "nowPlaying" ][ "artists" ][ 0 ].name );
			}
			if ( wLS[ "YTLiveBackground" ][ "nowPlaying" ] ) {
				$("#videoNowPlayingStatus").text( "Video Status = " + wLS[ "YTLiveBackground" ][ "nowPlaying" ].status );
				$("#videoNowPlayingStatus2").html( "<a href='https://www.youtube.com/watch?v=" + wLS[ "YTLiveBackground" ][ "nowPlaying" ].id + "'>https://www.youtube.com/watch?v=" + wLS[ "YTLiveBackground" ][ "nowPlaying" ].id +"</a>" );
			}
			break;
		default:
			break;

	}

}