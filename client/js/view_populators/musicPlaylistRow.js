function musicPlaylistRowViewUpdate( wData ) {

	var PLAYLIST_MODEL = wData;

	//PLAYLIST_MODEL = JSON.parse( wData );
	// { "playlists": [ { "name": "" , "genre": "" , key: ""  } ] }
	/*
		<tr>
            <td>wNumber</td>
            <td>wName</td>
            <td>wGenre</td>
        </tr>
	*/
	var wHTMLC = "";
	var i = 0;
	for ( var wKey in PLAYLIST_MODEL[ "playlists" ] ) {
		wHTMLC = wHTMLC + "<tr>" + 
		"<td>" + i.toString() + "</td>" + 
		"<td>" + PLAYLIST_MODEL.playlists[ wKey ].name + "</td>" +
		"<td><select data-mopidy='genre' id='" + wKey + "'>" +
		"<option value='classic'>Classic</option>"+
		"<option value='edm'>EDM</option>"+
		"<option value='misc'>MISC</option>"+
		"<option value='relax'>Relax</option>"+
		"<option value='unknown'>Unknown</option>"+
		+ "</td></select>" + "</tr>";
		i = i + 1;
	}

	$( "#mopidyPlaylistsTableBody" ).html( wHTMLC );

	for ( var wKey in PLAYLIST_MODEL[ "playlists" ] ) {
		var x1 = "#" + wKey;
		$( x1 ).val( PLAYLIST_MODEL.playlists[ wKey ].genre );
	}

	$( "[data-mopidy='genre']" ).on( "change" , function() {
		console.log( this.id + " changed to --> " + this.value );
		console.log( "old genre = " + PLAYLIST_MODEL[ "playlists" ][ this.id ][ "genre" ] );
		ajaxPutJSON( "/admin/v1/mopidyupdateplaylistgenre/" + this.id + "/" + PLAYLIST_MODEL[ "playlists" ][ this.id ][ "genre" ] + "/" + this.value  );
		PLAYLIST_MODEL[ "playlists" ][ this.id ][ "genre" ] = this.value;
	});	
	
}