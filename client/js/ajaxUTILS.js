function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

function ajaxGetJSON( wURL , wCB ) {
	console.log("about to send ajaxGET");
	$.ajax({
        type: "GET",
        url: wURL,
        //headers: {"Authorization" : "OAuth " + sessionId},
        //crossDomain : true,
        dataType: 'json',
        success: function (responseData) {
        	console.log("are we ever successfull ?");
            if ( wCB ) { wCB( responseData ); }
        	else { console.log( responseData ); }
        },
        error: function (request, status, error) {
        	console.log("ya fucking right you retard" );
        	console.log( request );
        	console.log( status );
        	console.log( error );
			if ( wCB ) { wCB( request.responseText ); }
        	else { console.log( request.responseText ); }
        }
    });
}

function ajaxPutJSON( wURL , wDataOBJ , wCB ) {
	$.ajax({
        type: "PUT",
        url: wURL,
        data: wDataOBJ ? $.param( wDataOBJ ) : "",
        success: function ( responseData , status , xhr ) {
        	if ( wCB ) { wCB( responseData ); }
        	else { console.log( responseData ); return responseData; }
        },
        error: function (request, status, error) {
			if ( wCB ) { wCB( request.responseText ); }
        	else { console.log( request.responseText ); return request.responseText; }
        }
    });
}

function ajaxPostJSON( wURL , wDataOBJ , wCB ) {
	$.ajax({
        type: "POST",
        url: wURL,
        headers : {
            //'Authorization' : "OAuth " + sessionId,
            'Content-Type' : 'application/json'
        },
        //crossDomain : true,
        data: JSON.stringify( wDataOBJ ),
        dataType: 'json',
        success: function ( responseData , status , xhr ) {
        	if ( wCB ) { wCB( responseData ); }
        	else { console.log( responseData ); return responseData; }
        },
        error: function (request, status, error) {
			if ( wCB ) { wCB( request.responseText ); }
        	else { console.log( request.responseText ); return request.responseText; }
        }
    });
}


function P_ajaxGETJSON( wURL ) {
    return new Promise( function( resolve , reject ) {
        try {
            console.log("about to send ajaxGET");
            $.ajax({
                type: "GET",
                url: wURL,
                //headers: {"Authorization" : "OAuth " + sessionId},
                //crossDomain : true,
                dataType: 'json',
                success: function (responseData) {
                    console.log("are we ever successfull ?");
                    console.log( responseData );
                    resolve( responseData );
                },
                error: function (request, status, error) {
                    console.log("ya fucking right you retard" );
                    console.log( request );
                    console.log( status );
                    console.log( error );
                    console.log( request.responseText );
                    reject( request.responseText );
                }
            });
        }
        catch( error ) { console.log( error ); reject( error ); }
    });
}

function P_ajaxPutJSON( wURL , wDataOBJ ) {
    return new Promise( function( resolve , reject ) {
        try {
            $.ajax({
                type: "PUT",
                url: wURL,
                data: wDataOBJ ? $.param( wDataOBJ ) : "",
                success: function ( responseData , status , xhr ) {
                    console.log( responseData );
                    resolve( responseData );
                },
                error: function (request, status, error) {
                    console.log( request.responseText );
                    if ( wCB ) { wCB( request.responseText ); }
                    reject( request.responseText );
                }
            });
        }
        catch( error ) { console.log( error ); reject( error ); }
    });
}

function P_ajaxPostJSON( wURL , wDataOBJ ) {
    return new Promise( function( resolve , reject ) {
        try {
            $.ajax({
                type: "POST",
                url: wURL,
                headers : {
                    //'Authorization' : "OAuth " + sessionId,
                    'Content-Type' : 'application/json'
                },
                //crossDomain : true,
                data: JSON.stringify( wDataOBJ ),
                dataType: 'json',
                success: function ( responseData , status , xhr ) {
                    console.log( responseData );
                    resolve( responseData );
                },
                error: function (request, status, error) {
                    console.log( request.responseText );
                    reject( request.responseText );
                }
            });            
        }
        catch( error ) { console.log( error ); reject( error ); }
    });
}