const { map } = require( "p-iteration" );
const rInstance = require( "./redisManager.js" ).redis;

function REDIS_GET_KEYS_FROM_PATTERN( wPattern ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.keys( wPattern , function( err , keys ) { resolve( keys ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_SET_LIST_FROM_ARRAY_BEGINNING( wKey , wArray ) {
	console.log( "Here in set to beginnign list" );
	return new Promise( function( resolve , reject ) {
		try { rInstance.lpush.apply( rInstance , [ wKey ].concat( wArray ).concat( function( err , keys ){ resolve( keys ); })); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_SET_LIST_FROM_ARRAY( wKey , wArray ) {
	// console.log( wKey );
	// console.log( wArray );
	return new Promise( function( resolve , reject ) {
		try { rInstance.rpush.apply( rInstance , [ wKey ].concat( wArray ).concat( function( err , keys ){ resolve( keys ); })); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_SET_SET_FROM_ARRAY( wKey , wArray ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.sadd.apply( rInstance , [ wKey ].concat( wArray ).concat( function( err , keys ){ resolve( keys ); })); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
// This Needs ReWritten. It fails when a large **unknown actual amount** ok keys need deleted
// Possibly limit to 10-20 at a time
function REDIS_DEL_KEYS( wKeys ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.del.apply( wKeys , function( err , results ){ if ( err ) { console.log( err ); } else { console.log( results ); resolve(); } });  }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_DELETE_KEY( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.del( wKey , function( err , keys ) { resolve( keys ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_KEY( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.get( wKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); resolve( "null" ); }
	});
}
function REDIS_GET_KEY_DE_JSON( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.get( wKey , function( err , key ) {
			try { key = JSON.parse( key ); }
			catch( err ) {}
			resolve( key ); });
		}
		catch( error ) { console.log( error ); resolve( "null" ); }
	});
}
function REDIS_GET_FROM_LIST_BY_INDEX( wKey , wIndex ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.lindex( wKey , wIndex , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_GET_MULTI_KEY( ...args ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.mget( ...args , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_SET_KEY( wKey , wVal ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.set( wKey , wVal , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); resolve( "error" ); }
	});
}
function REDIS_SET_IF_NOT_EXISTS_KEY( wKey , wVal ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.set( wKey , wVal , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); resolve( "error" ); }
	});
}
function REDIS_SET_HASH_MULTI( ...args ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.hmset( ...args , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_MULTI( wArgs ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.multi( wArgs ).exec( function( err , results ) { console.log( err ); resolve( results ); }); }
		catch( error ) { console.log( error ); resolve( "error" ); }
	});
}
function REDIS_POP_RANDOM_FROM_SET( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.spop( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_REMOVE_MATCHING_FROM_SET( wSetKey , wMatchKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.srem( wSetKey , wMatchKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_TRIM_LIST( wKey , wStart , wEnd ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.ltrim( wKey , wStart , wEnd , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_LIST_LENGTH( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.llen( wKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_FULL_LIST( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.lrange( wKey , 0 , -1 , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); resolve( "list probably doesn't even exist" ); }
	});
}
function REDIS_GET_FULL_SET( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.smembers( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_RANDOM_SET_MEMBERS( wKey , wNumber ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.srandmember( wKey , wNumber , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_POP_RANDOM_SET_MEMBERS( wKey , wNumber ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.spop( wKey , wNumber , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_INCREMENT_INTEGER( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.incr( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_LIST_R_POP( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.rpop( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_DECREMENT_INTEGER( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.decr( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_DIFFERENCE_STORE( wStoreKey , wSetKey , wCompareSetKey  ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.sdiffstore( wStoreKey , wSetKey , wCompareSetKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_STORE_UNION( wStoreKey , wSetKey1 , wSetKey2  ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.sdiffstore( wStoreKey , wSetKey1 , wSetKey2 , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SELECT_DATABASE( wNumber ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.select( wNumber , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_DELETE_MULTIPLE_PATTERNS( wKeyPatterns ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var del_keys = await map( wKeyPatterns , wPattern => REDIS_GET_KEYS_FROM_PATTERN( wPattern ) );
			del_keys = [].concat.apply( [] , del_keys );
			del_keys = del_keys.filter( Boolean );
			console.log( "\ndeleteing these keys --> \n" );
			console.log( del_keys );
			
			if ( del_keys ) {
				if ( del_keys.length > 0 ) {
					del_keys = del_keys.map( x => [ "del" , x  ] );
					await REDIS_SET_MULTI( del_keys );
				}
			}

			console.log( "done CLEANSING all R_KEYS" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_KEY_EXISTS( wKey ) {
	return new Promise( async function( resolve , reject ) {
		try {
			rInstance.exists( wKey , function( err , answer ) {
				var wFinal = false;
				if ( answer === 1 || answer === "1" ) { wFinal = true; }
				resolve( wFinal );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


function REDIS_HASH_GET_ALL( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.hgetall( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}



function REDIS_SET_LENGTH( wKey  ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.scard( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_ADD( wKey , wValue ) {
	return new Promise( function( resolve , reject ) {
		if ( !wValue ) { resolve(); return; }
		if ( wValue === "" || wValue === "undefined" ) { resolve(); return; }
		try { rInstance.sadd( wKey , wValue , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_REMOVE( wKey , wValue ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.srem( wKey , wValue , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_NEXT_IN_CIRCLULAR_LIST( wKey ) {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Get Length
			var circle_length = await REDIS_GET_LIST_LENGTH( wKey );
			if ( !circle_length ) { resolve( "Nothing in Circle List" ); return; }
			//if ( circle_length === 0 ) { resolve( "Nothing in Circle List" ); return; }
			else { circle_length = parseInt( circle_length ); }
			console.log( "Circle Length === " + circle_length.toString() );

			// 2.) Get Next and Recycle if Necessary
			var next_index = await REDIS_GET_KEY( wKey + ".INDEX" );
			console.log( "Keys Current Index === " + next_index.toString() );
			if ( !next_index ) { next_index = 0; }
			else { 
				next_index = ( parseInt( next_index ) + 1 );
				await REDIS_INCREMENT_INTEGER( wKey + ".INDEX" );
			}
			if ( next_index > ( circle_length - 1 ) ) {
				next_index = 0;
				console.log( "Recycling to Beginning of List" );
			}
			console.log( "Keys NEXT Index === " + next_index.toString() );

			const next_in_circle = await REDIS_GET_FROM_LIST_BY_INDEX( wKey , next_index );
			resolve( next_in_circle );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_LIST_R_PUSH( wKey , wValue ) {
	// console.log( wKey );
	// console.log( wValue );
	return new Promise( function( resolve , reject ) {
		try { rInstance.rpush( wKey , wValue , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}


// Adds an Array of Potential New Items to a set ,
// But compares them first to a filter set before adding
function REDIS_ADD_ARRAY_TO_SET_WITH_SET_FILTER( wDestinationKey , wFilterSetKey , wArray ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const filter_key_exists = await REDIS_KEY_EXISTS( wFilterSetKey );
			if ( !filter_key_exists ) { console.log( wFilterSetKey + " is empty or DNE" ); resolve( wArray ); }

			const wTempKey = "TMP_KEY_1." + Math.random().toString(36).substring(7);
			const wTempKey2 = "TMP_KEY_2." + Math.random().toString(36).substring(7);

			// 1.) Store NewVideos into Temp-Random Key
			await REDIS_SET_SET_FROM_ARRAY( wTempKey , wArray );

			// 2.) Redis StoreDifference
			await REDIS_SET_ADD( wTempKey2  , "GARBAGE" );
			await REDIS_SET_DIFFERENCE_STORE( wTempKey2 , wTempKey , wFilterSetKey );
			await REDIS_SET_REMOVE( wTempKey2 , "GARBAGE" );

			// 3.) Retrieve The Filtered List
			const filtered_items = await REDIS_GET_FULL_SET( wTempKey2 );

			// 4.) Add to Destination Set
			if ( filtered_items ) {
				if ( filtered_items.length > 0 ) {
					await REDIS_SET_SET_FROM_ARRAY( wDestinationKey , filtered_items );
				}
			}

			// 5.) Cleanup TempKeys
			await REDIS_DELETE_KEY( wTempKey );
			await REDIS_DELETE_KEY( wTempKey2 );
			resolve( filtered_items );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


module.exports.exists = REDIS_KEY_EXISTS;
module.exports.getKeysFromPattern = REDIS_GET_KEYS_FROM_PATTERN;
module.exports.delKeys = REDIS_DEL_KEYS;
module.exports.getKey = REDIS_GET_KEY;
module.exports.getKeyDeJSON = REDIS_GET_KEY_DE_JSON;
module.exports.delKey = REDIS_DELETE_KEY;
module.exports.trimList = REDIS_TRIM_LIST;
module.exports.getListLength = REDIS_GET_LIST_LENGTH;
module.exports.getFromListByIndex = REDIS_GET_FROM_LIST_BY_INDEX;
module.exports.removeMatchingFromSet = REDIS_REMOVE_MATCHING_FROM_SET;
module.exports.getMultiKeys = REDIS_GET_MULTI_KEY;
module.exports.getFullList = REDIS_GET_FULL_LIST;
module.exports.getFullSet = REDIS_GET_FULL_SET;
module.exports.getRandomSetMembers = REDIS_GET_RANDOM_SET_MEMBERS;
module.exports.popRandomSetMembers = REDIS_POP_RANDOM_SET_MEMBERS;
module.exports.setKey= REDIS_SET_KEY;
module.exports.setKeyIfNotExists = REDIS_SET_IF_NOT_EXISTS_KEY;
module.exports.setMulti = REDIS_SET_MULTI;
module.exports.setAdd = REDIS_SET_ADD;
module.exports.setLength = REDIS_SET_LENGTH;
module.exports.setRemove = REDIS_SET_REMOVE;
module.exports.setListFromArray = REDIS_SET_LIST_FROM_ARRAY;
module.exports.setListFromArrayBeginning = REDIS_SET_LIST_FROM_ARRAY_BEGINNING;
module.exports.setSetFromArray = REDIS_SET_SET_FROM_ARRAY;
module.exports.setHashMulti = REDIS_SET_HASH_MULTI;
module.exports.popRandomFromSet = REDIS_POP_RANDOM_FROM_SET;
module.exports.listRPOP = REDIS_LIST_R_POP;
module.exports.listRPUSH = REDIS_LIST_R_PUSH;
module.exports.incrementInteger = REDIS_INCREMENT_INTEGER;
module.exports.decrementInteger = REDIS_DECREMENT_INTEGER;
module.exports.deleteMultiplePatterns = REDIS_DELETE_MULTIPLE_PATTERNS;
module.exports.setDifferenceStore = REDIS_SET_DIFFERENCE_STORE;
module.exports.setStoreUnion = REDIS_SET_STORE_UNION;
module.exports.hashGetAll = REDIS_HASH_GET_ALL;
module.exports.nextInCircleList = REDIS_NEXT_IN_CIRCLULAR_LIST;
module.exports.setSetFromArrayWithSetFilter = REDIS_ADD_ARRAY_TO_SET_WITH_SET_FILTER;

module.exports.selectDatabase = REDIS_SELECT_DATABASE;