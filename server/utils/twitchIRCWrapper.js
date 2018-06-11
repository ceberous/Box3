var tmi = require("tmi.js");

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

function getRandomPropertyKey( wOBJ ) { var keys = Object.keys( wOBJ ); return keys[ keys.length * Math.random() << 0 ]; }
function getRandomArrayItem( wArray ) { return wArray[ Math.floor( Math.random() * wArray.length ) ]; }

// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------

const wTwitchKeys = require( "../../personal.js" ).twitch.irc;
//https://twitchapps.com/tmi
var twitchIRCClient = new tmi.client({
    identity: {
        username: wTwitchKeys.username ,
        password: wTwitchKeys.oauth ,
    },    
    channels: ["#chessbrah"]
});
  
var EMOTES = {
    STINGS: {
        squid: "Squid1 Squid2 Squid3 Squid4",
        hearts1: "<3 <3 <3 <3",
        hearts2: "",
        energy1: "GivePLZ "
    },
    SINGLES: {
        MERICA: [ "🇺🇸" ] ,
        HELLO: [ "HeyGuys" , "VoHiYo" , "TehePelo" ] ,
        GOODBYE: [ "✌" ] ,
        KAPPA: [ "Keepo" , "Kappa" , "KappaClaus" , "KappaRoss" ] ,
        INDIFFERENT: [ "CoolStoryBob" , "SabaPing" , "SeemsGood" , "ResidentSleeper" , "Keepo" , "Kappa" , "KappaClaus" , "PunOko" ] ,
        HOPEFUL: [ "GivePLZ" , "BlessRNG" , "🙏" ] ,
        EXCITED: [ "PogChamp" , "Kreygasm" ] ,
        HEARTS: [ "<3" , "♥" , "💙" , "❤" , "💚" , "💖" , "💛" ,"💕" ] ,
        LOVE: [ "TwitchUnity" , "bleedPurple" , "😍" ] ,
        SAD: [ "FeelsBadMan" , "BibleThump" , "AngelThump" ] ,
        EMBARASED: [ "☺" ] ,
        ASHAMED: [ "FailFish" ] ,
        CRAZY: [ "HotPokket" ] ,
        CONFUSED: [ "DansGame" , "WutFace" , "D:" , "🤔" ] ,
        OFFENDED: [ "cmonBruh" ] ,
        APPROVE: [ "👍" , "👌" , " 🙌" ] ,
        DISAPROVE: [ "👎" ] ,
        UPVOTE: [ "👍" ] ,
        DOWNVOTE: [ "👎" ] ,
    }
};

function twitchSay( wChannelName , wMessage ) { 
    return new Promise( async function( resolve , reject ) {
        try {
            await twitchIRCClient.say( wChannelName , wMessage );
            resolve();
        }
        catch( error ) { console.log( error ); reject( error ); }
     }); 
}
function twitchSaySingleRepeat( wChannelName , wNumber  , wEmote  ) {
    return new Promise( async function( resolve , reject ) {
        try {
            var wSTR = "";
            for ( var i = 0; i < wNumber; ++i ) { wSTR = wSTR + wEmote + " "; }
            await twitchSay( wChannelName , wSTR );
            resolve();
        }
        catch( error ) { console.log( error ); reject( error ); }
    });
}
function twitchSayRandomSingleRepeat( wChannelName , wNumber , wEmotion  ) {
    return new Promise( async function( resolve , reject ) {
        try {
            wNumber = wNumber || 1;
            wEmotion = wEmotion || getRandomPropertyKey( EMOTES.SINGLES );
            var wEMOTE = getRandomArrayItem( EMOTES.SINGLES[ wEmotion ] );
            var wSTR = "";
            for ( var i = 0; i < wNumber; ++i ) { wSTR = wSTR + wEMOTE + " "; }
            await twitchSay( wChannelName , wSTR );
            resolve();
        }
        catch( error ) { console.log( error ); reject( error ); }
    });
}
function twitchSayRandomSinglesInEmotion( wChannelName , wNumber , wEmotion  ) {
    return new Promise( async function( resolve , reject ) {
        try {
            wNumber = wNumber || 1;
            wEmotion = wEmotion || getRandomPropertyKey( EMOTES.SINGLES );
            var wSTR = "";
            for ( var i = 0; i < wNumber; ++i ) { 
                var wEMOTE = getRandomArrayItem( EMOTES.SINGLES[ wEmotion ] );
                wSTR = wSTR + wEMOTE + " ";
            }
            await twitchSay( wChannelName , wSTR );
            resolve();
        }
        catch( error ) { console.log( error ); reject( error ); }
    });
}

function twitchSayRandomSinglesInRandomEmotion( wChannelName , wNumber  ) {
    return new Promise( async function( resolve , reject ) {
        try {
            wNumber = wNumber || 1;
            var wSTR = "";
            for ( var i = 0; i < wNumber; ++i ) {
                var wEmotion = getRandomPropertyKey( EMOTES.SINGLES );
                var wEMOTE = getRandomArrayItem( EMOTES.SINGLES[ wEmotion ] );
                wSTR = wSTR + wEMOTE + " ";
            }
            await twitchSay( wChannelName , wSTR );
            resolve();
        }
        catch( error ) { console.log( error ); reject( error ); }
    });
}

(async ()=>{
    await twitchIRCClient.connect();
    console.log( "connected" );
})();
/*console.log( to.username + " = " + text ); */
twitchIRCClient.on( "message" , function( from , to , text , message ) {  console.log( text + "\n" ); });
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------

module.exports.say                      = twitchSay;
module.exports.sayEmoteRepeat           = twitchSaySingleRepeat
module.exports.sayRandomEmoteRepeat     = twitchSayRandomSingleRepeat
module.exports.sayRandomEmotionRepeat   = twitchSayRandomSinglesInEmotion
module.exports.sayRandomEmote           = twitchSayRandomSinglesInRandomEmotion

// await sleep( 3000 );
// await twitchSaySingleRepeat( "ram_ram_ram_ram" , 5 , EMOTES.SINGLES.MERICA[0] );
// //setInterval( async function() { await twitchSayRandomSinglesInRandomEmotion( "ram_ram_ram_ram" , 140 ); } , 15000 );

// process.on( "unhandledRejection" , function( reason , p ) {
//     console.error( reason, "Unhandled Rejection at Promise" , p );
//     console.trace();
// });
// process.on( "uncaughtException" , function( err ) {
//     console.error( err , "Uncaught Exception thrown" );
//     console.trace();
// });