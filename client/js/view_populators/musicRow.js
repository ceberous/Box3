function musicRowViewUpdate() {
	
	( async function loadPlaylistRow() {
		
		var PLAYLIST_MODEL = await P_ajaxGETJSON( "/admin/v1/mopidygetplaylists" );
		$("#workingRow").append("<div id=wChildView2></div>");
		
		$("#wChildView2").load( "../../views/admin_panel/musicPlaylistRow.html" , function() {
			musicPlaylistRowViewUpdate( PLAYLIST_MODEL );
		});
		
	})();

	$("#mopidyPause").on( "click" , function() {
		ajaxGetJSON( "/admin/v1/mopidypause" );
	});

	$("#mopidyResume").on( "click" , function() {
		ajaxGetJSON( "/admin/v1/mopidyresume" );
	});

	$("#mopidyStop").on( "click" , function() {
		ajaxGetJSON( "/admin/v1/mopidystop" );
	});	

}