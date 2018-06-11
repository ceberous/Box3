const express = require( "express" );
const router = express.Router();

const youtubeCTRL = require( "../CONTROLLERS/youtubeCTRL.js" );

router.get( "/oauth2callback" , youtubeCTRL.oauth2callback );

router.get( "/live/videos/" , youtubeCTRL.liveGetVideos );
router.get( "/live/followers/" , youtubeCTRL.liveGetFollowers );
router.get( "/live/follower/add/:wID/" , youtubeCTRL.liveAddFollower );
router.get( "/live/follower/remove/:wID/" , youtubeCTRL.liveRemoveFollower );
router.get( "/live/blacklist/" , youtubeCTRL.liveGetBlacklist );
router.get( "/live/blacklist/add/:wID/" , youtubeCTRL.liveAddBlacklist );
router.get( "/live/blacklist/remove/:wID/" , youtubeCTRL.liveRemoveBlacklist );

router.get( "/standard/update/" , youtubeCTRL.standardUpdate );
router.get( "/standard/que/" , youtubeCTRL.standardGetQue );
router.get( "/standard/videos/" , youtubeCTRL.standardGetQue );
router.get( "/standard/video/:wID/" , youtubeCTRL.standardGetVideoInfo );
router.get( "/standard/video/:wID/update/:wKey/:wValue/" , youtubeCTRL.standardUpdateVideoInfo );
router.get( "/standard/video/:wID/delete/" , youtubeCTRL.standardDeleteVideo );
router.get( "/standard/followers/" , youtubeCTRL.standardGetFollowers );
router.get( "/standard/follower/add/:wID/" , youtubeCTRL.standardAddFollower );
router.get( "/standard/follower/remove/:wID/" , youtubeCTRL.standardRemoveFollower );
router.get( "/standard/blacklist/" , youtubeCTRL.standardGetBlacklist );
router.get( "/standard/blacklist/add/:wID/" , youtubeCTRL.standardAddBlacklist );
router.get( "/standard/blacklist/remove/:wID/" , youtubeCTRL.standardRemoveBlacklist );

router.get( "/currated/que/" , youtubeCTRL.curratedGetQue );
router.get( "/currated/list/" , youtubeCTRL.curratedGetQue );
router.get( "/currated/videos/" , youtubeCTRL.curratedGetQue );
router.get( "/currated/add/:wID" , youtubeCTRL.curratedAddToQue );
router.get( "/currated/delete/:wID" , youtubeCTRL.curratedDeleteFromQue );
router.get( "/currated/import-playlist/:wID" , youtubeCTRL.curratedImportPlaylistID );

module.exports = router;