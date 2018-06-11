var express = require("express");
var router = express.Router();

var adminPanel = require( "../CONTROLLERS/adminPanelCTRL.js" );

router.get( '/getstatus/' , adminPanel.getStatus );

router.get( '/mopidygetplaylists/' , adminPanel.getMopidyPlaylists );
router.get( '/mopidypause' , adminPanel.mopidyPause );
router.get( '/mopidyresume' , adminPanel.mopidyResume );
router.get( '/mopidystop' , adminPanel.mopidyStop );
router.get( '/mopidyprevioussong' , adminPanel.mopidyPreviousSong );
router.get( '/mopidynextsong' , adminPanel.mopidyNextSong );
router.put( '/mopidystartplaylist/:genre/:playlistID' , adminPanel.mopidyStartPlaylist );
router.put( '/mopidystartnewTask/:task' , adminPanel.mopidyStartNewTask );
router.put( '/mopidyupdateplaylistgenre/:playlistID/:oldGenre/:newGenre' , adminPanel.mopidyUpdatePlaylistGenre );

router.get( '/getsavedvideomodel' , adminPanel.getSavedVideoModel );

module.exports = router;