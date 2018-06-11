var express = require("express");
var router = express.Router();

var twitchCTRL = require( "../CONTROLLERS/twitchCTRL.js" );

router.get( '/live/' , twitchCTRL.getLiveFollowers );

// router.get( '/live/follower/add/:wID' , youtubeCTRL.addLiveFollower );
// router.get( '/live/follower/remove/:wID' , youtubeCTRL.removeLiveFollower );
// router.get( '/live/blacklist/add/:wFollower/:wID' , youtubeCTRL.addLiveBlacklist );
// router.get( '/live/blacklist/remove/:wFollower/:wID' , youtubeCTRL.removeLiveBlacklist );

module.exports = router;