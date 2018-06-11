function savedVideoRowViewUpdate() {
	
	( async function loadPlaylistRow() {
		
		console.log( wLS );
		
		//var LOCAL_VIDEO_MODEL = await P_ajaxGETJSON( "/admin/v1/getsavedvideomodel" );
		$("#workingRow").append("<div id=wChildView2></div>");
		await $("#wChildView2").load( "../../views/admin_panel/savedVideoTableRow.html" );
		
		console.log("table is loaded ???");

		
	})();



}


// <li>
//     <a href="#">Action</a>
// </li>
// <li class="disabled">
//     <a href="#">Another action</a>
// </li>
// <li class="divider">
// </li>
// <li>
//     <a href="#">Something else here</a>
// </li>