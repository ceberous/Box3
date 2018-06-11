const express = require( "express" );
const router = express.Router();

const specialCTRL = require( "../CONTROLLERS/specialCTRL.js" );

router.get( "/router-reboot/" , specialCTRL.rebootRouter );
router.get( "/restart-pm2/" , specialCTRL.restartPM2 );
router.get( "/tv-power/" , specialCTRL.tvPower );

router.put( "/os/:task" , specialCTRL.osCommand  );

module.exports = router;